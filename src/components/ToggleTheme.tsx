export default function ToggleTheme() {
  function toggle() {
    let body: any = document.querySelector("body");
    let mode = body.getAttribute("data-theme");
    mode == "dark"
      ? body.setAttribute("data-theme", "light")
      : body.setAttribute("data-theme", "dark");
    mode == "dark"
      ? localStorage.setItem("theme", "light")
      : localStorage.setItem("theme", "dark");
    const themeColor: any = document.querySelector('meta[name="theme-color"]');
    const color = mode == "dark" ? "#fafafa" : "#121212";
    themeColor.setAttribute("content", color);
  }

  return (
    <div
      onClick={() => toggle()}
      className="text-textc shadow cursor-pointer bg- textc flex w-6 h-6  items-center justify-center aspect-square text-xs rounded-full"
    >
      <img height={24} width={24} src="/src/assets/theme.svg" alt="" />
    </div>
  );
}
