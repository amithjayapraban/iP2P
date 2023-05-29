export default function ToggleTheme() {
  function toggle() {
    let body: any = document.querySelector("body");
    let mode = body.getAttribute("data-theme");
    mode == "dark"
      ? body.setAttribute("data-theme", "light")
      : body.setAttribute("data-theme", "dark");
  }

  return (
    <div
      onClick={() => toggle()}
      className="text-textc shadow bg-textc flex items-center justify-center aspect-square text-xs rounded-full"
    >
      <img height={24} width={24} src="/src/assets/theme.svg" alt="" />
    </div>
  );
}
