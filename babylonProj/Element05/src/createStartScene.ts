import "@babylonjs/loaders/glTF/2.0";
import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";

import {
  Scene,
  Engine,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  MeshBuilder,
  ArcRotateCamera,
  StandardMaterial,
  Color3,
  Texture,
  CubeTexture,
  ShadowGenerator,
  Mesh,
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
} from "@babylonjs/core";

import { RoomSceneData } from "./interfaces";

function createHemiLight(scene: Scene) {
  const light = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
  light.intensity = 0.45;
  return light;
}

function createSunLight(scene: Scene) {
  const sun = new DirectionalLight("sunLight", new Vector3(-1, -2, -1), scene);
  sun.position = new Vector3(15, 20, -10);
  sun.intensity = 1.2;
  return sun;
}

function createSkybox(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);

  const skyboxMaterial = new StandardMaterial("skyBoxMat", scene);
  skyboxMaterial.backFaceCulling = false;

  // если папка skybox осталась из Element4 — будет работать
  skyboxMaterial.reflectionTexture = new CubeTexture("./assets/skybox/skybox", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skyboxMaterial.disableLighting = true;

  skybox.material = skyboxMaterial;
  (skybox as any).infiniteDistance = true;
}

function createStaticCamera(scene: Scene) {
  // “как ArcRotate”, но статично (не attachControl)
  const camera = new ArcRotateCamera(
    "roomCamera",
    -Math.PI / 2,
    Math.PI / 3,
    18,
    new Vector3(0, 2, 2),
    scene
  );
  // не вызываем attachControl — камера статична
  return camera;
}

function createRoom(scene: Scene): { floor: Mesh; walls: Mesh[] } {
  // FLOOR
  const floor = MeshBuilder.CreateGround("floor", { width: 16, height: 16 }, scene);
  floor.position = new Vector3(0, 0, 0);

  const floorMat = new StandardMaterial("floorMat", scene);
  // оставляем “как сейчас” (wood.jpg из Element4)
  floorMat.diffuseTexture = new Texture("./assets/textures/wood.jpg", scene);
  (floorMat.diffuseTexture as Texture).uScale = 3;
  (floorMat.diffuseTexture as Texture).vScale = 3;
  floorMat.specularColor = new Color3(0.2, 0.2, 0.2);
  floor.material = floorMat;

  // простые стены
  const wallMat = new StandardMaterial("wallMat", scene);
  wallMat.diffuseColor = new Color3(0.6, 0.6, 0.65);

  const wallH = 3;
  const wallT = 0.3;
  const size = 16;

  const back = MeshBuilder.CreateBox("wallBack", { width: size, height: wallH, depth: wallT }, scene);
  back.position = new Vector3(0, wallH / 2, -size / 2);
  back.material = wallMat;

  const front = MeshBuilder.CreateBox("wallFront", { width: size, height: wallH, depth: wallT }, scene);
  front.position = new Vector3(0, wallH / 2, size / 2);
  front.material = wallMat;

  const left = MeshBuilder.CreateBox("wallLeft", { width: wallT, height: wallH, depth: size }, scene);
  left.position = new Vector3(-size / 2, wallH / 2, 0);
  left.material = wallMat;

  const right = MeshBuilder.CreateBox("wallRight", { width: wallT, height: wallH, depth: size }, scene);
  right.position = new Vector3(size / 2, wallH / 2, 0);
  right.material = wallMat;

  return { floor, walls: [back, front, left, right] };
}

function createArcadeMachine(scene: Scene): Mesh {
  // корпус
  const body = MeshBuilder.CreateBox("arcadeBody", { width: 1.2, height: 2.2, depth: 1.0 }, scene);
  body.position = new Vector3(4, 1.1, 2);

  const bodyMat = new StandardMaterial("arcadeBodyMat", scene);
  bodyMat.diffuseColor = new Color3(0.1, 0.2, 0.9); // синий
  body.material = bodyMat;

  // экран
  const screen = MeshBuilder.CreateBox("arcadeScreen", { width: 0.8, height: 0.6, depth: 0.05 }, scene);
  screen.position = new Vector3(4, 1.5, 2 - 0.53);

  const screenMat = new StandardMaterial("screenMat", scene);
  screenMat.diffuseColor = new Color3(0.98, 0.98, 0.98); // очень белый
  screenMat.emissiveColor = new Color3(0.6, 0.6, 0.6);
  screen.material = screenMat;

  // кнопки
  const btn = MeshBuilder.CreateBox("arcadeButton", { width: 0.3, height: 0.1, depth: 0.3 }, scene);
  btn.position = new Vector3(4, 1.0, 2 - 0.53);

  const btnMat = new StandardMaterial("btnMat", scene);
  btnMat.diffuseColor = new Color3(0.9, 0.2, 0.2);
  btn.material = btnMat;

  // делаем “машину” одним мешем для distance check: возвращаем body
  // (screen и btn просто рядом)
  return body;
}

export default async function createStartScene(engine: Engine): Promise<RoomSceneData> {
  const scene = new Scene(engine);

  // Havok нужен для PhysicsCharacterController
  const havokInstance: HavokPhysicsWithBindings = await HavokPhysics({
    locateFile: (path) => "/" + path,
  });
  const hk = new HavokPlugin(true, havokInstance);
  scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

  const hemiLight = createHemiLight(scene);
  const sunLight = createSunLight(scene);

  const camera = createStaticCamera(scene);

  const { floor, walls } = createRoom(scene);
  createSkybox(scene);

  // Физика: пол + стены как static collider’ы
  new PhysicsAggregate(floor, PhysicsShapeType.BOX, { mass: 0 }, scene);
  walls.forEach((w) => new PhysicsAggregate(w, PhysicsShapeType.BOX, { mass: 0 }, scene));

  const arcadeMachine = createArcadeMachine(scene);
  new PhysicsAggregate(arcadeMachine, PhysicsShapeType.BOX, { mass: 0 }, scene);

  // Тени
  const shadowGenerator = new ShadowGenerator(1024, sunLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;
  shadowGenerator.darkness = 0.85;

  // floor принимает тени
  floor.receiveShadows = true;

  // машина отбрасывает тени
  shadowGenerator.addShadowCaster(arcadeMachine, true);

  return {
    scene,
    camera,
    hemiLight,
    sunLight,
    arcadeMachine,
  };
}
