import { formatPeerName } from "../utils/formatPeerName";

interface PeerListProps {
  peers:string[];
  handlePeerClick: (peer: string) => void;
}

export const PeerList = ({ peers, handlePeerClick }: PeerListProps) => {
  return (
    <section className=" h-full overflow-y-auto self-center w-full md:w-[max-content] md:max-w-[80%]  flex justify-center items-center bg- [rgba(250,250,250,.1)] flex-wrap  transition text-white      ">
      {peers.map((peer: string, n) => {
        const { name, deviceType } = formatPeerName(peer);
        return (
          <button
            key={peer}
            onClick={() => handlePeerClick(peer)}
            className={`bg- [var(--gray)] px-1 m-4 text-textc w-20 h-20  md:w-24 md:h-24 rounded-full text-xs  text-b py-1`}
          >
            <img
              height={128}
              width={128}
              src={`/${peer.split("%")[1]}.svg`}
              alt={`Device icon for ${peer.split("%")[1]}`}
            />
            <p className="text-textc">{name}</p>
            <p className="text-gray-500 text-[.6rem]">{deviceType}</p>
          </button>
        );
      })}
    </section>
  );
};
