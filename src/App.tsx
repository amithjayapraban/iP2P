import { useEffect, useRef, useState } from "react";
import "./App.css";
import { generateUsername } from "unique-username-generator";
import Info from "./components/Info";
import Logo from "./components/Logo";
import { getDeviceType } from "./utils/getDeviceType";
import { Analytics } from "@vercel/analytics/react";
import { WebSocketMessage, FileWithMetadata } from "./types/app";
import { Footer } from "./components/Footer";
import { Toast } from "./components/Toast";
import { PeerList } from "./components/PeerList";
import { FileSendingSection } from "./components/FileSendingSection";
import { FileReceivingSection } from "./components/FileReceivingSection";

const CHUNK_SIZE = 64000; // 64 KB
const BUFFER_SIZE = 1024 * 1024 * 4; // 4 MB
const MESSAGE_COMPLETED = "completed";

function App() {
  const [myName, setMyName] = useState("");
  // const [destination, setDestination] = useState("");
  const destination = useRef("");
  const [peers, setPeers] = useState<string[]>([]);
  const [peerConnected, setPeerConnected] = useState(false);
  const [recieverDeviceType, setRecieverDeviceType] = useState("");
  const production = true;
  const name = useRef("");
  const baseURL = production
    ? `https://${window.location.hostname}`
    : "http://192.168.18.27:3003";
  const wsURL = production ? "wss://fyla.koyeb.app" : "ws://localhost:8080";
  const getIceServerConfig = () => ({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  const initializeApp = () => {
    name.current = generateUsername("", 0, 8);
    setMyName(name.current);
    openSignaling();
  };

  useEffect(() => {
    initializeApp();
    return () => {
      ws.current?.close();
    };
  }, []);

  const ws = useRef<WebSocket | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection(getIceServerConfig());

      peerConnection.current.onicecandidate = async (e) => {
        if (e.candidate) {
          const { candidate, sdpMid } = e.candidate;
          ws.current?.send(
            JSON.stringify({
              id: destination.current,
              type: "candidate",
              candidate,
              mid: sdpMid,
            })
          );
        }
      };

      peerConnection.current.addEventListener(
        "connectionstatechange",
        (event) => {
          if (
            peerConnection.current?.connectionState === "disconnected" ||
            peerConnection.current?.connectionState === "failed"
          ) {
            setPeerConnected(false);
            console.error("WebRTC", peerConnection.current.connectionState);
          }

          if (peerConnection.current?.connectionState === "connected") {
            setPeerConnected(true);
            console.log("WebRTC", peerConnection.current.connectionState);
          }
        }
      );
    }

    return () => {
      peerConnection.current?.close();
      peerConnection.current = null;
    };
  }, []);

  const openSignaling = () => {
    const device = getDeviceType();
    const url = `${wsURL}/${name.current}/${device}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => console.log("WebSocket Open");
    ws.current.onerror = () => {
      setPeerConnected(false);
      console.error("WebSocket Error");
    };
    ws.current.onclose = () => {
      setPeerConnected(false);
      console.error("WebSocket Disconnected");
    };
    ws.current.onmessage = handleWebSocketMessage;
  };

  const handleWebSocketMessage = (e: MessageEvent<string>) => {
    if (typeof e.data !== "string") return;
    const message: WebSocketMessage = JSON.parse(e.data);
    const { id, type } = message;

    if (type === "peers" && message.keys) {
      setPeers(
        message.keys.filter((key: string) => key.split("%")[0] !== name.current)
      );
    }

    switch (type) {
      case "offer":
        handleOfferMessage(message, id);
        break;
      case "answer":
        handleAnswerMessage(message);
        break;
      case "candidate":
        handleCandidateMessage(message);
        break;
    }
  };

  const handleOfferMessage = async (message: WebSocketMessage, id: string) => {
    if (!peerConnection.current) return;
    await peerConnection.current.setRemoteDescription({
      sdp: message.description,
      type: message.type as RTCSdpType,
    });
    destination.current = id;
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    ws.current?.send(
      JSON.stringify({
        id,
        type: "answer",
        description: answer.sdp,
      })
    );
  };

  const handleAnswerMessage = async (message: WebSocketMessage) => {
    if (!peerConnection.current) return;
    await peerConnection.current.setRemoteDescription({
      sdp: message.description,
      type: message.type as RTCSdpType,
    });
  };

  const handleCandidateMessage = async (message: WebSocketMessage) => {
    if (!peerConnection.current) return;

    try {
      if (
        peerConnection.current.signalingState === "stable" ||
        peerConnection.current.signalingState === "have-remote-offer"
      ) {
        await peerConnection.current.addIceCandidate({
          candidate: message.candidate,
          sdpMid: message.mid,
        });
      } else {
        console.warn(
          "Cannot add ICE candidate. Current signaling state:",
          peerConnection.current.signalingState
        );
      }
    } catch (error) {
      console.error("Failed to add ICE candidate:", error);
    }
  };
  const dataChannel = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    if (!dataChannel.current && peerConnection.current) {
      dataChannel.current = peerConnection.current.createDataChannel("mydata");
      dataChannel.current.bufferedAmountLowThreshold = 1024 * 800;
    }

    return () => {
      dataChannel.current?.close();
      dataChannel.current = null;
    };
  }, []);

  const [receivingFile, setReceivingFile] = useState<string | null>(null);

  useEffect(() => {
    if (!peerConnection.current) return;

    peerConnection.current.ondatachannel = (e: RTCDataChannelEvent) => {
      const receivingChannel: RTCDataChannel = e.channel;
      const fileChunks: BlobPart[] = [];
      let blobUrl: string | null = null;
      let file: Blob | null = null;
      let total_chunks: number = 0;

      const messageHandler = (e: MessageEvent) => {
        if (e.data.toString()) {
          if (e.data.toString().includes("len")) {
            total_chunks = Number(e.data.toString().split("%")[1]);
          }
          if (e.data.toString().includes("type:")) {
            setReceivingFile(e.data.toString().substring(5));
          }
        }

        if (e.data.toString() === MESSAGE_COMPLETED) {
          [offset.current, total_chunks] = [0, 0];

          console.log("File Received");

          file = new Blob(fileChunks);
          blobUrl = URL.createObjectURL(file);

          const fileSaveButton = document.getElementById(
            "fileSaveButton"
          ) as HTMLAnchorElement;

          const fileCancelButton = document.getElementById(
            "fileCancelButton"
          ) as HTMLElement;

          if (fileSaveButton) {
            fileSaveButton.href = blobUrl;
            fileSaveButton.onclick = () => {
              console.log("File saved successfully!");
              setTimeout(() => {
                blobUrl && URL.revokeObjectURL(blobUrl);
                file = null;
                blobUrl = null;
                fileSaveButton.href = "#";
                fileChunks.length = 0;
                setReceivingFile(null);
                receivingChannel.send("next_file");
              }, 1000);
            };
          }

          if (fileCancelButton) {
            fileCancelButton.onclick = () => {
              console.log("Skipped saving a file");
              blobUrl && URL.revokeObjectURL(blobUrl);
              file = null;
              blobUrl = null;
              fileSaveButton.href = "#";
              fileChunks.length = 0;
              setReceivingFile(null);
              setProgress(0);
              receivingChannel.send("next_file");
            };
          }
        }
        if (
          e.data.toString() !== MESSAGE_COMPLETED &&
          !e.data.toString().includes("type") &&
          e.data.toString() !== `undefined` &&
          !e.data.toString().includes("len")
        ) {
          offset.current += CHUNK_SIZE;
          updateProgress(total_chunks);
          fileChunks.push(e.data);
        }
      };

      receivingChannel.addEventListener("message", (event: MessageEvent) => {
        messageHandler(event);
      });
    };
  }, [peerConnection.current]);

  async function offerPeerConnection(id: string) {
    if (!peerConnection.current) return;
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    ws.current?.send(
      JSON.stringify({
        id: `${id}`,
        type: "offer",
        description: offer.sdp,
      })
    );
  }

  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [fileIndex, setFileIndex] = useState(0);
  const currentFileIndex = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    currentFileIndex.current = 0;
    setFileIndex(0);
  }, [files]);

  useEffect(() => {
    currentFileIndex.current = fileIndex; // Keep the ref updated with the latest state
  }, [fileIndex]);

  const sendFiles = () => {
    sendFile(files[currentFileIndex.current]);
    if (!dataChannel.current) {
      console.error("Data channel is not initialized");
      return;
    }

    if (!dataChannel.current.onmessage) {
      dataChannel.current.addEventListener("message", (event: MessageEvent) => {
        if (currentFileIndex.current < files.length) {
          sendFile(files[currentFileIndex.current]);
        } else {
          setTimeout(() => showToast("File transfer was successful"), 2000);
          setTimeout(() => setFiles([]), 1000);
        }
      });
    }
  };

  const offset = useRef(0);

  const file = useRef<FileWithMetadata | null>(null);

  const sendFile = (f: FileWithMetadata) => {
    if (!dataChannel.current) {
      console.error("Data channel is not initialized");
      return;
    }

    file.current = f;
    offset.current = 0;
    dataChannel.current.send(`len%${f.size}`);
    dataChannel.current.send(`type:${file.current.name}`);
    sendFileChunks(file.current);
  };

  async function sendFileChunks(file: FileWithMetadata) {
    if (!dataChannel.current) {
      console.error("Data channel is not initialized");
      return;
    }
    const bufferSize = ["iPhone", "Android"].includes(recieverDeviceType)
      ? BUFFER_SIZE
      : BUFFER_SIZE;

    while (offset.current < file.size) {
      while (dataChannel.current.bufferedAmount > bufferSize) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const chunk = file.slice(offset.current, offset.current + CHUNK_SIZE);
      const reader = new FileReader();
      const arrayBuffer: ArrayBuffer = await new Promise((resolve) => {
        reader.onload = function (event) {
          resolve(event.target?.result as ArrayBuffer);
        };
        reader.readAsArrayBuffer(chunk);
      });
      dataChannel.current.send(arrayBuffer);
      offset.current += CHUNK_SIZE;
      updateProgress(file.size);
    }
    setFileIndex((prevIndex) => prevIndex + 1);
    finalizeFileTransfer();
  }

  const updateProgress = (fileSize: number) => {
    setProgress(Math.min((offset.current / fileSize) * 100, 100));
  };

  const finalizeFileTransfer = () => {
    if (!dataChannel.current) {
      console.error("Data channel is not initialized");
      return;
    }
    dataChannel.current.send(MESSAGE_COMPLETED);
    offset.current = 0;
    setProgress(0);
  };

  const showToast = (message: string) => {
    const toast = document.querySelector(".toast") as HTMLDivElement;
    toast.innerHTML = message;
    toast.classList.toggle("completed_animation");
    setTimeout(() => toast.classList.toggle("completed_animation"), 2000);
  };

  const handlePeerClick = async (peer: string) => {
    setRecieverDeviceType(peer.split("%")[1]);
    destination.current = peer;
    offerPeerConnection(peer);
  };

  return (
    <div className="flex flex-col  shadow-sm  app relative text-textc  h-[100dvh] ">
      <Analytics />
      <Toast />
      <section className="flex items-center p-6 justify-between w-full ">
        <Logo baseURL={baseURL} peerConnected={peerConnected} />
        <div className="flex items-center md:gap-4 gap-4">
          <span
            className={`w-2 h-2  ${
              peerConnected ? "bg-brandgreen" : "bg-orange-600"
            }  rounded-full`}
          ></span>
          <Info />
        </div>
      </section>

      {!peerConnected ? (
        <PeerList
          destination={destination.current}
          peers={peers}
          handlePeerClick={handlePeerClick}
          peerConnected={peerConnected}
        />
      ) : receivingFile ? (
        <FileReceivingSection
          receivingFile={receivingFile}
          setReceivingFile={setReceivingFile}
          progress={progress}
        />
      ) : (
        <FileSendingSection
          progress={progress}
          fileIndex={fileIndex}
          destination={destination.current}
          files={files}
          sendFiles={sendFiles}
          setFiles={setFiles}
        />
      )}
      <Footer myName={myName} />
    </div>
  );
}

export default App;
