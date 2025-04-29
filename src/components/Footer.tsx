import React from "react";
interface FooterProps {
  myName: string;
}
export const Footer = ({ myName }: FooterProps) => {
  return (
    <div className=" w-full flex flex-col gap-6  mb-5 mt-10 justify-center items-center ">
      <span className=" pulsing rounded-full "></span>
      <span className="text-xs flex flex-col justify-center items-center ">
        <span className="text-[var(--textgray)] text-[.6rem] italic">
          You are known as{" "}
        </span>
        {myName.slice(0, 1).toLocaleUpperCase() + myName.slice(1)}
      </span>
    </div>
  );
};
