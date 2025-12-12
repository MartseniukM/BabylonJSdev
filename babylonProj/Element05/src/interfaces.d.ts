import {
  Scene,
  Camera,
  HemisphericLight,
  DirectionalLight,
  Mesh,
} from "@babylonjs/core";

export interface RoomSceneData {
  scene: Scene;
  camera: Camera;
  hemiLight?: HemisphericLight;
  sunLight?: DirectionalLight;

  // Arcade machine (distance check)
  arcadeMachine: Mesh;
}

export interface SnakeSceneData {
  scene: Scene;
  camera: Camera;
}
