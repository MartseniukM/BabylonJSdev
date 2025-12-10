import { ExecuteCodeAction } from "@babylonjs/core/Actions";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { Scene } from "@babylonjs/core/scene";

export let keyDownMap: { [key: string]: boolean } = {};
let keyDown: number = 0;

// 2 = кнопка удерживается
export function keyDownHeld() {
  keyDown = 2;
}

// 0 — не нажата, 1 — только что нажата, 2 — удерживается
export function getKeyDown(): number {
  return keyDown;
}

export function keyActionManager(scene: Scene) {
  // KeyDown
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      { trigger: ActionManager.OnKeyDownTrigger },
      (evt) => {
        if (keyDown === 0) {
          keyDown = 1;
        }
        keyDownMap[evt.sourceEvent.key] = true;
      }
    )
  );

  // KeyUp
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      { trigger: ActionManager.OnKeyUpTrigger },
      (evt) => {
        keyDown = 0;
        keyDownMap[evt.sourceEvent.key] = false;
      }
    )
  );

  return scene.actionManager;
}
