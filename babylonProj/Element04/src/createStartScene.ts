import "@babylonjs/loaders/glTF/2.0";

import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";

import {
  Scene,
  ArcRotateCamera,
  AssetsManager,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Camera,
  Engine,
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
  Color3,
  StandardMaterial,
  Texture,
  CubeTexture,
  Mesh,
  DirectionalLight,
  ShadowGenerator,
} from "@babylonjs/core";

import { SceneData } from "./interfaces";

// ------------------ LIGHT ------------------
function createLight(scene: Scene) {
  const light = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
  light.intensity = 0.6;
  return light;
}

// Дополнительный "солнце"-свет для теней
function createSunLight(scene: Scene) {
  const sun = new DirectionalLight(
    "sunLight",
    new Vector3(-1, -2, -1),
    scene
  );
  sun.position = new Vector3(10, 15, -10);
  sun.intensity = 1.0;
  return sun;
}

// ------------------ GROUND (одна широкая дорожка под 3 lanes) ------------------
function createGround(scene: Scene): PhysicsAggregate {
  const groundMesh = MeshBuilder.CreateGround(
    "ground",
    { width: 18, height: 18 },
    scene
  );
  groundMesh.position.z = 2;

  const mat = new StandardMaterial("laneMat", scene);
  mat.diffuseTexture = new Texture("./assets/textures/wood.jpg", scene);
  (mat.diffuseTexture as Texture).uScale = 6;
  (mat.diffuseTexture as Texture).vScale = 6;
  mat.specularColor = new Color3(0.2, 0.2, 0.2);
  groundMesh.material = mat;

  const groundAggregate = new PhysicsAggregate(
    groundMesh,
    PhysicsShapeType.BOX,
    { mass: 0 },
    scene
  );

  return groundAggregate;
}

// ------------------ CAMERA ------------------
function createArcRotateCamera(scene: Scene): Camera {
  const camAlpha = -Math.PI / 2;
  const camBeta = Math.PI / 3;
  const camDist = 22;
  const camTarget = new Vector3(0, 1, 5);

  const camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.attachControl(true);
  return camera;
}

// ------------------ BALL (шар) ------------------
function createBall(
  scene: Scene,
  name: string,
  position: Vector3,
  color: Color3
): { aggregate: PhysicsAggregate; mesh: Mesh } {
  const ballMesh = MeshBuilder.CreateSphere(
    name,
    { diameter: 1 },
    scene
  );
  ballMesh.position = position.clone();

  const ballMat = new StandardMaterial(name + "Mat", scene);
  ballMat.diffuseColor = color;
  ballMat.emissiveColor = color.scale(0.3);
  ballMesh.material = ballMat;

  const ballAggregate = new PhysicsAggregate(
    ballMesh,
    PhysicsShapeType.SPHERE,
    {
      mass: 1,
      restitution: 0.2,
      friction: 0.6,
    },
    scene
  );
  ballAggregate.body.setCollisionCallbackEnabled(true);
  return { aggregate: ballAggregate, mesh: ballMesh };
}

// ------------------ PINS (кегли) ------------------
// делаем чуть более "пузатую" форму кегли через lathe
function createPinPrototype(scene: Scene): Mesh {
  const profile: Vector3[] = [];

  // Профиль кегли в XZ-плоскости (вращаем вокруг Y)
  // снизу вверх
  profile.push(new Vector3(0.0, 0.0, 0));  // низ
  profile.push(new Vector3(0.25, 0.05, 0));
  profile.push(new Vector3(0.3, 0.3, 0));
  profile.push(new Vector3(0.2, 0.7, 0));
  profile.push(new Vector3(0.12, 1.0, 0));
  profile.push(new Vector3(0.08, 1.2, 0)); // макушка

  const pin = MeshBuilder.CreateLathe(
    "pinProto",
    {
      shape: profile,
      tessellation: 24,
    },
    scene
  );
  pin.position.y = 0.0; // основание на земле, высота ≈1.2

  const pinMat = new StandardMaterial("pinMat", scene);
  pinMat.diffuseColor = new Color3(0.9, 0.1, 0.1); // красные
  pinMat.emissiveColor = new Color3(0.3, 0.0, 0.0);
  pin.material = pinMat;

  return pin;
}

// создаём треугольник кеглей острым углом к игроку для одного lane
function createPinsForLane(
  scene: Scene,
  laneCenterX: number,
  pinProto: Mesh
): { aggregates: PhysicsAggregate[]; meshes: Mesh[] } {
  const pinsAgg: PhysicsAggregate[] = [];
  const pinsMeshes: Mesh[] = [];

  // локальная раскладка: острый угол ближе к игроку
  const baseZ = 4;      // ближе к игроку
  const dz = 0.7;       // шаг по Z
  const dx = 0.35;      // шаг по X

  const layoutLocal: Vector3[] = [
    // ряд 1 — острый угол (ближе всего)
    new Vector3(0, 0, baseZ),

    // ряд 2
    new Vector3(-dx, 0, baseZ + dz),
    new Vector3(dx, 0, baseZ + dz),

    // ряд 3
    new Vector3(-2 * dx, 0, baseZ + 2 * dz),
    new Vector3(0, 0, baseZ + 2 * dz),
    new Vector3(2 * dx, 0, baseZ + 2 * dz),

    // ряд 4
    new Vector3(-3 * dx, 0, baseZ + 3 * dz),
    new Vector3(-dx, 0, baseZ + 3 * dz),
    new Vector3(dx, 0, baseZ + 3 * dz),
    new Vector3(3 * dx, 0, baseZ + 3 * dz),
  ];

  layoutLocal.forEach((localPos, index) => {
    const mesh =
      index === 0
        ? pinProto
        : (pinProto.clone(`pinMesh_${laneCenterX}_${index}`) as Mesh);

    mesh.position = new Vector3(
      laneCenterX + localPos.x,
      localPos.y,
      localPos.z
    );

    const agg = new PhysicsAggregate(
      mesh,
      PhysicsShapeType.CONVEX_HULL,
      {
        mass: 0.6,
        restitution: 0.05,
        friction: 0.7,
      },
      scene
    );
    agg.body.setCollisionCallbackEnabled(true);

    pinsAgg.push(agg);
    pinsMeshes.push(mesh);
  });

  return { aggregates: pinsAgg, meshes: pinsMeshes };
}

// создаём 3 дорожки: левую, центральную, правую
function createAllPins(
  scene: Scene
): { aggregates: PhysicsAggregate[]; meshes: Mesh[] } {
  const pinProto = createPinPrototype(scene);

  const laneXs = [-6, 0, 6]; // центры трёх дорожек
  const allAgg: PhysicsAggregate[] = [];
  const allMeshes: Mesh[] = [];

  laneXs.forEach((x, i) => {
    const { aggregates, meshes } = createPinsForLane(scene, x, i === 0 ? pinProto : pinProto.clone(`pinProto_${i}`) as Mesh);
    allAgg.push(...aggregates);
    allMeshes.push(...meshes);
  });

  return { aggregates: allAgg, meshes: allMeshes };
}

// ------------------ TREES / GLTF ------------------
function addAssets(scene: Scene) {
  const assetsManager = new AssetsManager(scene);

  const tree1 = assetsManager.addMeshTask(
    "tree1 task",
    "",
    "./assets/nature/gltf/",
    "CommonTree_1.gltf"
  );
  tree1.onSuccess = (task) => {
    const root = task.loadedMeshes[0];
    root.position = new Vector3(8, 0, 0);
    root.scaling = new Vector3(0.5, 0.5, 0.5);
    task.loadedMeshes.forEach((mesh: any) => (mesh.isVisible = true));

    const clone = root.clone("tree1_clone", null);
    clone!.position = new Vector3(-8, 0, 0);
  };

  const tree2 = assetsManager.addMeshTask(
    "tree2 task",
    "",
    "./assets/nature/gltf/",
    "CommonTree_2.gltf"
  );
  tree2.onSuccess = (task) => {
    task.loadedMeshes[0].position = new Vector3(6, 0, -4);
    task.loadedMeshes[0].scaling = new Vector3(0.5, 0.5, 0.5);

    const clone = task.loadedMeshes[0].clone("tree2_clone", null);
    clone!.position = new Vector3(-6, 0, -4);
  };

  const tree3 = assetsManager.addMeshTask(
    "tree3 task",
    "",
    "./assets/nature/gltf/",
    "CommonTree_3.gltf"
  );
  tree3.onSuccess = (task) => {
    task.loadedMeshes[0].position = new Vector3(0, 0, -6);
    task.loadedMeshes[0].scaling = new Vector3(0.5, 0.5, 0.5);
  };

  assetsManager.onTaskErrorObservable.add((task) => {
    console.log(
      "task failed",
      task.errorObject.message,
      task.errorObject.exception
    );
  });

  return assetsManager;
}

// ------------------ SKYBOX ------------------
function createSkybox(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);

  const skyboxMaterial = new StandardMaterial("skyBoxMat", scene);
  skyboxMaterial.backFaceCulling = false;

  skyboxMaterial.reflectionTexture = new CubeTexture(
    "./assets/skybox/skybox",
    scene
  );
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skyboxMaterial.disableLighting = true;

  skybox.material = skyboxMaterial;
  (skybox as any).infiniteDistance = true;
}

// ------------------ START SCENE ------------------
export default async function createStartScene(
  engine: Engine
): Promise<SceneData> {
  const scene = new Scene(engine);

  const havokInstance: HavokPhysicsWithBindings = await HavokPhysics({
    locateFile: (path) => "/" + path, // /HavokPhysics.wasm
  });

  const hk = new HavokPlugin(true, havokInstance);
  scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

  const hemiLight = createLight(scene);
  const sunLight = createSunLight(scene);
  const groundAgg = createGround(scene);
  const camera = createArcRotateCamera(scene);

  // --- шары трёх цветов, на трёх дорожках ---
  const ballsAgg: PhysicsAggregate[] = [];
  const shadowCasters: Mesh[] = [];

  const ball1 = createBall(
    scene,
    "ballGreen",
    new Vector3(-6, 0.5, -4),
    new Color3(0.0, 0.3, 0.0) // тёмно зелёный
  );
  ballsAgg.push(ball1.aggregate);
  shadowCasters.push(ball1.mesh);

  const ball2 = createBall(
    scene,
    "ballYellow",
    new Vector3(0, 0.5, -4),
    new Color3(0.8, 0.8, 0.0) // жёлтый
  );
  ballsAgg.push(ball2.aggregate);
  shadowCasters.push(ball2.mesh);

  const ball3 = createBall(
    scene,
    "ballBlue",
    new Vector3(6, 0.5, -4),
    new Color3(0.0, 0.0, 0.4) // тёмно-синий
  );
  ballsAgg.push(ball3.aggregate);
  shadowCasters.push(ball3.mesh);

  // --- кегли на трёх дорожках ---
  const { aggregates: pinsAgg, meshes: pinsMeshes } = createAllPins(scene);
  pinsMeshes.forEach((m) => shadowCasters.push(m));

  const assetsManager = addAssets(scene);
  assetsManager.load();

  createSkybox(scene);

  // --- ТЕНИ ---
  const shadowGenerator = new ShadowGenerator(2048, sunLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 64;
  shadowGenerator.darkness = 0.5;

  shadowCasters.forEach((m) => shadowGenerator.addShadowCaster(m, true));

  // земля принимает тени
  const groundMesh = groundAgg.transformNode as Mesh;
  groundMesh.receiveShadows = true;

  const that: SceneData = {
    scene,
    light: hemiLight,
    ground: groundAgg,
    camera,
    balls: ballsAgg,
    pins: pinsAgg,
  };

  return that;
}
