import { RadioIcon } from "lucide-react";
import React from "react";
interface FooterProps {
  myName: string;
}
export const Footer = ({ myName }: FooterProps) => {
  return (
    <div className=" w-full flex flex-col gap-6  mb-5 mt-10 justify-center items-center text-textcolor ">
      <span className=" flex items-center justify-center pulsing rounded-full ">
        <RadioIcon/>
      </span>
      <span className="text-xs flex italic flex-col justify-center items-center ">
        <span className="text-gray text-[.6rem] ">
          You are known as{" "}
        </span>
        {myName.slice(0, 1).toLocaleUpperCase() + myName.slice(1)}
      </span>
    </div>
  );
};
