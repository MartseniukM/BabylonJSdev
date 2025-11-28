import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  PointLight,
  SpotLight,
  MeshBuilder,
  Mesh,
  Light,
  Camera,
  Engine,
  StandardMaterial,
  Color3,
  ShadowGenerator,
  Texture,
  DirectionalLight,
} from "@babylonjs/core";

export interface SceneData {
      scene: Scene;
      box?: Mesh;
      light?: Light;
      dlLight?: DirectionalLight;
      spot?: SpotLight;
      hemi?: HemisphericLight;
      pointLight?: PointLight;
      sphere?: Mesh;
      cylinder?: Mesh;
      cone?: Mesh;
      triangle?: Mesh;
      capsule?: Mesh;
      ground?: Mesh;
      camera?: Camera;
    }

