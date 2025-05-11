import { QuestionMarkCircledIcon, QuestionMarkIcon } from "@radix-ui/react-icons";
import { AtSign, BadgeInfo, BadgeInfoIcon, CircleHelp, EllipsisVertical, Github, HelpCircleIcon, InfinityIcon, InfoIcon, MoreHorizontalIcon } from "lucide-react";
import { Dialog } from "radix-ui";
export default function Info() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="text-textcolor outline-none self-center  justify-self-end w-8 h-8   bg- [#4f4f4f] rounded-[10px] flex justify-center items-center">
        <MoreHorizontalIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[rgba(255,255,255,0.5)]  data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="text-textcolor outline-none bg-bg border border-[var(--gray)]  p-4  rounded-xl md:min-w-[30vw]  min-w-[70vw] break-words md:max-w-[40vw] max-w-[80vw] md:right-12 right-12 md:top-12 top-12  absolute z-[99] data-[state=open]:animate-contentShow">
          <ul className="pl-1 text-xs  flex flex-col gap-1">
            <li className=" border-b border-[var(--gray)] pb-1 ">
              {" "}
              🔍 <br />{" "}
              <p>Ensure that both devices are connected to the same network.</p>
            </li>
            <li className=" border-b border-[var(--gray)] pb-1 ">
              {" "}
              🖥️
              <br />{" "}
              <p className="">
                Select the target device and then choose the files to send.
              </p>
            </li>

            <li className="italic flex flex-wrap mt-2   px-2 rounded py-2 w-max gap-2">
              <a
                title="Github Repository"
                href="https://github.com/amithjayapraban/fyla"
                target="_blank"
                rel="noopener"
                className="cursor-pointer gap-1  text-center flex items-center justify-self-end self-center"
              >
                <Github size="12px" /> Github
              </a>
              <span className="w-[.5px] h-auto bg-white"></span>
              <a
                href="https://amith.vercel.app"
                target="_blank"
                title="Personal Website"
                rel="noopener"
                className=" flex gap-1 items-center cursor-pointer justify-self-end self-center    "
              >
                <AtSign size="12px" />
                amithjayapraban
              </a>
            </li>
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

