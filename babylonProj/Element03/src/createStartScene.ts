import { SceneData } from "./interfaces";

import {
  Scene,
  ArcRotateCamera,
  Vector3,
  MeshBuilder,
  Mesh,
  StandardMaterial,
  HemisphericLight,
  Color3,
  Engine,
  Texture,
  SceneLoader,
  AbstractMesh,
  ISceneLoaderAsyncResult,
  Sound,
} from "@babylonjs/core";

function backgroundMusic(scene: Scene): Sound {
  const music = new Sound(
    "music",
    "./assets/audio/arcade-kid.mp3",
    scene,
    null,
    {
      loop: true,
      autoplay: true,
    }
  );

  // В Babylon 8 audioEngine может быть ещё не создан.
  // Делаем проверки, чтобы не было ошибки.
  if (Engine.audioEngine) {
    Engine.audioEngine.useCustomUnlockedButton = true;

    window.addEventListener(
      "click",
      () => {
        if (Engine.audioEngine && !Engine.audioEngine.unlocked) {
          Engine.audioEngine.unlock();
        }
      },
      { once: true }
    );
  }

  return music;
}


// ---------------- ИГРОК ----------------
function importPlayer(scene: Scene, x: number, z: number) {
  const item: Promise<void | ISceneLoaderAsyncResult> =
    SceneLoader.ImportMeshAsync(
      "",
      "./assets/models/men/", // папка: assets/models/men
      "dummy3.babylon",       // файл: dummy3.babylon
      scene
    );

  item.then((result) => {
    const character: AbstractMesh = result!.meshes[0];
    character.position.x = x;
    character.position.z = z;
    character.position.y = 0.1;
    character.scaling = new Vector3(1, 1, 1);
    character.rotation = new Vector3(0, 0, 0);
  });

  return item;
}

// ---------------- ПОЛ ----------------
function createGround(scene: Scene) {
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  const groundTexture = new Texture("./assets/textures/wood.jpg", scene);

  groundTexture.uScale = 4.0;
  groundTexture.vScale = 4.0;

  groundMaterial.diffuseTexture = groundTexture;
  groundMaterial.diffuseTexture.hasAlpha = true;
  groundMaterial.backFaceCulling = false;

  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 15, height: 15, subdivisions: 4 },
    scene
  );

  ground.material = groundMaterial;
  return ground;
}

// ---------------- СВЕТ ----------------
function createHemisphericLight(scene: Scene) {
  const light = new HemisphericLight(
    "light",
    new Vector3(2, 1, 0),
    scene
  );
  light.intensity = 0.7;
  light.diffuse = new Color3(1, 1, 1);
  light.specular = new Color3(1, 0.8, 0.8);
  light.groundColor = new Color3(0, 0.2, 0.7);
  return light;
}

// ---------------- КАМЕРА ----------------
function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2;
  let camBeta = Math.PI / 2.5;
  let camDist = 15;
  let camTarget = new Vector3(0, 0, 0);

  const camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 25;
  camera.lowerAlphaLimit = 0;
  camera.upperAlphaLimit = Math.PI * 2;
  camera.lowerBetaLimit = 0;
  camera.upperBetaLimit = Math.PI / 2.02;

  // важный момент: для Element 3 в примере камеру обычно НЕ привязывают,
  // чтобы стрелки не двигали камеру. Можно закомментировать.
  // camera.attachControl(true);

  return camera;
}

// ---------------- СОЗДАНИЕ СЦЕНЫ ----------------
export default function createStartScene(engine: Engine): SceneData {
  const scene = new Scene(engine);

  const ground = createGround(scene);
  const lightHemispheric = createHemisphericLight(scene);
  const camera = createArcRotateCamera(scene);
  const audio = backgroundMusic(scene);
  const player = importPlayer(scene, 0, 0); // спавним в центре

  const that: SceneData = {
    scene,
    ground,
    lightHemispheric,
    camera,
    audio,
    player,
  };

  return that;
}
