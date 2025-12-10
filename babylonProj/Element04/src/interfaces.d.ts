import {
  Scene,
  HemisphericLight,
  Camera,
  PhysicsAggregate,
} from "@babylonjs/core";

export interface SceneData {
  scene: Scene;
  light?: HemisphericLight;
  ground?: PhysicsAggregate;
  camera?: Camera;

  balls?: PhysicsAggregate[];      // три шара
  pins?: PhysicsAggregate[];       // все кегли
}
