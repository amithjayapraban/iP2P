import React from "react";
import ProgressInPercentage from "./ProgressInPercentage";
import { formatPeerName } from "../utils/formatPeerName";
interface FileTransferSectionProps {
  destination: string;
  addFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export const FileTransferSection = ({
  destination,
  addFiles,
}: FileTransferSectionProps) => {
  return (
    <section className=" h-full relative self-center w-full md:w-1/2   transition-[1] flex items-center justify-center  flex-col  text-xs text-white  gap-1  ">
      <ProgressInPercentage />
      <label
        className={` bor der  border-[var(--gray)] px-1 flex flex-col items-center justify-center  w-28 h-28 cursor-pointer  rounded-full text-xs  `}
      >
        {" "}
        <img
          height={128}
          width={128}
          src={`/${destination.split("%")[1]}.svg`}
          alt={`Device icon for ${destination.split("%")[1]}`}
        />
        <input
          type="file"
          multiple
          onChange={(e: any) => addFiles(e)}
          className={``}
        />
      </label>
      <span className="flex justify-center flex-col items-center">
        {(() => {
          const { name, deviceType } = formatPeerName(destination);
          return (
            <>
              <p className="text-textc">{name}</p>
              <p className="text-gray-500 text-[.6rem]">{deviceType}</p>
            </>
          );
        })()}
      </span>
    </section>
  );
};
