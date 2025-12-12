import { Engine } from "@babylonjs/core";
import "./main.css";

import createStartScene from "./createStartScene"; // ROOM scene (A)
import createRunScene from "./createRunScene";     // SNAKE scene (B)
import { createCharacterController } from "./createCharacterController";
import { createRoomGUI, createSnakeGUI } from "./gui";

const CanvasName = "renderCanvas";

const canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

const engine = new Engine(canvas, true, {}, true);

(async function main() {
  // --- Scene A (Room) ---
  const roomData = await createStartScene(engine);

  // Character controller (фермер) + E interaction
  createCharacterController(roomData.scene, {
    arcadeMesh: roomData.arcadeMachine,
    onInteract: () => {
      activeScene = snakeData.scene;
    },
  });

  // Room GUI (Press E prompt)
  const roomGuiApi = createRoomGUI(roomData.scene);

  // --- Scene B (Snake) ---
  const snakeData = await createRunScene(engine);
  const snakeGuiApi = createSnakeGUI(snakeData.scene);

  // Back button => reload whole site (как ты хотел)
  snakeGuiApi.onBack = () => window.location.reload();

  // --- Distance prompt update (show/hide) ---
  roomData.scene.onBeforeRenderObservable.add(() => {
    // фермерская капсула называется "CharacterDisplay"
    const player = roomData.scene.getMeshByName("CharacterDisplay");
    if (!player) {
      roomGuiApi.showPressE(false);
      return;
    }

    const dist = player.position.subtract(roomData.arcadeMachine.position).length();
    roomGuiApi.showPressE(dist < 2.0);
  });

  // --- Active scene render loop ---
  let activeScene = roomData.scene;

  engine.runRenderLoop(() => {
    activeScene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
})();
