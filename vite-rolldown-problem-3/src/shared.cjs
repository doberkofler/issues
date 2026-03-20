// Massive CommonJS module (approx 1MB)
const data = [];
for (let i = 0; i < 20000; i++) {
  data.push({
    id: i,
    text:
      "Long text to fill space and increase file size for chunking heuristics " +
      i,
    more: "Additional property to ensure we hit the size threshold where things get interesting",
  });
}
module.exports = {
  message: "I am a shared CommonJS module",
  data: data,
};
