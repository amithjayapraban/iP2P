import React, { useEffect, useState } from "react";
import ProgressInPercentage from "./ProgressInPercentage";
import { formatPeerName } from "../utils/formatPeerName";
import {
  ChevronRightIcon,
  FileImageIcon,
  Radio,
  Send,
  SendHorizonal,
  SendHorizonalIcon,
  UploadIcon,
  Wifi,
} from "lucide-react";
import { FileWithMetadata } from "../types/app";
import {
  ArrowTopRightIcon,
  Cross1Icon,
  Cross2Icon,
  Crosshair2Icon,
  FileIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { formatFileName } from "../utils/formatFileName";
import { Dialog } from "radix-ui";
interface FileTransferSectionProps {
  destination: string;
  sendFiles: () => void;
  files: FileWithMetadata[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithMetadata[]>>;
  fileIndex: number;
}

export const FileTransferSection = ({
  destination,
  files,
  sendFiles,
  setFiles,
  fileIndex,
}: FileTransferSectionProps) => {
  const [isSending, setIsSending] = useState(false);
  useEffect(() => {
    setIsSending(false);
  }, [files]);
  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.target.files && setFiles([...e.target.files]);
  };
  return (
    <section className=" h-full  relative self-center w-full md:w-1/2 rounded-3xl  transition-[1] flex items-center justify-center  flex-col  text-xs text-textcolor  gap-1 animate-contentShow">
      {/* <ProgressInPercentage /> */}

      {files.length > 0 ? (
        <div className="flex flex-col p-4 gap-2 border border-gray shadow-sm  bg-bg rounded-3xl w-3/4 h-auto  animate-contentShow">
          <p className="text-sm mt-1 pb-1 border-b border-gray">
            Selected files
          </p>
          <div className="flex flex-wrap items-start mb-4 text-[rgba(0,0,0,.5)] gap-2">
            {files.map((file, index) => (
              <div
                className={`flex   ${
                  index > fileIndex && "cursor-pointer hover:bg-zinc-200"
                } transition-colors duration-300   bg-gray rounded p-2 gap-1 items-center  ${
                  index < fileIndex &&
                  "bg-brandgreen text-bg hover:bg-brandgreen"
                } `}
                onClick={() =>
                  index > fileIndex &&
                  setFiles((prevFiles) =>
                    prevFiles.filter((f) => f.name !== file.name)
                  )
                }
              >
                <FileIcon height={14} width={14} />
                <p className="mr-4 text-[.65rem] ">
                  {formatFileName(file.name)}
                </p>

                {index > fileIndex && <Cross2Icon height={14} width={14} />}
              </div>
            ))}
          </div>
          <div className="flex text-xs  mt-auto   justify-end   gap-4">
            <button
              title="Clear All"
              className="border border-gray bg-gray p-1 text-[rgba(0,0,0,.5)]  hover:bg-zinc-200  rounded-full "
              onClick={() => setFiles([])}
            >
              <Cross2Icon height={15} width={15} />
            </button>
            <button
              disabled={isSending}
              title="Send"
              className={`${isSending&&"cursor-progress"} bg-brandgreen border-gray py-1 pl-3 pr-2  flex items-center transition-all duration-300 justify-center rounded-full text-bg gap-1 `}
              onClick={() => {
                setIsSending(true);
                sendFiles();
              }}
            >
              {isSending ? (
                <>
                 Sending <span className="loader"></span>
                </>
              ) : (
                <>
                  Send
                  <ChevronRightIcon height={15} width={15} />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col border border-gray  overflow-hidden bg-bg px-6 py-6 rounded-3xl justify-center items-center   ">
          {" "}
          <span className="flex justify-center flex-col items-center">
            {(() => {
              const { name, deviceType } = formatPeerName(destination);
              return (
                <>
                  {/* <div className="relative"> */}
                  <img
                    height={128}
                    width={128}
                    src={`/${destination.split("%")[1]}.svg`}
                    alt={`Device icon for ${destination.split("%")[1]}`}
                  />
                  {/* <Wifi className="absolute  text-gray rounded-full p-1 left-1/2 top-1/3 -translate-x-3 " /> */}
                  {/* </div> */}
                  <p className=" text-[var(--textgray)] -mt-4 text-[.5rem]">
                    {deviceType}
                  </p>
                  <p className=" text-[var(--textgray)] -mt-1 text-[.6rem]">
                    {name}
                  </p>
                  {/* <p className="text-gray-500 text-[.6rem]"></p> */}
                </>
              );
            })()}
          </span>
          <label
            className={`  text-textcolor p-2 rounded-full  flex flex-col items-center justify-center  cursor-pointer  text-xs   `}
          >
            <UploadIcon />{" "}
            <input
              type="file"
              multiple
              onChange={(e: any) => addFiles(e)}
              className={``}
            />
          </label>
        </div>
      )}
    </section>
  );
};
