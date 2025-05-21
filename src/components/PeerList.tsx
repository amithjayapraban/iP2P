import { useEffect, useState } from "react";
import { formatPeerName } from "../utils/formatPeerName";


interface PeerListProps {
  peers: string[];
  handlePeerClick: (peer: string) => void;
  peerConnected: boolean;
  destination: string;
}

export const PeerList = ({
  peers,
  destination,
  handlePeerClick,
  peerConnected,
}: PeerListProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  useEffect(() => {
    peerConnected && setIsConnecting(false);
  }, [peerConnected]);
  return (
    <section className=" h-full overflow-y-auto self-center w-full md:w-[max-content] md:max-w-[80%]  flex justify-center items-center  flex-wrap  transition text-white gap-4 ">
      {peers.map((peer: string, n) => {
        const { name, deviceType } = formatPeerName(peer);
        return (
          <button
            key={peer}
            onClick={() => {
              handlePeerClick(peer);
              setIsConnecting(true);
            }}
            className={` p-6  flex flex-col items-center shadow-sm  bg-bg rounded-3xl h-auto  animate-contentShow   text-textcolor  text-xs   `}
          >
            <img
              height={128}
              width={128}
              src={`/${peer.split("%")[1]}.svg`}
              alt={`Device icon for ${peer.split("%")[1]}`}
            />
            <p className=" text-[var(--textgray)] -mt-4 text-[.5rem]">
              {deviceType}
            </p>
            <p className=" text-[var(--textgray)] -mt-1 text-[.6rem]">{name}</p>
            {isConnecting && destination == peer ? (
              <div className="connecting-animation mt-2"></div>
            ) : (
              <div className="h-[15px] mt-2"></div>
            )}
          </button>
        );
      })}
    </section>
  );
};
