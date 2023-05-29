export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet";
  }
  if (/ipad/i.test(ua)) {
    return "iPad";
  }
  if (
    /Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "Android";
  }
  if (/Mac OS/.test(ua) && !/Mobile/.test(ua)) {
    return "Mac";
  }
  if (/iPhone/.test(ua)) {
    return "iPhone";
  }
  return "Desktop";
};
