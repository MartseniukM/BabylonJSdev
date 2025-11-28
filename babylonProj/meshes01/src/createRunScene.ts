import { Vector3, Quaternion } from "@babylonjs/core";

import { SceneData } from "./interfaces";

// rotate box
let boxAngle: number = 0.3;
let boxSpeed: number = 0.001;


export default function createRunScene(runScene: SceneData) {
  runScene.scene.onAfterRenderObservable.add(() => {
    // rotate box
    const axis: Vector3 = new Vector3(0, 0, 1).normalize();
    const quat: Quaternion = Quaternion.RotationAxis(
      axis,
      boxAngle * 2 * Math.PI
    );
    runScene.box!.rotationQuaternion = quat;
    boxAngle += boxSpeed;
    boxAngle %= 1;
  })
}
 
