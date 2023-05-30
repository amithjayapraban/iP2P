export default function Info() {
  return (
    <div className="info hidden  bg-bg border border-[var(--gray)]  p-8     rounded-xl break-words md:max-w-[40vw] max-w-[80vw] md:right-4 right-5 md:top-5 top-5 absolute z-[99]">
      <div
        className="flex cursor-pointer absolute top-2 w-4 h-4 justify-center items-center p-0 bg-red-600 rounded-full right-2 z-[999]]  "
        onClick={() => document.querySelector(".info")?.classList.add("hidden")}
      ></div>
      <ul className=" text-xs  flex flex-col gap-2">
        <li>Make sure the devices are in the same network 🔍</li>
        <li>Select the other device and then choose the files to send 📂</li>
        <li>⚡</li>
        <li className="font- semibold italic text-[var(--textgray)] text-[.7rem]">
          Found any bugs? <br /> Reach out{" "}
          <a
            href="https://amith.vercel.app"
            target="_blank"
            className="   cursor-pointer w-[100%]  text-center justify-self-end self-center    "
          >
            @amithjayapraban
            {/* ⚡ */}
          </a>
        </li>
      </ul>
    </div>
  );
}
