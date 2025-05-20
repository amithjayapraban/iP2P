import { Cross2Icon } from "@radix-ui/react-icons";
import { FileIcon } from "lucide-react";
import { formatFileName } from "../utils/formatFileName";

export interface FileReceivingSectionProps {
  receivingFile: string | null;
  setReceivingFile: React.Dispatch<React.SetStateAction<string | null>>;
  progress: number;
}
export const FileReceivingSection: React.FC<FileReceivingSectionProps> = ({
  receivingFile,
  setReceivingFile,
  progress,
}) => {
  return (
    <section className=" h-full  relative self-center w-full md:w-1/2 rounded-3xl  transition-[1] flex items-center justify-center  flex-col  text-xs text-textcolor  gap-1 animate-contentShow">
      <div className="flex flex-col p-4 gap-2 border border-gray shadow-sm  bg-bg rounded-3xl w-3/4 h-auto  animate-contentShow">
        <p className="text-sm mt-1 pb-1 border-b border-gray">Receiving file</p>
        <div className="flex flex-wrap items-start mb-4 text-[rgba(0,0,0,.5)] gap-2">
          <div
            className={`flex relative bg-gray  transition-colors duration-300 min-w-[30%]   rounded p-2 gap-2 items-center  `}
          >
            <span
              id="progress-bar"
              style={{ width: `${progress}%` }}
              className={` ${
                progress == 100 ? "rounded-b" : "rounded-bl"
              } h-1 rounded-bl bottom-0  -left-0   absolute bg-brandgreen`}
            ></span>

            <FileIcon height={14} width={14} />
            <p className="mr-4 text-[.65rem] ">
              {receivingFile && formatFileName(receivingFile)}
            </p>
          </div>
        </div>
        <div className="flex text-xs  mt-auto   justify-end   gap-4">
          <button
            id="fileCancelButton"
            title="Cancel"
            className="border border-gray bg-gray p-1 text-[rgba(0,0,0,.5)]  hover:bg-zinc-200  rounded-full "
          >
            <Cross2Icon height={15} width={15} />
          </button>
          <a
            id="fileSaveButton"
            href="#"
            download={receivingFile ? receivingFile : "download"}
            title="Save"
            className={`${
              progress < 100 ? "pointer-events-none opacity-50" : ""
            } bg-brandgreen border-gray py-1 px-3  flex items-center transition-all duration-300 justify-center rounded-full text-bg gap-1 `}
          >
            Save
          </a>
        </div>
      </div>
    </section>
  );
};
