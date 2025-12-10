import {} from "@babylonjs/core";

import { SceneData } from "./interfaces";

export default function createRunScene(runScene: SceneData) {
 
//stash for messages to other scripts via externalData
  var stash: { [key: string]: string } = { message: "Empty Stash" };
 




  
  runScene.scene.onAfterRenderObservable.add(() => {});
}
