export default function Info() {
  return (
    <div className="info hidden  bg-bg border border-[var(--gray)]  p-8 italic    rounded-xl break-words md:max-w-[40vw] max-w-[80vw] md:right-5 right-2 md:top-6 top-5 absolute z-[99]">
      <div
        className="flex  absolute top-2 w-4 h-4 justify-center items-center p-0 bg-red-600 rounded-full right-2 z-[999]]  "
        onClick={() => document.querySelector(".info")?.classList.add("hidden")}
      ></div>
      <ul className=" text-xs  flex flex-col gap-2">
        <li>Make sure your the devices are in the same network 🔍</li>
        <li>Select the other device and then choose files to send 📂</li>
        <li>Boom ⚡</li>
      </ul>
    </div>
  );
}
