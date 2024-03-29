onmessage = (e) => {
  var file = e.data;
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
