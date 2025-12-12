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
  DirectionalLight,
  ShadowGenerator,
} from "@babylonjs/core";


function backgroundMusic(scene: Scene): Sound {
  const music = new Sound(
    "music",
    "./assets/audio/arcade-kid.mp3",
    scene,
    null,
    {
      loop: true,
      autoplay: false, 
      volume: 1,
    }
  );


  window.addEventListener(
    "pointerdown",
    () => {
      if (!music.isPlaying) {
        music.play();
      }
    },
    { once: true }
  );

  return music;
}


function importPlayer(scene: Scene, x: number, z: number) {
  const item: Promise<void | ISceneLoaderAsyncResult> =
    SceneLoader.ImportMeshAsync(
      "",
      "./assets/models/men/",
      "dummy3.babylon",
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


function createGround(scene: Scene) {
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  const groundTexture = new Texture("./assets/textures/wood.jpg", scene);

  groundTexture.uScale = 4.0;
  groundTexture.vScale = 4.0;

  groundMaterial.diffuseTexture = groundTexture;
  groundMaterial.diffuseTexture.hasAlpha = true;
  groundMaterial.backFaceCulling = false;


  const ground1 = MeshBuilder.CreateGround(
    "ground1",
    { width: 15, height: 15, subdivisions: 4 },
    scene
  );
  ground1.material = groundMaterial;
  ground1.position.x = -10;

  const ground2 = ground1.clone("ground2") as Mesh;
  ground2.position.x = 10;
 
  const bridgeMat = new StandardMaterial("bridgeMat", scene);
  bridgeMat.diffuseColor = new Color3(0.4, 0.25, 0.1); 

  const bridge = MeshBuilder.CreateBox(
    "bridge",
    {
      width: 10,   
      height: 0.3, 
      depth: 4,    
    },
    scene
  );
  bridge.material = bridgeMat;
  bridge.position.set(0, 0.15, 0);

  return ground1;
}

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

function createSunLight(scene: Scene) {
  const sun = new DirectionalLight(
    "sunLight",
    new Vector3(-1, -2, -1),
    scene
  );
  sun.position = new Vector3(0, 10, 0);
  sun.intensity = 1.0;
  return sun;
}

function createArcRotateCamera(scene: Scene) {
  const camAlpha = -Math.PI / 2;
  const camBeta = Math.PI / 2.5;
  const camDist = 25;
  const camTarget = new Vector3(0, 0, 0);

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


  return camera;
}

export default function createStartScene(engine: Engine): SceneData {
  const scene = new Scene(engine);

  const ground = createGround(scene);
  const lightHemispheric = createHemisphericLight(scene);
  const sunLight = createSunLight(scene);
  const camera = createArcRotateCamera(scene);
  const audio = backgroundMusic(scene);

  const player = importPlayer(scene, -10, 0);

  const shadowGenerator = new ShadowGenerator(2048, sunLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 64;
  shadowGenerator.darkness = 0.7; 

  player.then((result) => {
    const character = result!.meshes[0] as AbstractMesh;
    shadowGenerator.addShadowCaster(character, true);
  });

  ground.receiveShadows = true;

  const ground2 = scene.getMeshByName("ground2");
  if (ground2) {
    ground2.receiveShadows = true;
  }

  const bridge = scene.getMeshByName("bridge");
  if (bridge) {
    bridge.receiveShadows = true;
  }

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
