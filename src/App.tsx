import { useEffect, useRef, useState } from "react";
import "./App.css";
import { generateUsername } from "unique-username-generator";
import { generateFromString } from "generate-avatar";
import Info from "./components/Info";
import Logo from "./components/Logo";
import Foot from "./components/Foot";
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
    name.current = generateUsername("", 0, 7);
    setmyName(name.current);

    openSignaling();

    window.document.title = "iP2P - Not Connected";
    // document
    //   .querySelectorAll(".send_btn")[0]
    //   .setAttribute("disabled", "disabled");
  }, []);

  var ws: any = useRef();
  // const peerConnection_client = useRef(new RTCPeerConnection(configuration));
  var peerConnection = useRef(new RTCPeerConnection(configuration));
  function openSignaling() {
    const url = `ws://localhost:8080/${name.current}`;
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("ws open");
    ws.current.onerror = () => console.error("WebSocket err");
    ws.current.onclose = () => console.error("WebSocket disconnected");
    ws.current.onmessage = (e: any) => {
      if (typeof e.data != "string") return;
      const message = JSON.parse(e.data);

      const { id, type } = message;
      console.log(type, message, "ssss");
      if (type === "peers") {
        setPeers(
          message.keys.filter((key: string) => {
            return key !== name.current;
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
    console.log("DC open");
  });

  peerConnection.current.onicecandidate = async (e) => {
    console.log(e, "once");

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
    console.log(
      peerConnection.current.connectionState,
      "connectionstatechange"
    );
  });

  async function offerPeerConnection(id: string) {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    ws.current.send(
      JSON.stringify({
        id,
        type: "offer",
        description: offer.sdp,
      })
    );
  }


  // const dataChannel = peerConnection.current.createDataChannel("mydata");
  // dataChannel.bufferedAmountLowThreshold = 1024;
  // dataChannel.addEventListener("open", (event) => {});
  // var file: any;
  // //Web worker
  // const myWorker = new Worker("/worker.js");
  // const fileAdd = (e: any) => {
  //   e.preventDefault();
  //   file = e.target.files;
  //   var prog: any = document.getElementById("progress");
  //   prog.style.width = `0%`;

  //   let name: any = document.querySelectorAll(".file_name");
  //   name.forEach((element: any) => {
  //     element.classList.remove("opacity-0");

  //     element.innerHTML = `${file[0].name}&nbsp. . .`;
  //   });
  // };
  // var sendQueue: any = [];

  // const Sendmsg = (e: any) => {
  //   let i = 0;
  //   let n = file.length - 1;
  //   e.preventDefault();
  //   if (window.Worker) {
  //     myWorker.postMessage(file[0]);
  //   }
  //   var prog1: any = document.querySelector(".progress");
  //   prog1.classList.remove("w-0");
  //   var prog: any = document.getElementById("progress");
  //   prog.style.opacity = "1";
  //   document
  //     .querySelectorAll("#send_cntrl")
  //     ?.forEach((e: any) => e.setAttribute("disabled", "disabled"));
  //   document.querySelectorAll(".send_btn")[0].innerHTML = "Sending";

  //   myWorker.onmessage = (e) => {
  //     // console.log(e.data.chunk);
  //     if (e.data.toString() === "completed") {
  //       console.log(e.data.toString());
  //       completedActions();
  //       dataChannel.send(`type:${file[i].name}`);
  //       i++;
  //       dataChannel.send("completed");

  //       //  sendRem();
  //     }

  //     prog.style.width = `${Math.abs(e.data.w)}%`;

  //     // console.count("onmsg");

  //     dataChannel.send(e.data.chunk);
  //   };

  //   dataChannel.addEventListener("message", (event) => {
  //     console.log("got msg from client", event);
  //     if (window.Worker) {
  //       i <= n && myWorker.postMessage(file[i]);
  //     }
  //   });

  //   // File transfer animation

  //   let name: any = document.querySelector(".toast");
  //   name.innerHTML = "Transfer Completed ⚡";
  // };

  // function completedActions() {
  //   {
  //     document
  //       .querySelectorAll("#send_cntrl")
  //       ?.forEach((e: any) => e.removeAttribute("disabled"));
  //     document.querySelectorAll(".send_btn")[0].innerHTML = "Send";
  //     setTimeout(() => {
  //       var prog: any = document.getElementById("progress");

  //       prog.style.width = "0";
  //     }, 3000);
  //     document.querySelector(".toast")?.classList.toggle("completed_animation");
  //     setTimeout(() => {
  //       document
  //         .querySelector(".toast")
  //         ?.classList.toggle("completed_animation");
  //     }, 3000);
  //   }
  // }

  // async function createRoom() {
  //   const offer = await peerConnection.current.createOffer();
  //   await peerConnection.current.setLocalDescription(offer);

  //   try {
  //     // const docRef = await addDoc(collection(db, "room"), {
  //     //   type: "offer",
  //     //   offer: JSON.stringify(offer),
  //     //   name: myname.current,
  //     // });
  //     // setDocId(docRef.id);
  //     // setRoomId(myname.current);
  //   } catch (e) {
  //     console.error("Error adding document: ", e);
  //   }
  // }

  // // const q = query(
  // //   collection(db, "room"),
  // //   limit(1),
  // //   where("name", "==", `${myname.current}_`),
  // //   where("type", "==", "answer")
  // // );
  // // onSnapshot(q, (querySnapshot) => {
  // //   querySnapshot.forEach((doc) => {
  // //     peerConnection.current.setRemoteDescription(
  // //       new RTCSessionDescription(JSON.parse(doc.data().offer))
  // //     );
  // //     let candidate = doc.data().candidate;

  // //     peerConnection.current.addIceCandidate(JSON.parse(candidate));
  // //   });
  // // });

  // peerConnection.current.onicecandidate = async (e) => {
  //   // const roomRef = collection(db, "room");
  //   // const q = query(roomRef, limit(1), where("name", "==", myname.current));
  //   // const queryGet: any = await getDocs(q);
  //   // queryGet.forEach(async (doc: any) => {
  //   //   var c = doc.ref._path.segments[1];
  //   //   const ref = docup(db, "room", c);
  //   //   if (e.candidate) {
  //   //     const docRef = await updateDoc(ref, {
  //   //       candidate: JSON.stringify(e.candidate),
  //   //       name: myname.current,
  //   //     });
  //   //   }
  //   // });
  // };

  // peerConnection.current.addEventListener("connectionstatechange", (event) => {
  //   if (peerConnection.current.connectionState === "connected") {
  //     setConnection(true);
  //     window.document.title = "iP2P - Connected!";
  //     document.querySelectorAll(".send_btn")[0].removeAttribute("disabled");
  //     let name: any = document.querySelector(".toast");
  //     name.innerHTML = "Connected ⚡";
  //     document.querySelector(".toast")?.classList.toggle("completed_animation");
  //     setTimeout(() => {
  //       document
  //         .querySelector(".toast")
  //         ?.classList.toggle("completed_animation");
  //     }, 1000);
  //   }
  // });

  // const peerConnection_client = useRef(new RTCPeerConnection(configuration));

  // peerConnection_client.current.addEventListener(
  //   "connectionstatechange",
  //   (event) => {
  //     if (peerConnection_client.current.connectionState === "connected") {
  //       setConnection(true);
  //       window.document.title = "iP2P - Connected!";

  //       let name: any = document.querySelector(".toast");
  //       name.innerHTML = "Connected ⚡";
  //       document
  //         .querySelector(".toast")
  //         ?.classList.toggle("completed_animation");
  //       setTimeout(() => {
  //         document
  //           .querySelector(".toast")
  //           ?.classList.toggle("completed_animation");
  //       }, 1000);
  //     }
  //   }
  // );

  // async function Recieve() {
  //   document.querySelector(".recieve_btn")?.classList.toggle("hidden");
  //   document.querySelector(".pulsing")?.classList.toggle("hidden");
  //   let p = window.location.pathname.slice(1);
  //   // const roomRef = collection(db, "room");
  //   // const q = query(roomRef, limit(1), where("name", "==", p));
  //   // const queryGet: any = await getDocs(q);
  //   // queryGet.forEach(async (doc: any) => {
  //   //   if (doc.data()) {
  //   //     peerConnection_client.current.setRemoteDescription(
  //   //       new RTCSessionDescription(JSON.parse(doc.data().offer))
  //   //     );
  //   //     const answer = await peerConnection_client.current.createAnswer();
  //   //     await peerConnection_client.current.setLocalDescription(answer);

  //   //     peerConnection_client.current.addEventListener(
  //   //       "icecandidate",
  //   //       (e: any) => {}
  //   //     );
  //   // try {
  //   //   const docRef = await addDoc(collection(db, "room"), {
  //   //     type: "answer",
  //   //     offer: JSON.stringify(answer),
  //   //     name: `${p}_`,
  //   //   });
  //   // } catch (e) {}
  //   //   }
  //   // };

  //   // const quer = query(
  //   //   collection(db, "room"),
  //   //   limit(2),
  //   //   where("name", "==", `${p}`),
  //   //   where("type", "==", "offer")
  //   // );
  //   // onSnapshot(quer, (querySnapshot) => {
  //   //   querySnapshot.forEach((doc) => {
  //   //     let candidate = doc.data().candidate;

  //   //     peerConnection_client.current.addIceCandidate(JSON.parse(candidate));
  //   //   });
  //   // });

  //   //   const fetch: any = await getDocs(quer);
  //   //   fetch.forEach(async (doc: any) => {
  //   //     let candidate = doc.data().candidate;
  //   //     peerConnection_client.current.addIceCandidate(JSON.parse(candidate));
  //   //   });
  //   // }
  // }
  // peerConnection_client.current.onicecandidate = async (e) => {
  //   let p = window.location.pathname.slice(1);

  //   // const roomRef = collection(db, "room");
  //   // const q = query(roomRef, limit(1), where("name", "==", `${p}_`));
  //   // const queryG: any = await getDocs(q);
  //   // queryG.forEach(async (doc: any) => {
  //   //   var c = doc.ref._path.segments[1];

  //   //   if (e.candidate) {
  //   //     const ref = docup(db, "room", c);
  //   //     const docRef = await updateDoc(ref, {
  //   //       candidate: JSON.stringify(e.candidate),
  //   //       name: `${p}_`,
  //   //     });
  //   //   }
  //   // });
  // };
  // var blobUrl: any;

  // peerConnection_client.current.ondatachannel = (e: any) => {
  //   var clientDc: any = e.channel;

  //   var fileChunks: any = [];
  //   var file;

  //   clientDc.addEventListener("message", (e: any) => {
  //     var prog1: any = document.querySelector(".progress");
  //     prog1.classList.remove("w-0");
  //     var prog: any = document.getElementById("progress");

  //     if (e.data.toString()) {
  //       if (e.data.toString() !== "completed") {
  //         type.current = e.data.toString();
  //       }
  //     }

  //     if (e.data.toString() === "completed") {
  //       console.log("completed on client");

  //       file = new Blob(fileChunks);
  //       let t = type.current;
  //       blobUrl = URL.createObjectURL(file);
  //       var link = document.createElement("a");
  //       link.href = blobUrl;
  //       link.download = t.substring(5);
  //       document.body.appendChild(link);
  //       var a = link.dispatchEvent(
  //         new MouseEvent("click", {
  //           bubbles: true,
  //           cancelable: true,
  //           view: window,
  //         })
  //       );
  //       document.body.removeChild(link);
  //       URL.revokeObjectURL(blobUrl);
  //       let name: any = document.querySelector(".toast");
  //       name.innerHTML = "File recieved ⚡";
  //       document
  //         .querySelector(".toast")
  //         ?.classList.toggle("completed_animation");
  //       setTimeout(() => {
  //         document
  //           .querySelector(".toast")
  //           ?.classList.toggle("completed_animation");
  //         fileChunks = [""];
  //         clientDc.send("msg from client");
  //       }, 1000);
  //     } else {
  //       console.count("rec chunks");
  //       fileChunks.push(e.data);
  //     }
  //   });
  // };

  return (
    <div className="home relative bg-b h-screen overflow-hidden  ">
      <div className="text-white toast completed_animation absolute top-3 md:top-[90%]  right-[25%] left-[25%] md:right-10  md:left-[unset] flex items-center justify-center  rounded-[25px] md:rounded-[5px] p-2 py-3 z-[66] text-xs bg-g ">
        Transfer Completed ⚡
      </div>

      <div
        className=" cursor-pointer  q text-white self-center justify-self-end w-6 h-6  bg-[#C5C5C5] rounded-full flex justify-center items-center md:mr-6 mr-3"
        onClick={() =>
          document.querySelector(".info")?.classList.remove("hidden")
        }
      >
        ?
      </div>
      <Info />
      <Logo baseURL={baseURL} connection={connection} />

      <span className=" md:ml-6 hidden md:flex text-white md_brand flex-col md:self-start justify-end w-[max-content] ">
        {" "}
        <p className="text-2xl opacity-0">iP2P </p>
      </span>
      <div className="md:ml-6 ml-3 flex-wrap  md:items-center md:w-[80%] md:mr-6 h-full md:justify-center  md:self-center md:h-[max-content] justify-between   md:py-0  banner  w-full text-4xl flex flex-col md:flex- row gap-6 md:gap-12 text-gray-200">
        <span className="flex md_brand text-xl  md:hidden flex-col md:self-start justify-end w-[max-content] ">
          {" "}
          {/* <p className="opacity-0">iP2P </p> */}
        </span>

        <>
          <div className=" items-center rounded-[35px]  p-1 gap-6 justify-center self-center justify-self-end hidden md:flex md:rounded  h-[min-content]">
            <div className="md:justify-self-end justify-self-center  text-xl  md:bg-transparent   rounded-[35px]  inline-flex items-center gap-1 md:mr-6  md:self-center myname  justify-center  text-white font-mono ">
              <img
                className="w-6 h-6 md:w-8 md:h-8 rounded-full "
                src={`data:image/svg+xml;utf8,${generateFromString(myname)}`}
              />
              {myname}
            </div>
          </div>
        </>
      </div>
      <span
        id="progress"
        className="bg-g w-0 absolute  progress h-1 top-0"
      ></span>
      <div className="md:justify-self-end justify-self-center   md:bg-transparent md:hidden   rounded-[35px]  inline-flex items-center gap-1 md:mr-6  md:self-center myname  justify-center  text-white font-mono ">
        <img
          className="w-6 h-6 md:w-8 md:h-8 rounded-full "
          src={`data:image/svg+xml;utf8,${generateFromString(myname)}`}
        />
        {myname}
      </div>

      <div
        id="bottom-card"
        className=" md:mr-6 self-start md:self-center w-full  md:justify-self-end controls transition-[1] md:min-w-[450px] lg:max-w-[550px]  min-h-[250px]     bg-lb  text-white flex  items-center  justify-center gap-1 md:gap-2 flex-col md:flex-ro w rounded-t-[35px] md:rounded-[35px]  "
      >
        {peers.map((i: any) => (
          <button
            onClick={() => {
              offerPeerConnection(i);
              setDestination(i);
            }}
            className="bg-g px-1 text-b py-1"
          >
            {i}
          </button>
        ))}

        {/* <label className="custom-file-upload fileinput flex   cursor-pointer  justify-center items-center shadow-[1px_1px_20px_-8px_rgba(20,220,220,.21)] bg-lb  text-white px-5 py-3 rounded-[25px] min-w-[150px]">
          Choose File
          <input
            multiple
            id="send_cntrl"
            type="file"
            className="send"
            // onChange={(e: any) => fileAdd(e)}
          />
        </label> */}
        <span className="file_name text-[.5rem]  text-gray-200 opacity-0">
          ""
        </span>

        {/* <button
          id="send_cntrl"
          className="btn send_btn cursor-pointer shadow-[1px_1px_20px_-8px_rgba(20,220,220,.51)] bg-g  text-white px-5 py-3 rounded-[25px] min-w-[150px] "
          // onClick={Sendmsg}
        >
          Send
        </button> */}
        {/* <button
          id="recieve_btn"
          className="btn recieve_btn hidden shadow-[1px_1px_20px_-8px_rgba(20,220,220,.51)] bg-g text-2xl text-white px-5 py-3 rounded-[25px] min-w-[150px] "
          // onClick={Recieve}
        >
          Recieve
        </button> */}

        <div className=" flex  flex-col gap-8 justify-center items-center search text-2xl text-gray-300">
          <div className="hidden pulsing self-center"></div>
        </div>
      </div>
      <Foot />
    </div>
  );
}

export default App;
