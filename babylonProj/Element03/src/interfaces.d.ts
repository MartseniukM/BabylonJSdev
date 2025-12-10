import {
  Scene,
  Sound,
  Mesh,
  HemisphericLight,
  Camera,
  ISceneLoaderAsyncResult,
} from "@babylonjs/core";

export interface SceneData {
  scene: Scene;
  ground: Mesh;
  lightHemispheric: HemisphericLight;
  camera: Camera;

  audio: Sound;
  player: Promise<void | ISceneLoaderAsyncResult>;
}
