onmessage = (e) => {
  var file = e.data.file;

  file.arrayBuffer().then((buffer) => {
    const chunkSize = 16 * 1024;
    let total_len = buffer.byteLength;
    while (buffer.byteLength) {
      const chunk = buffer.slice(0, chunkSize);
      buffer = buffer.slice(chunkSize, buffer.byteLength);

      let w = (buffer.byteLength / total_len) * 100 - 100;

      postMessage({ chunk, w });
    }
    postMessage("completed");
  });
};

// file.arrayBuffer().then((buffer: any) => {
// const chunkSize = 16 * 1024;
// let total_len = buffer.byteLength;
// var prog1: any = document.querySelector(".progress");
// prog1.classList.remove("w-0");
// var prog: any = document.getElementById("progress");
// while (buffer.byteLength) {
//   const chunk = buffer.slice(0, chunkSize);
//   buffer = buffer.slice(chunkSize, buffer.byteLength);
//   dataChannel.send(chunk);

//   prog.style.opacity = "1";
//   let w = (buffer.byteLength / total_len) * 100 - 100;
//   prog.style.width = `${Math.abs(w * 2)}%`;
//   console.log(Math.abs(w));
// }
