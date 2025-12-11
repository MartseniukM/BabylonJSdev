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

  // Одна "главная" платформа (можно использовать как ground по заданию)
  ground?: PhysicsAggregate;

  // Все три дорожки
  grounds?: PhysicsAggregate[];

  // Три шара боулинга
  balls?: PhysicsAggregate[];

  // Все кегли
  pins?: PhysicsAggregate[];
}
