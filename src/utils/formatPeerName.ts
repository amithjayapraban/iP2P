export const formatPeerName = (peer: string) => {
  const [name, deviceType] = peer.split("%");
  return {
    name: name.slice(0, 1).toUpperCase() + name.slice(1),
    deviceType,
  };
};
