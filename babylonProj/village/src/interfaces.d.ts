import {
  Scene,
  Mesh,
  HemisphericLight,
  Camera,
} from "@babylonjs/core";

export interface SceneData {
  scene: Scene;
  ground: Mesh;
  sky?: Mesh;
  lightHemispheric: HemisphericLight;
  camera: Camera;
}
