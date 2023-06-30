onmessage = (e) => {
  var file = e.data;
  let reader = new FileReader();
  console.log(e.target, "loaded");
  reader.addEventListener("load", (e) =>{
    console.log(e.target,'loaded');
    alert(JSON.stringify(e.target));
});


  file.arrayBuffer().then((buffer) => {
    const chunkSize = 64000;
    let total_len = buffer.byteLength;
    let total_chunks= total_len/chunkSize;
     postMessage(`len%${total_chunks}`);
    while (buffer.byteLength) {
      const chunk = buffer.slice(0, chunkSize);
      buffer = buffer.slice(chunkSize, buffer.byteLength);
      let w = (buffer.byteLength / total_len) * 100 - 100;
      postMessage({ chunk, w});
    }
    postMessage("completed");
  });
};
