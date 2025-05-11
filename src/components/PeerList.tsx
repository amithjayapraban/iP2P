import { formatPeerName } from "../utils/formatPeerName";

interface PeerListProps {
  peers: string[];
  handlePeerClick: (peer: string) => void;
}

export const PeerList = ({ peers, handlePeerClick }: PeerListProps) => {
  return (
    <section className=" h-full overflow-y-auto self-center w-full md:w-[max-content] md:max-w-[80%]  flex justify-center items-center  flex-wrap  transition text-white gap-4 ">
      {peers.map((peer: string, n) => {
        const { name, deviceType } = formatPeerName(peer);
        return (
          <button
            key={peer}
            onClick={() => handlePeerClick(peer)}
            className={` p-4 gap-2  shadow-sm  bg-bg rounded-3xl h-auto  animate-contentShow   text-textcolor  text-xs   `}
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

            {/* <p className="text-textc">{name}</p>
            <p className="text-gray-500 text-[.6rem]">{deviceType}</p> */}
          </button>
        );
      })}
    </section>
  );
};
