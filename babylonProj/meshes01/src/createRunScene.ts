import { Vector3, Quaternion } from "@babylonjs/core";
import { SceneData } from "./interfaces";


let boxAngle: number = 0.3;
let boxSpeed: number = 0.01;

let spherePhase: number = 0;   
let lightAngle: number = 0;    

export default function createRunScene(runScene: SceneData) {
  runScene.scene.onAfterRenderObservable.add(() => {

    
    if (runScene.box) {
      const axis: Vector3 = new Vector3(0, 0, 1).normalize();
      const quat: Quaternion = Quaternion.RotationAxis(
        axis,
        boxAngle * 0.5 * Math.PI
      );
      runScene.box.rotationQuaternion = quat;
    }
    boxAngle += boxSpeed;
    boxAngle %= 1;

    
    if (runScene.sphere) {
      
      runScene.sphere.position.y = 1.5 + Math.sin(spherePhase) * 0.3;
    }
    spherePhase += 0.02;

    
    if (runScene.cylinder) {
      runScene.cylinder.rotation.y += 0.01;
    }
    if (runScene.cone) {
      runScene.cone.rotation.y -= 0.012;
    }
    if (runScene.triangle) {
      runScene.triangle.rotation.y += 0.008;
    }
    if (runScene.capsule) {
      runScene.capsule.rotation.y -= 0.01;
    }

    
    if (runScene.pointLight) {
      const radius = 10;
      runScene.pointLight.position.x = radius * Math.cos(lightAngle);
      runScene.pointLight.position.z = radius * Math.sin(lightAngle);
      runScene.pointLight.position.y = 15;
    }
    lightAngle += 0.01;
  });
}
