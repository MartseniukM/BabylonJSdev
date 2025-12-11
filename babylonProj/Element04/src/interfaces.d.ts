import {
  Scene,
  HemisphericLight,
  Camera,
  PhysicsAggregate,
} from "@babylonjs/core";

export interface SceneData {
  scene: Scene;
  light?: HemisphericLight;
  camera?: Camera;

  // Основные физические элементы
  ground?: PhysicsAggregate;          // можно использовать как "центральную" платформу
  grounds?: PhysicsAggregate[];       // все платформы (3 дорожки)
  balls?: PhysicsAggregate[];         // три шара
  pins?: PhysicsAggregate[];          // все кегли
}
