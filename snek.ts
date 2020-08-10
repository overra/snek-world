import { SnekGame } from "./lib/SnekGame";
import "./app.css";

function init() {
  const snek = document.querySelector("#snek");
  new SnekGame({
    container: snek,
    blockSize: 20,
  });
}

init();
