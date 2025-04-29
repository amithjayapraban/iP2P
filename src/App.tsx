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
import { ProgressBar } from "./components/ProgressBar";
import { PeerList } from "./components/PeerList";
import { FileTransferSection } from "./components/FileTransferSection";

const CHUNK_SIZE = 64000; // 64 KB
const BUFFER_SIZE = 1024 * 1024 * 4; // 4 MB
const MESSAGE_COMPLETED = "completed";

function App() {
  const [myName, setMyName] = useState("");
  const [destination, setDestination] = useState("");
  const [peers, setPeers] = useState<string[]>([]);
  const [peerConnected, setPeerConnected] = useState(false);
  const [recieverDeviceType, setRecieverDeviceType] = useState("");
  const production = true;
  const name = useRef("");
  const baseURL = production
    ? `https://${window.location.hostname}`
    : "http://192.168.18.27:3003";
  const wsURL = production
    ? "wss://fyla.koyeb.app"
    : "ws://localhost:8080";
  const getIceServerConfig = () => ({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  const initializeApp = () => {
    name.current = generateUsername("", 0, 8);
    setMyName(name.current);
    const body = document.querySelector("body") as HTMLBodyElement;
    body.setAttribute("data-theme", "dark");
    // const themeColor: any = document.querySelector('meta[name="theme-color"]');
    // const mode = body.getAttribute("data-theme");
    // const color = mode == "dark" ? "#121212" : "#fafafa";
    // themeColor.setAttribute("content", color);
    openSignaling();
  };

  useEffect(() => {
    initializeApp();
    return () => {
      ws.current?.close();
    };
  }, []);

  const ws = useRef<WebSocket | null>(null);
  const peerConnection = useRef(new RTCPeerConnection(getIceServerConfig()));

  const openSignaling = () => {
    const device = getDeviceType();
    const url = `${wsURL}/${name.current}/${device}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => console.log("WebSocket Open");
    ws.current.onerror = () => console.error("WebSocket Error");
    ws.current.onclose = () => console.error("WebSocket Disconnected");
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
    await peerConnection.current.setRemoteDescription({
      sdp: message.description,
      type: message.type as RTCSdpType,
    });
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    setDestination(id);
    ws.current?.send(
      JSON.stringify({
        id,
        type: "answer",
        description: answer.sdp,
      })
    );
  };

  const handleAnswerMessage = async (message: WebSocketMessage) => {
    await peerConnection.current.setRemoteDescription({
      sdp: message.description,
      type: message.type as RTCSdpType,
    });
  };

  const handleCandidateMessage = async (message: WebSocketMessage) => {
    try {
      await peerConnection.current.addIceCandidate({
        candidate: message.candidate,
        sdpMid: message.mid,
      });
    } catch (error) {
      console.error("Failed to add ICE candidate:", error);
    }
  };

  const dataChannel = peerConnection.current.createDataChannel("mydata");
  dataChannel.bufferedAmountLowThreshold = 1024 * 800;

  peerConnection.current.onicecandidate = async (e) => {
    // console.log(e, "once");

    if (e.candidate) {
      const { candidate, sdpMid } = e.candidate;
      ws.current?.send(
        JSON.stringify({
          id: destination,
          type: "candidate",
          candidate,
          mid: sdpMid,
        })
      );
    }
  };

  peerConnection.current.addEventListener("connectionstatechange", (event) => {
    if (
      peerConnection.current.connectionState === "disconnected" ||
      peerConnection.current.connectionState === "failed"
    ) {
      setPeerConnected(false);
      console.error("WebRTC", peerConnection.current.connectionState);
    }

    if (peerConnection.current.connectionState === "connected") {
      setPeerConnected(true);
      console.log("WebRTC", peerConnection.current.connectionState);
    }
  });

  async function offerPeerConnection(id: string) {
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

  let files: FileWithMetadata[] = [];

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    files = e.target.files ? [...e.target.files] : [];
    sendFiles();
  };

  const sendFiles = () => {
    const progressBar = document.getElementById(
      "progress-bar"
    ) as HTMLSpanElement;
    progressBar.style.width = `0%`;
    progressBar.classList.remove("w-0");
    const fileToSend = files.shift();
    if (fileToSend) {
      sendFile(fileToSend);
    }

    dataChannel.addEventListener("message", (event: MessageEvent) => {
      const nextFile = files.shift();
      if (nextFile) {
        sendFile(nextFile);
      }
      const prog = document.getElementById("progress-bar") as HTMLSpanElement;
      prog.style.width = "0";
      // files.length > 0 && send(files.shift());
      // files.length > 0 && console.log(files[0]);
    });
  };

  const offset = useRef(0);

  const file = useRef<FileWithMetadata | null>(null);

  const sendFile = (f: FileWithMetadata) => {
    file.current = f;
    offset.current = 0;
    dataChannel.send(`len%${f.size}`);
    dataChannel.send(`type:${file.current.name}`);
    sendFileChunks(file.current);
  };

  async function sendFileChunks(file: FileWithMetadata) {
    const bufferSize = ["iPhone", "Android"].includes(recieverDeviceType)
      ? BUFFER_SIZE
      : BUFFER_SIZE;
    const progressBar = document.getElementById(
      "progress-bar"
    ) as HTMLSpanElement;
    const progressPercentage = document.getElementById(
      "percentage"
    ) as HTMLElement;
    progressBar.style.opacity = "1";

    while (offset.current < file.size) {
      while (dataChannel.bufferedAmount > bufferSize) {
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
      dataChannel.send(arrayBuffer);
      updateProgressBar(progressBar, progressPercentage, file.size);
      offset.current += CHUNK_SIZE;
    }
    finalizeFileTransfer(progressBar, progressPercentage);
  }

  const updateProgressBar = (
    progressBar: HTMLElement,
    progressPercentage: HTMLElement,
    fileSize: number
  ) => {
    progressBar.style.width = `${(offset.current / fileSize) * 100}%`;
    let percent = Math.min((offset.current / fileSize) * 100, 100);
    progressPercentage.textContent = `${percent.toFixed(1)}%`;
  };

  const finalizeFileTransfer = (
    progressBar: HTMLElement,
    progressPercentage: HTMLElement
  ) => {
    dataChannel.send(MESSAGE_COMPLETED);
    progressPercentage.textContent = `100%`;
    offset.current = 0;
    showToast("File Sent");
    resetProgressBar(progressBar, progressPercentage);
  };

  const showToast = (message: string) => {
    const toast = document.querySelector(".toast") as HTMLDivElement;
    toast.innerHTML = message;
    toast.classList.toggle("completed_animation");
    setTimeout(() => toast.classList.toggle("completed_animation"), 2000);
  };

  const resetProgressBar = (
    progressBar: HTMLElement,
    progressPercentage: HTMLElement
  ) => {
    setTimeout(() => {
      progressPercentage.textContent = ``;
      progressBar.classList.add("w-0");
      progressBar.style.width = `0%`;
    }, 1000);
  };

  const type = useRef("");

  peerConnection.current.ondatachannel = (e: RTCDataChannelEvent) => {
    const receivingChannel: RTCDataChannel = e.channel;
    const fileChunks: BlobPart[] = [];
    let blobUrl: string | null = null;
    let file: Blob | null = null;
    let total_chunks: number = 0;

    const progressPercentage = document.getElementById(
      "percentage"
    ) as HTMLElement;
    const progressBar = document.getElementById(
      "progress-bar"
    ) as HTMLSpanElement;

    const messageHandler = (e: MessageEvent) => {
      if (e.data.toString()) {
        if (e.data.toString().includes("len")) {
          total_chunks = Number(e.data.toString().split("%")[1]);
        }
        if (e.data.toString().includes("type:")) {
          console.log(e.data, "type");
          type.current = e.data.toString();
        }
      }

      if (e.data.toString() === MESSAGE_COMPLETED) {
        [offset.current, total_chunks] = [0, 0];
        console.log("File Received");
        file = new Blob(fileChunks);
        blobUrl = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = type.current.substring(5);
        document.body.appendChild(link);
        link.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
        showToast("File Received");

        setTimeout(() => {
          blobUrl && URL.revokeObjectURL(blobUrl);
          file = null;
          blobUrl = null;
          fileChunks.length = 0;
          document.body.removeChild(link);
          type.current = "";
          receivingChannel.send("next_file");
          resetProgressBar(progressBar, progressPercentage);
        }, 1000);
      }
      if (
        e.data.toString() !== MESSAGE_COMPLETED &&
        !e.data.toString().includes("type") &&
        e.data.toString() !== `undefined` &&
        !e.data.toString().includes("len")
      ) {
        offset.current += CHUNK_SIZE;
        updateProgressBar(progressBar, progressPercentage, total_chunks);
        fileChunks.push(e.data);
      }
    };
    receivingChannel.addEventListener("message", (event: MessageEvent) => {
      messageHandler(event);
    });
  };

  const handlePeerClick = (peer: string) => {
    setRecieverDeviceType(peer.split("%")[1]);
    offerPeerConnection(peer);
    setDestination(peer);
  };
  return (
    <div className="flex flex-col  shadow-sm  app relative text-textc  h-[100dvh] ">
      <Analytics />
      <Toast />

      <section className="flex items-center p-6 justify-between w-full ">
        <Logo baseURL={baseURL} peerConnected={peerConnected} />
        <div className="flex items-center md:gap-8 gap-6">
          <Info />
        </div>
      </section>

      <ProgressBar />

      {!peerConnected ? (
        <PeerList peers={peers} handlePeerClick={handlePeerClick} />
      ) : (
        <FileTransferSection destination={destination} addFiles={addFiles} />
      )}
      <Footer myName={myName} />
    </div>
  );
}

export default App;
