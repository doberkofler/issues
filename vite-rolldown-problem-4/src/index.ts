import "./child";

const message = (text: string) => {
  console.log(`MESSAGE: ${text}`);
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML += `<div>${text}</div>`;
  }
};

const getRenderCount = () => {
  const key = "__viteCircularRenderCount";
  const globalObject = globalThis as typeof globalThis & {
    [key: string]: number | undefined;
  };
  globalObject[key] = (globalObject[key] ?? 0) + 1;
  return globalObject[key];
};

const render = () => {
  const renderCount = getRenderCount();
  message(
    "render called (If this appears twice, the double-execution bug is present)",
  );
  message(`render count: ${renderCount}`);
  message(`executed module url: ${import.meta.url}`);
};

// Simulate the entry point execution on load
render();
