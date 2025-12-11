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
function createHemiLight(scene: Scene) {
  const light = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
  light.intensity = 0.4; // поменьше, чтобы тени были контрастней
  return light;
}

// Солнце для теней
function createSunLight(scene: Scene) {
  const sun = new DirectionalLight(
    "sunLight",
    new Vector3(-1, -2, -1),
    scene
  );
  sun.position = new Vector3(15, 20, -10);
  sun.intensity = 1.2;
  return sun;
}

// ------------------ PLATFORMS (3 дорожки) ------------------
function createLanes(scene: Scene): PhysicsAggregate[] {
  const lanes: PhysicsAggregate[] = [];

  const laneWidth = 5;
  const laneLength = 18;
  const laneZ = 3; // чуть вперёд от центра

  const laneMat = new StandardMaterial("laneMat", scene);
  laneMat.diffuseTexture = new Texture("./assets/textures/wood.jpg", scene);
  (laneMat.diffuseTexture as Texture).uScale = 2;
  (laneMat.diffuseTexture as Texture).vScale = 5;
  laneMat.specularColor = new Color3(0.2, 0.2, 0.2);

  const laneCentersX = [-6, 0, 6];

  laneCentersX.forEach((cx, i) => {
    const mesh = MeshBuilder.CreateGround(
      `lane_${i}`,
      { width: laneWidth, height: laneLength },
      scene
    );
    mesh.position.set(cx, 0, laneZ);
    mesh.material = laneMat;

    const agg = new PhysicsAggregate(
      mesh,
      PhysicsShapeType.BOX,
      { mass: 0 },
      scene
    );
    lanes.push(agg);
  });

  return lanes;
}

// ------------------ DIVIDERS (перегородки между дорожками) ------------------
function createDividers(scene: Scene): PhysicsAggregate[] {
  const divs: PhysicsAggregate[] = [];

  const dividerMat = new StandardMaterial("dividerMat", scene);
  dividerMat.diffuseColor = new Color3(0.7, 0.7, 0.8);
  dividerMat.specularColor = new Color3(0.9, 0.9, 1.0); // "серебристый" блеск
  dividerMat.emissiveColor = new Color3(0.1, 0.1, 0.15);

  const dividerPositionsX = [-3, 3];
  const length = 18;
  const width = 0.6;
  const height = 0.3;

  dividerPositionsX.forEach((x, i) => {
    const mesh = MeshBuilder.CreateBox(
      `divider_${i}`,
      {
        width: width,
        height: height,
        depth: length,
      },
      scene
    );
    mesh.position.set(x, height / 2, 3);
    mesh.material = dividerMat;

    const agg = new PhysicsAggregate(
      mesh,
      PhysicsShapeType.BOX,
      { mass: 0 },
      scene
    );
    divs.push(agg);
  });

  return divs;
}

// ------------------ WALLS (границы арены) ------------------
function createWalls(scene: Scene): PhysicsAggregate[] {
  const walls: PhysicsAggregate[] = [];

  const wallMat = new StandardMaterial("wallMat", scene);
  wallMat.diffuseColor = new Color3(0.5, 0.5, 0.55);
  wallMat.specularColor = new Color3(0.7, 0.7, 0.8);

  const laneTotalWidth = 3 * 5 + 2 * 0.6 + 2; // немного запасов
  const halfWidth = laneTotalWidth / 2; // слева/справа от центра
  const laneLength = 18;
  const laneZ = 3;

  const wallHeight = 2.5;
  const wallThickness = 0.4;

  // Левая стена (по Z)
  const leftWallMesh = MeshBuilder.CreateBox(
    "leftWall",
    {
      width: wallThickness,
      height: wallHeight,
      depth: laneLength + 4,
    },
    scene
  );
  leftWallMesh.position.set(-halfWidth, wallHeight / 2, laneZ);
  leftWallMesh.material = wallMat;
  walls.push(
    new PhysicsAggregate(
      leftWallMesh,
      PhysicsShapeType.BOX,
      { mass: 0 },
      scene
    )
  );

  // Правая стена (по Z)
  const rightWallMesh = leftWallMesh.clone("rightWall") as Mesh;
  rightWallMesh.position.x = halfWidth;
  walls.push(
    new PhysicsAggregate(
      rightWallMesh,
      PhysicsShapeType.BOX,
      { mass: 0 },
      scene
    )
  );

  // Задняя стена (со стороны игрока)
  const backWallMesh = MeshBuilder.CreateBox(
    "backWall",
    {
      width: laneTotalWidth,
      height: wallHeight,
      depth: wallThickness,
    },
    scene
  );
  backWallMesh.position.set(0, wallHeight / 2, laneZ - laneLength / 2 - 1);
  backWallMesh.material = wallMat;
  walls.push(
    new PhysicsAggregate(
      backWallMesh,
      PhysicsShapeType.BOX,
      { mass: 0 },
      scene
    )
  );

  // ВПЕРЕДИ (за кеглями) стен НЕ ДЕЛАЕМ

  return walls;
}

// ------------------ CAMERA ------------------
function createArcRotateCamera(scene: Scene): Camera {
  const camAlpha = -Math.PI / 2;
  const camBeta = Math.PI / 3;
  const camDist = 25;
  const camTarget = new Vector3(0, 2, 6);

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
      mass: 4,         // тяжёлый шар
      restitution: 0.05,
      friction: 0.3,
    },
    scene
  );
  ballAggregate.body.setCollisionCallbackEnabled(true);
  return { aggregate: ballAggregate, mesh: ballMesh };
}

// ------------------ PINS (кегли СТАРОЙ ФОРМЫ) ------------------
function createPinPrototype(scene: Scene): Mesh {
  const pin = MeshBuilder.CreateCylinder(
    "pinProto",
    {
      height: 1.2,
      diameterTop: 0.18,
      diameterBottom: 0.4,
      tessellation: 24,
    },
    scene
  );
  pin.position.y = 0.6;

  const pinMat = new StandardMaterial("pinMat", scene);
  pinMat.diffuseColor = new Color3(0.9, 0.1, 0.1); // красные
  pinMat.emissiveColor = new Color3(0.3, 0.0, 0.0);
  pin.material = pinMat;

  return pin;
}

// один треугольник кеглей для одной дорожки
function createPinsForLane(
  scene: Scene,
  laneCenterX: number,
  pinProto: Mesh
): PhysicsAggregate[] {
  const pinsAgg: PhysicsAggregate[] = [];

  // Острый угол ближе к игроку
  const baseZ = 6;       // позиция вершины треугольника
  const dz = 0.7;
  const dx = 0.4;

  const layoutLocal: Vector3[] = [
    // ряд 1 — вершина (ближе к игроку)
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
    const pin =
      index === 0
        ? pinProto
        : (pinProto.clone(`pin_${laneCenterX}_${index}`) as Mesh);

    pin.position = new Vector3(
      laneCenterX + localPos.x,
      0.6,
      localPos.z
    );

    const pinAgg = new PhysicsAggregate(
      pin,
      PhysicsShapeType.CYLINDER,
      {
        mass: 0.3,
        restitution: 0.1,
        friction: 0.4,
      },
      scene
    );

    pinAgg.body.setCollisionCallbackEnabled(true);

    // pins collide with each other + с шаром, стенами и дорожкой
    pinAgg.shape.filterMembershipMask = 4;
    pinAgg.shape.filterCollideMask = 4 | 1 | 2 | 8 | 16;

    pinsAgg.push(pinAgg);
  });

  return pinsAgg;
}

function createAllPins(scene: Scene): { pinsAgg: PhysicsAggregate[]; pinMeshes: Mesh[] } {
  const pinProto = createPinPrototype(scene);

  const laneXs = [-6, 0, 6];

  const allAgg: PhysicsAggregate[] = [];
  const allMeshes: Mesh[] = [];

  laneXs.forEach((x, i) => {
    const proto =
      i === 0 ? pinProto : (pinProto.clone(`pinProto_${i}`) as Mesh);
    const lanePins = createPinsForLane(scene, x, proto);
    allAgg.push(...lanePins);

    // собрать все меши для теней
    lanePins.forEach((agg) => {
      if (agg.transformNode && agg.transformNode instanceof Mesh) {
        allMeshes.push(agg.transformNode as Mesh);
      }
    });
  });

  return { pinsAgg: allAgg, pinMeshes: allMeshes };
}

// ------------------ TREES / GLTF (ТОЛЬКО ПО КРАЯМ) ------------------
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
    root.position = new Vector3(12, 0, 0);
    root.scaling = new Vector3(0.6, 0.6, 0.6);
    task.loadedMeshes.forEach((mesh: any) => (mesh.isVisible = true));

    const clone = root.clone("tree1_clone", null);
    clone!.position = new Vector3(-12, 0, 0);
  };

  const tree2 = assetsManager.addMeshTask(
    "tree2 task",
    "",
    "./assets/nature/gltf/",
    "CommonTree_2.gltf"
  );
  tree2.onSuccess = (task) => {
    task.loadedMeshes[0].position = new Vector3(10, 0, -5);
    task.loadedMeshes[0].scaling = new Vector3(0.6, 0.6, 0.6);

    const clone = task.loadedMeshes[0].clone("tree2_clone", null);
    clone!.position = new Vector3(-10, 0, -5);
  };

  const tree3 = assetsManager.addMeshTask(
    "tree3 task",
    "",
    "./assets/nature/gltf/",
    "CommonTree_3.gltf"
  );
  tree3.onSuccess = (task) => {
    task.loadedMeshes[0].position = new Vector3(0, 0, -10);
    task.loadedMeshes[0].scaling = new Vector3(0.6, 0.6, 0.6);
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

  const hemiLight = createHemiLight(scene);
  const sunLight = createSunLight(scene);

  const laneAggregates = createLanes(scene);
  const dividerAggregates = createDividers(scene);
  const wallAggregates = createWalls(scene);

  const camera = createArcRotateCamera(scene);

  // --- шары трёх цветов на трёх дорожках ---
  const ballsAgg: PhysicsAggregate[] = [];
  const shadowCasters: Mesh[] = [];

  const ball1 = createBall(
    scene,
    "ballGreen",
    new Vector3(-6, 0.5, -2),
    new Color3(0.0, 0.3, 0.0)
  );
  ballsAgg.push(ball1.aggregate);
  shadowCasters.push(ball1.mesh);

  const ball2 = createBall(
    scene,
    "ballYellow",
    new Vector3(0, 0.5, -2),
    new Color3(0.8, 0.8, 0.0)
  );
  ballsAgg.push(ball2.aggregate);
  shadowCasters.push(ball2.mesh);

  const ball3 = createBall(
    scene,
    "ballBlue",
    new Vector3(6, 0.5, -2),
    new Color3(0.0, 0.0, 0.4)
  );
  ballsAgg.push(ball3.aggregate);
  shadowCasters.push(ball3.mesh);

  // --- кегли на трёх дорожках ---
  const { pinsAgg, pinMeshes } = createAllPins(scene);
  pinMeshes.forEach((m) => shadowCasters.push(m));

  const assetsManager = addAssets(scene);
  assetsManager.load();

  createSkybox(scene);

  // --- ТЕНИ ---
  const shadowGenerator = new ShadowGenerator(2048, sunLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 64;
  shadowGenerator.darkness = 0.95;

  shadowCasters.forEach((m) => shadowGenerator.addShadowCaster(m, true));

  // все платформы принимают тени
  laneAggregates.forEach((agg) => {
    const m = agg.transformNode as Mesh;
    m.receiveShadows = true;
  });

  const that: SceneData = {
    scene,
    light: hemiLight,
    camera,
    ground: laneAggregates[1],
    grounds: laneAggregates,
    balls: ballsAgg,
    pins: pinsAgg,
  };

  return that;
}
