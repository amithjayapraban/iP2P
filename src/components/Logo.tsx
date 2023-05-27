export default function Logo({baseURL}:any,connection:boolean) {
    console.log(connection)
  return (
    <svg
      onClick={() => {
        window.location.assign(baseURL);
      }}
      className="logo  flex justify-items-start  items-start  self-end md:ml-6 md:mt-6 ml-3 mt-3  md:scale-[.71] scale-[.7] origin-top-left  "
      width="59"
      height="57"
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {connection ? (
        <rect x="8.67798" width="112.814" height="128" rx="4" fill="#3EF994" />
      ) : (
        <rect x="8.67798" width="112.814" height="128" rx="4" fill="#C5C5C5" />
      )}
      <path
        opacity="0.8"
        d="M4.33902 8.49121C4.33902 6.28207 6.12988 4.49121 8.33902 4.49121H119.661C121.87 4.49121 123.661 6.28207 123.661 8.49121V104.526C123.661 110.049 119.184 114.526 113.661 114.526H14.339C8.81617 114.526 4.33902 110.049 4.33902 104.526V8.49121Z"
        fill="white"
      />
      {connection ? (
        <rect y="8.98254" width="128" height="119.018" rx="4" fill="#3EF994" />
      ) : (
        <rect y="8.98254" width="128" height="119.018" rx="4" fill="#C5C5C5" />
      )}
      {connection ? (
        <rect y="8.98254" width="128" height="119.018" rx="4" fill="#3EF994" />
      ) : (
        <rect y="8.98254" width="128" height="119.018" rx="4" fill="#C5C5C5" />
      )}
      <path
        d="M40.9948 99.8066L65.6429 66.1838L81.2224 77.1493L40.9948 99.8066Z"
        fill="white"
      />
      <path
        d="M88.2796 36.3356L63.615 69.9456L48.041 58.9719L88.2796 36.3356Z"
        fill="white"
      />
    </svg>
  );
}
