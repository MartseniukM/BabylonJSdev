import {
  AbstractMesh,
  ActionManager,
  CubeTexture,
} from "@babylonjs/core";

import { SceneData } from "./interfaces";
import {
  keyActionManager,
  keyDownMap,
  keyDownHeld,
  getKeyDown,
} from "./keyActionManager";

export default function createRunScene(runScene: SceneData) {
  // actionManager
  runScene.scene.actionManager = new ActionManager(runScene.scene);
  keyActionManager(runScene.scene);

  // SKYBOX 
  const environmentTexture = new CubeTexture(
    "./assets/textures/industrialSky.env",
    runScene.scene
  );
  runScene.scene.createDefaultSkybox(
    environmentTexture,
    true,
    1000,
    0.1
  );

  runScene.scene.onBeforeRenderObservable.add(() => {
    if (getKeyDown() === 1 && (keyDownMap["m"] || keyDownMap["M"])) {
      keyDownHeld();
      if (runScene.audio.isPlaying) {
        runScene.audio.stop();
      } else {
        runScene.audio.play();
      }
    }

    runScene.player.then((result) => {
      const character: AbstractMesh = result!.meshes[0];

      if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
        character.position.x -= 0.05;
        character.rotation.y = (3 * Math.PI) / 2;
      }
      if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
        character.position.z -= 0.05;
        character.rotation.y = Math.PI;
      }
      if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
        character.position.x += 0.05;
        character.rotation.y = Math.PI / 2;
      }
      if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
        character.position.z += 0.05;
        character.rotation.y = 0;
      }
    });
  });

  runScene.scene.onAfterRenderObservable.add(() => {
  });
}
