import {} from "@babylonjs/core";

import { SceneData } from "./interfaces";

export default function createRunScene(runScene: SceneData) {
 

  runScene.scene.onAfterRenderObservable.add(() => {});
}
