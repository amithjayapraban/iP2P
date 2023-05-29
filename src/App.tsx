import { useEffect, useRef, useState } from "react";
import "./App.css";
import { generateUsername } from "unique-username-generator";
import { generateFromString } from "generate-avatar";
import Info from "./components/Info";
import Logo from "./components/Logo";
import Foot from "./components/Foot";
import MobileDetect from "mobile-detect";
import { getDeviceType } from "./utils/getDeviceType";
import Modal from "./components/Modal";
import ToggleTheme from "./components/toggleTheme";
function App() {
  const [myname, setmyName] = useState("");
  const [destination, setDestination] = useState("");
  const [peers, setPeers] = useState<string[]>([]);
  const [connection, setConnection] = useState(false);
  const production = false;
  var name = useRef("");
  const baseURL = production
    ? `https://${window.location.hostname}`
    : "http://192.168.18.27:3003";
  const wsURL = production
    ? "wss://ip2p-amithjayapraban.koyeb.app"
    : "ws://localhost:8080";
  var configuration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };
  const peerConnectionMap: any = {};
  const dataChannelMap: any = {};

  useEffect(() => {
    //Generates a unique username thats used as room name
    name.current = generateUsername(" ", 0, 5);
    setmyName(name.current);
    let body: any = document.querySelector("body");

    openSignaling();
    if (window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        body.setAttribute("data-theme", "dark");
      } else {
        body.setAttribute("data-theme", "light");
      }
    }
    const themeColor: any = document.querySelector('meta[name="theme-color"]');
    let mode = body.getAttribute("data-theme");
    const color = mode == "dark" ? "#121212" : "#fafafa";
    themeColor.setAttribute("content", color);
    window.document.title = "iP2P | Not connected";
  }, []);

  var ws: any = useRef();
  // const peerConnection_client = useRef(new RTCPeerConnection(configuration));
  var peerConnection = useRef(new RTCPeerConnection(configuration));
  function openSignaling() {
    let device = getDeviceType();
    const url = `${wsURL}/${name.current}/${device}`;
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("ws open");
    ws.current.onerror = () => console.error("WebSocket err");
    ws.current.onclose = () => console.error("WebSocket disconnected");
    ws.current.onmessage = (e: any) => {
      if (typeof e.data != "string") return;
      const message = JSON.parse(e.data);

      const { id, type } = message;

      if (type === "peers") {
        setPeers(
          message.keys.filter((key: string) => {
            return key.split("%")[0] !== name.current;
          })
        );
      }

      switch (type) {
        case "offer":
          {
            peerConnection.current.setRemoteDescription({
              sdp: message.description,
              type: message.type,
            });
            const a = async () => {
              const answer = await peerConnection.current.createAnswer();
              await peerConnection.current.setLocalDescription(answer);
              setDestination(id);
              console.log(id, "id");
              ws.current.send(
                JSON.stringify({
                  id,
                  type: "answer",
                  description: answer.sdp,
                })
              );
            };
            a();
          }
          break;
        case "answer":
          peerConnection.current.setRemoteDescription({
            sdp: message.description,
            type: message.type,
          });
          break;

        case "candidate":
          peerConnection.current.addIceCandidate({
            candidate: message.candidate,
            sdpMid: message.mid,
          });
          break;
      }
    };
  }

  const dataChannel = peerConnection.current.createDataChannel("mydata");
  dataChannel.addEventListener("open", (event) => {
    window.document.title = "iP2P | Connected ⚡";
    setConnection(true);
    console.log("dc open");
  });
  dataChannel.addEventListener("close", (event) => {
    console.log("dc closed");
    window.document.title = "iP2P | Disconnected";
    setConnection(false);
  });

  peerConnection.current.onicecandidate = async (e) => {
    // console.log(e, "once");

    if (e.candidate) {
      const { candidate, sdpMid } = e.candidate;
      ws.current.send(
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
    console.log(peerConnection.current.connectionState, "connectionState");
    peerConnection.current.connectionState === "disconnected"
      ? (window.document.title = "iP2P | Disconnected")
      : "";
    peerConnection.current.connectionState === "connected"
      ? (window.document.title = "iP2P | Connected ⚡")
      : "";
  });

  async function offerPeerConnection(id: string) {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    ws.current.send(
      JSON.stringify({
        id: `${id}`,
        type: "offer",
        description: offer.sdp,
      })
    );
  }

  // const dataChannel = peerConnection.current.createDataChannel("mydata");
  // dataChannel.bufferedAmountLowThreshold = 1024;
  // dataChannel.addEventListener("open", (event) => {});
  var file: any;
  //Web worker
  const myWorker = new Worker("/worker.js");
  const fileAdd = (e: any) => {
    e.preventDefault();
    file = e.target.files;
    var prog: any = document.getElementById("progress");
    prog.style.width = `0%`;

    Sendmsg(e);
  };
  // var sendQueue: any = [];

  const Sendmsg = (e: any) => {
    let i = 0;
    let n = file && file.length - 1;
    e.preventDefault();
    if (window.Worker) {
      myWorker.postMessage(file[0]);
    }
    var prog1: any = document.querySelector(".progress");
    prog1.classList.remove("w-0");
    var prog: any = document.getElementById("progress");
    prog.style.opacity = "1";
    // document
    //   .querySelectorAll("#send_cntrl")
    //   ?.forEach((e: any) => e.setAttribute("disabled", "disabled"));
    // document.querySelectorAll(".send_btn")[0].innerHTML = "Sending";

    myWorker.onmessage = (e) => {
      if (e.data.toString().includes("len")) {
        dataChannel.send(`len%${Math.ceil(e.data.toString().split("%")[1])}`);
      }
      if (e.data.toString() === "completed") {
        console.log(e.data.toString());
        completedActions();
        dataChannel.send(`type:${file[i].name}`);
        i++;
        dataChannel.send("completed");

        //  sendRem();
      }

      prog.style.width = `${Math.abs(e.data.w)}%`;

      console.count("chunks");

      dataChannel.send(e.data.chunk);
    };
    dataChannel.addEventListener("message", (event) => {
      console.log("got msg from client", event);
      if (window.Worker) {
        i <= n && myWorker.postMessage(file[i]);
      }
    });
    // File transfer animation

    let name: any = document.querySelector(".toast");
    name.innerHTML = "Transfer Completed ⚡";
  };

  function completedActions() {
    {
      setTimeout(() => {
        var prog: any = document.getElementById("progress");

        prog.style.width = "0";
      }, 3000);
      document.querySelector(".toast")?.classList.toggle("completed_animation");
      setTimeout(() => {
        document
          .querySelector(".toast")
          ?.classList.toggle("completed_animation");
      }, 3000);
    }
  }

  // peerConnection_client.current.ondatachannel = (e: any) => {
  //   var clientDc: any = e.channel;

  var type = useRef("");
  var blobUrl: any;

  peerConnection.current.ondatachannel = (e: any) => {
    var clientDc: any = e.channel;
    var file;
    var fileChunks: any = [];
    var total_chunks: number,
      iterator: number = 0;
    clientDc.addEventListener("message", (e: any) => {
      var prog1: any = document.querySelector(".progress");
      prog1.classList.remove("w-0");
      var prog: any = document.getElementById("progress");

      // const clientWorker = new Worker("/receiver_worker.js");

      if (e.data.toString()) {
        if (e.data.toString().includes("len")) {
          total_chunks = e.data.toString().split("%")[1];
        }
        if (
          e.data.toString() !== "completed" &&
          !e.data.toString().includes("len")
        ) {
          // let k = e.data.toString();
          // prog.style.width = `${Math.abs(k)}%`;
          type.current = e.data.toString();
        }
      }

      if (e.data.toString() === "completed") {
        [iterator, total_chunks] = [0, 0];
        console.log("completed on client");
        file = new Blob(fileChunks);
        let t = type.current;
        console.log(t, "ttt");
        blobUrl = URL.createObjectURL(file);
        var link = document.createElement("a");
        link.href = blobUrl;
        link.download = t.substring(5);
        document.body.appendChild(link);
        var a = link.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        let name: any = document.querySelector(".toast");
        name.innerHTML = "File recieved ⚡";
        document
          .querySelector(".toast")
          ?.classList.toggle("completed_animation");

        setTimeout(() => {
          document
            .querySelector(".toast")
            ?.classList.toggle("completed_animation");
          fileChunks = [""];
          clientDc.send("msg from client");
          prog.style.width = 0;
        }, 1000);
      }
      if (
        e.data.toString() !== "completed" &&
        !e.data.toString().includes("type") &&
        e.data.toString() !== `undefined` &&
        !e.data.toString().includes("len")
      ) {
        console.log(e.data);
        iterator++;
        prog.style.width = `${Math.abs(iterator / total_chunks) * 100}%`;

        fileChunks.push(e.data);
      }
    });
  };

  return (
    <div className="flex flex-col  app relative text-textc  h-[100svh] overflow-hidden  ">
      <div className="text-white toast completed_animation absolute top-3 md:top-[90%]  right-[25%] left-[25%] md:right-10  md:left-[unset] flex items-center justify-center  rounded-[25px] md:rounded-[5px] p-2 py-3 z-[66] text-xs bg-g ">
        Transfer Completed ⚡
      </div>

      <section className="flex justify-between w-full ">
        <Logo baseURL={baseURL} connection={connection} />
        <div className="flex md:gap-8 gap-6">
          <ToggleTheme />
          <div
            className=" cursor-pointer  q text-white self-center justify-self-end w-6 h-6  bg-[#C5C5C5] rounded-full flex justify-center items-center md:mr-6 mr-3"
            onClick={() =>
              document.querySelector(".info")?.classList.remove("hidden")
            }
          >
            ?
          </div>
        </div>
      </section>
      <Info />

      <span
        id="progress"
        className="bg-g w-0 absolute  progress h-1 top-0"
      ></span>

      {!connection ? (
        <section className=" h-full  overflow-y-auto self-center w-full md:w-[max-content] md:max-w-[80%]  flex justify-center items-center bg- [rgba(250,250,250,.1)] flex-wrap  transition text-white      ">
          {peers.map((i: any, n) => (
            <button
              // style={{
              //   position: "absolute",
              //   bottom: `${(n + 1) * 10 >= 100 ? 90 : (n + 1) * 10}%`,
              //   left: `${n + 1 == 1 ? "46" : (n + 1) % 2 == 0 ? "25" : "75"}%`,
              // }}
              onClick={() => {
                offerPeerConnection(i);
                setDestination(i);
              }}
              className={`bg-g px-1 m-4 text-bg w-20 h-20  md:w-24 md:h-24 rounded-full text-xs  text-b py-1`}
            >
              {i.split("%").map((ele: string, n: any) => (
                <p className="font-mono">
                  {n == 0
                    ? ele.slice(0, 1).toLocaleUpperCase() + ele.slice(1)
                    : ele}
                </p>
              ))}
            </button>
          ))}
        </section>
      ) : (
        <section className=" h-full self-center w-full md:w-1/2   transition-[1] flex items-center justify-center     text-white  gap-1  ">
          <label
            className={`bg-g px-1 flex flex-col items-center justify-center text-bg w-20 h-20 cursor-pointer md:w-24 md:h-24 rounded-full text-xs  text-b py-1`}
          >
            {" "}
            {destination.split("%").map((ele: string, n: any) => (
              <p className="font-mono">
                {n == 0
                  ? ele.slice(0, 1).toLocaleUpperCase() + ele.slice(1)
                  : ele}
              </p>
            ))}
            <input
              type="file"
              multiple
              onChange={(e: any) => fileAdd(e)}
              className={`bg-g px-1 text-bg w-20 h-20  md:w-24 md:h-24 rounded-full text-xs  text-b py-1`}
            />
          </label>
        </section>
      )}
      <Modal />
      <div className=" w-full flex flex-col gap-6  mb-5 mt-10 justify-center items-center ">
        <span className=" pulsing rounded-full "></span>
        <span className="  font-mono ">{myname}</span>
      </div>
      <Foot />
    </div>
  );
}

export default App;

{
  /* ) : (
          <div className="md:mr-6 self-start md:self-center w-full  md:justify-self-end controls transition-[1] md:min-w-[450px] lg:max-w-[550px]  min-h-[250px]     bg-lb  text-white flex  items-center  justify-center gap-4 flex-col md:flex- row md:flex-wrap rounded-t-[35px] md:rounded-[35px] ">
            <span className="file_name text-[.5rem]  text-gray-200 opacity-0">
              ""
            </span>{" "}
            <label className="custom-file-upload fileinput flex   cursor-pointer  justify-center items-center shadow-[1px_1px_20px_-8px_rgba(20,220,220,.21)] bg-lb  text-white px-5 py-3 rounded-[25px] min-w-[150px]">
              Choose File
              <input
                multiple
                id="send_cntrl"
                type="file"
                className="send"
                onChange={(e: any) => fileAdd(e)}
              />
            </label>
            <button
              id="send_cntrl"
              className="btn send_btn cursor-pointer shadow-[1px_1px_20px_-8px_rgba(20,220,220,.51)] bg-g  text-white px-5 py-3 rounded-[25px] min-w-[150px] "
              onClick={Sendmsg}
            >
              Send
            </button>
          </div>
        )} */
}
