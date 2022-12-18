import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import io, { Socket } from "socket.io-client";
import streamSaver from "streamsaver";
import Peer from "simple-peer";
import { generateUsername } from "unique-username-generator";
import { initializeApp } from "firebase/app";
import { generateFromString } from "generate-avatar";
import QRCode from "react-qr-code";
import {
  getFirestore,
  onSnapshot,
  doc as docup,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  limit,
} from "firebase/firestore";
function App() {
  var myname = useRef("");
  const [peerUsername, setPeerUsername] = useState("");
  const usersList = useRef([""]);
  const [roomId, setRoomId] = useState("");
  const [docId, setDocId] = useState("");
  const production = false;

  const firebaseConfig = {
    apiKey: "AIzaSyBo0rfvxWk-ONJwxR-9s_p10F4tgHIlt2A",
    authDomain: "p2pfile-a6d84.firebaseapp.com",
    databaseURL:
      "https://p2pfile-a6d84-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "p2pfile-a6d84",
    storageBucket: "p2pfile-a6d84.appspot.com",
    messagingSenderId: "886889178798",
    appId: "1:886889178798:web:5f5a1727a4584040712f3f",
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  var configuration = {
    iceServers: [
      { urls: "stun:stun.stunprotocol.org" },
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };
  const baseURL = production
    ? "https://sorah-amithjayapraban.koyeb.app"
    : "http://localhost:9000";
  var peerConnection = useRef(new RTCPeerConnection(configuration));
  useEffect(() => {
    const username = generateUsername("-");
    username ? (myname.current = username) : null;
    if (window.location.pathname !== "/") {
     
      const btn: any = document.querySelectorAll(".btn");
      btn.forEach((i: any) => {
        i.classList.add("hidden");
      });
      const search: any = document.querySelector(".search");
      search.classList.toggle("hidden");
      document.querySelector(".recieve_btn")?.classList.toggle("hidden");
      // Recieve();
    }
  }, []);

  const dataChannel = peerConnection.current.createDataChannel("mydata");
  dataChannel.addEventListener("open", (event) => {
    // let messag = "helloooo";
    // dataChannel.send(messag);
    // console.log("msg sent");
  });
  const Sendmsg = (e: any) => {
    e.preventDefault();
    const message = "hello from sender";
    console.log("msg sent .....");
    dataChannel.send(message);
  };

  async function createRoom() {
    
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    document.querySelector(".pulsing")?.classList.toggle("hidden");
    console.log(peerConnection.current.localDescription);
    try {
      const docRef = await addDoc(collection(db, "room"), {
        type: "offer",
        offer: JSON.stringify(offer),
        name: myname.current,
      });

      setDocId(docRef.id);
      setRoomId(myname.current);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    document.querySelector(".send_btn")?.classList.toggle("hidden");
  }

  const q = query(
    collection(db, "room"),
    limit(1),
    where("name", "==", `${myname.current}_`),
    where("type", "==", "answer")
  );
  onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(doc.data().offer))
      );
      let candidate = doc.data().candidate;
      // console.log(candidate, "candid on sender");

      peerConnection.current.addIceCandidate(JSON.parse(candidate));
    });
  });

  peerConnection.current.onicecandidate = async (e) => {
    console.log(e, "evnt on ice");
    const roomRef = collection(db, "room");
    const q = query(roomRef, limit(1), where("name", "==", myname.current));
    const queryGet: any = await getDocs(q);
    queryGet.forEach(async (doc: any) => {
      var c = doc.ref._path.segments[1];
      console.log(c);
      const ref = docup(db, "room", c);
      if (e.candidate) {
        const docRef = await updateDoc(ref, {
          candidate: JSON.stringify(e.candidate),
          name: myname.current,
        });
        console.log("Document update: ", docRef);
      }
    });
  };
  peerConnection.current.addEventListener("connectionstatechange", (event) => {
    console.log(event, "sender connection events");
    if (peerConnection.current.connectionState === "connected") {
      console.log("peers cncted");
    }
  });
  const peerConnection_client = useRef(new RTCPeerConnection(configuration));

  peerConnection_client.current.addEventListener(
    "connectionstatechange",
    (event) => {
      console.log(event, "client connection events");
      // if (peerConnection.connectionState === "connected") {
      //   console.log("peers cncted");
      // }
    }
  );

  async function Recieve() {
    // const btn: any = document.querySelectorAll(".btn");
    // btn.forEach((i: any) => {
    //   i.classList.add("hidden");
    // });
    // const search: any = document.querySelector(".search");
    // search.classList.toggle("hidden");
    document.querySelector(".recieve_btn")?.classList.toggle("hidden");
    document.querySelector(".pulsing")?.classList.toggle("hidden");
    let p = window.location.pathname.slice(1);
    const roomRef = collection(db, "room");
    const q = query(roomRef, limit(1), where("name", "==", p));
    const queryGet: any = await getDocs(q);
    queryGet.forEach(async (doc: any) => {
      if (doc.data()) {
        // console.log(doc.data().offer, "doc data");
        peerConnection_client.current.setRemoteDescription(
          new RTCSessionDescription(JSON.parse(doc.data().offer))
        );
        const answer = await peerConnection_client.current.createAnswer();
        await peerConnection_client.current.setLocalDescription(answer);
        console.log(answer, "ans");
        peerConnection_client.current.addEventListener(
          "icecandidate",
          (e: any) => {
            console.log("e reciebver", e);
          }
        );
        try {
          const docRef = await addDoc(collection(db, "room"), {
            type: "answer",
            offer: JSON.stringify(answer),
            name: `${p}_`,
          });
          console.log("Document written with ID: ", docRef.id);
          // setDocId(docRef.id);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
    });

    const quer = query(
      collection(db, "room"),
      limit(2),
      where("name", "==", `${p}`),
      where("type", "==", "offer")
    );
    onSnapshot(quer, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let candidate = doc.data().candidate;
        console.log(JSON.parse(candidate), "candid on recievr");
        peerConnection_client.current.addIceCandidate(JSON.parse(candidate));
      });
    });
  }

  peerConnection_client.current.onicecandidate = async (e) => {
    let p = window.location.pathname.slice(1);
    console.log(e, "ice event on reciever");
    const roomRef = collection(db, "room");
    const q = query(roomRef, limit(1), where("name", "==", `${p}_`));
    const queryG: any = await getDocs(q);
    queryG.forEach(async (doc: any) => {
      //  console.log(doc.ref._path.segments[6],"nnn");
      var c = doc.ref._path.segments[1];
      console.log(doc.ref._path.segments[1], "nnnn");

      if (e.candidate) {
        const ref = docup(db, "room", c);
        const docRef = await updateDoc(ref, {
          candidate: JSON.stringify(e.candidate),
          name: `${p}_`,
        });
        console.log("Document update: ", docRef);
      }
    });
  };

  
  peerConnection_client.current.ondatachannel=(e:any)=>{
    console.log(e,"data cahnel on client");
    var clientDc:any=e.channel;

    console.log(clientDc,"clientdc")

    clientDc.addEventListener('message',(e:any)=>{
      alert(e.data);
      console.log(e.data,"msg from sendedr");
    })
  }

 
 
  // const dataReciever = peerConnection_client.current.createDataChannel("mydata");
  // dataReciever.addEventListener("message", (event) => {
  //   console.log("msg from")
  //   const message = event.data;
  //   console.log(message, "msg from server");
  // });
  // dataChannel.addEventListener('open', event => {
  //   // const message = event.data;
  //   alert("open");
  // });
  function close() {
    var name: any = { name_rem: myname };
  }
  return (
    <div className="home  bg-b max-h-screen overflow-hidden  ">
      <svg
        className="logo  flex justify-items-start items-start  md:m-6 m-3   md:scale-[.71] scale-[.7] origin-top-left  "
        width="59"
        height="57"
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="8.67798" width="112.814" height="128" rx="4" fill="#3EF994" />
        <path
          opacity="0.8"
          d="M4.33902 8.49121C4.33902 6.28207 6.12988 4.49121 8.33902 4.49121H119.661C121.87 4.49121 123.661 6.28207 123.661 8.49121V104.526C123.661 110.049 119.184 114.526 113.661 114.526H14.339C8.81617 114.526 4.33902 110.049 4.33902 104.526V8.49121Z"
          fill="white"
        />
        <rect y="8.98254" width="128" height="119.018" rx="4" fill="#3EF994" />
        <path
          d="M40.9948 99.8066L65.6429 66.1838L81.2224 77.1493L40.9948 99.8066Z"
          fill="white"
        />
        <path
          d="M88.2796 36.3356L63.615 69.9456L48.041 58.9719L88.2796 36.3356Z"
          fill="white"
        />
      </svg>

      {/* <svg className='m-6 md:m-0 row-start-0 row-end-1  col-start-1 col-end-1 w-[min-content]  md:scale-[1]  ' width="59" height="57" viewBox="0 0 59 57" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="4" width="52" height="57" rx="4" fill="#3EF994"/>
<path opacity="0.8" d="M2 6C2 3.79086 3.79086 2 6 2H53C55.2091 2 57 3.79086 57 6V41C57 46.5228 52.5228 51 47 51H12C6.47715 51 2 46.5228 2 41V6Z" fill="#ffff"/>
<rect y="4" width="59" height="53" rx="4" fill="#3EF994"/>
<path d="M22.1355 37.1224L27.9873 29.4104L31.6861 31.9255L22.1355 37.1224Z" fill="#ffff"/>
<path d="M33.18 23.6888L26.4775 30.6741L23.0935 27.7491L33.18 23.6888Z" fill="#ffff"/>
<rect width="2.89146" height="7.13322" transform="matrix(0.876629 -0.481167 0.744668 0.667435 24 28.4557)" fill="#fffff"/>
</svg> */}

      <p className="md:ml-6 ml-3 self-center md:self-start banner md:text-7xl text-5xl   text-gray-200">
        P2P <br />
        Sharing <br />
        made easy.
      </p>

      <div className=" bg-b p-2 md:p-4 rounded-[35px]  inline-flex items-center gap-1 md:mr-6 justify-self-center self-center md:self-center myname md:justify-self-end text-white font-mono ">
        <img
          className="w-6 h-6 md:w-8 md:h-8 rounded-full "
          src={`data:image/svg+xml;utf8,${generateFromString(myname.current)}`}
        />
        {myname ? myname.current : ""}
      </div>
      <div className=" md:mr-6 self-start controls transition-[1] md:w-[450px] lg:w-[650px]  min-h-[250px]     bg-lb  text-white flex  items-center  justify-center gap-3 flex-col md:flex-row rounded-t-[35px] md:rounded-[35px]  ">
        <button
          className="btn send_btn shadow-[1px_1px_20px_-8px_rgba(20,220,220,.51)] bg-g text-2xl text-white px-5 py-3 rounded-[25px] min-w-[150px] "
          onClick={createRoom}
        >
          Send
        </button>
        <button
          id="sendButton"
          className="btn shadow-[1px_1px_20px_-15px_rgba(20,220,220,.51)] bg-b text-gray-300 text-2xl  px-5 py-3 rounded-[25px] min-w-[150px] "
          onClick={Sendmsg}
        >
          send msg
        </button>
        <button
          id="recieve_btn"
          className="btn recieve_btn hidden shadow-[1px_1px_20px_-8px_rgba(20,220,220,.51)] bg-g text-2xl text-white px-5 py-3 rounded-[25px] min-w-[150px] "
          onClick={Recieve}
        >
          Recieve
        </button>
        <div className=" flex  flex-col gap-8 justify-center items-center search text-2xl text-gray-300">
          <div className="hidden pulsing self-center"></div>
          {/* <div className="flex flex-col gap-3 users hidden items-center  ">
            {usersList.current.map((i: any) => {
              return (
                <button className="self-start  bg-g px-2 py-2  rounded-[5px] text-gray-600">
                  {i}
                </button>
              );
            })}
          </div> */}
        </div>
      </div>
      <div
        style={{
          height: "auto",
          margin: "0 auto",
          maxWidth: 64,
          width: "100%",
        }}
      >
        {roomId ? (
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={`http://192.168.29.21:3001/${roomId}`}
            viewBox={`0 0 256 256`}
          />
        ) : null}
      </div>

      {/* <span className="hidden md:flex  h-full"></span> */}
      <p className="foot md:absolute md:bottom-[1%]   md:bg-transparent bg-lb w-[100%]  text-center justify-self-end self-center  md:text-xs text-[8px]  text-gray-400">
        Made with ❤️ by amithjayapraban
      </p>
    </div>
  );
}

export default App;
