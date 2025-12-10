import { Engine } from "@babylonjs/core";
import createStartScene from "./createStartScene";
import createRunScene from "./createRunScene";
import "./main.css";

// берём canvas из HTML
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

const eng = new Engine(canvas, true, {}, true);
const startScene = createStartScene(eng);
createRunScene(startScene);

eng.runRenderLoop(() => {
  startScene.scene.render();
});

window.addEventListener("resize", () => {
  eng.resize();
});
