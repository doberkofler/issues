import shared from "./shared.cjs";

// HUGE PAYLOAD to make entryB the "primary" chunk
const payload = [];
for (let i = 0; i < 10000; i++) {
  payload.push({
    id: i,
    text: "Large payload to force entryB to absorb dependencies " + i,
  });
}

console.log("-----------------------------------------");
console.log("CRITICAL BUG: Entry B side-effect was triggered!");
console.log("-----------------------------------------");

if (typeof document !== "undefined") {
  const div = document.createElement("div");
  div.style.color = "red";
  div.style.fontSize = "2rem";
  div.innerHTML = "<h1>WRONG ENTRY EXECUTED: entryB</h1>";
  document.body.appendChild(div);
}

export const initB = () => console.log(shared.message, payload.length);
