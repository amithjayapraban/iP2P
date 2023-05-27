
export default function Info() {
  return (
    <div
      onClick={() => document.querySelector(".info")?.classList.add("hidden")}
      className="info hidden   backdrop-blur bg-lb  shadow-3xl text-white p-3 py-6  rounded-[10px] break-words md:max-w-[40vw] max-w-[80vw] md:right-5 right-2 md:top-6 top-5 absolute z-[99]"
    >
      <div
        className="flex  absolute top-2 w-4 h-4 justify-center items-center p-0 bg-red-600 rounded-full right-2 z-[999]]  "
        onClick={() => document.querySelector(".info")?.classList.add("hidden")}
      ></div>
      <ol className="px-6 text-[.9rem] flex flex-col gap-1">
        <li> 1. Scan the QR Code 🔍</li>
        <li> 2. Click Recieve 📂</li>
        <li> 3. You're now connected ⚡</li>
      </ol>
      <p className=" px-6 mt-4 text-gray-100 text-xs">
        {" "}
        Can't scan QR Code? Just add the name at the end of the URL 😀{" "}
      </p>
    </div>
  );
}
