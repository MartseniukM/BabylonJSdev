//import "@babylonjs/core/Debug/debugLayer";
//import "@babylonjs/inspector";
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

function createHemisphericLight(scene: Scene) {
  const light: HemisphericLight = new HemisphericLight("light", new Vector3(1, 10, 0), scene);
  light.intensity = 0.3;
  light.diffuse = new Color3(1, 0, 0);
  light.specular = new Color3(0, 1, 0);
  light.groundColor = new Color3(0, 1, 0);
  return light;
}

function createPointLight(scene: Scene) {
  const light = new PointLight("light", new Vector3(-1, 1, 0), scene);
  light.position = new Vector3(5, 20, 10);
  light.intensity = 0.6;
  light.diffuse = new Color3(0.5, 1, 1);
  light.specular = new Color3(0.8, 1, 1);
  return light;
}

function createDirectionalLight(scene: Scene) {
  const light = new DirectionalLight("light", new Vector3(-0.2, -0.5, -0.2), scene);
  light.position = new Vector3(20, 40, 20);
  light.intensity = 0.7;
  light.diffuse = new Color3(1, 0, 0);
  light.specular = new Color3(0, 1, 0);
  return light;
}

function createSpotLight(scene: Scene) {
  const light = new SpotLight("light", new Vector3(0, 5, -3),
    new Vector3(0, 0, 1), Math.PI / 3, 20, scene);
  light.intensity = 0.5;
  light.diffuse = new Color3(1, 0, 0);
  light.specular = new Color3(0, 1, 0);
  return light;
}


function createPointShadows(light: PointLight, meshes: Mesh[]) {
  const shadower = new ShadowGenerator(1024, light);
  const sm: any = shadower.getShadowMap();

  
  for (let m of meshes) {
    if (m) {
      sm.renderList.push(m);
    }
  }

  shadower.setDarkness(0.25);                
  shadower.useBlurExponentialShadowMap = true;
  shadower.blurScale = 4;
  shadower.blurBoxOffset = 1;
  shadower.useKernelBlur = true;
  shadower.blurKernel = 32;
  shadower.bias = 0;

  return shadower;
}


function createDirectionalShadows(light: DirectionalLight, meshes: Mesh[]) {
  const shadower = new ShadowGenerator(1024, light);
  const sm: any = shadower.getShadowMap();

  for (let m of meshes) {
    if (m) {
      sm.renderList.push(m);
    }
  }

  shadower.setDarkness(1.0);                
  shadower.useBlurExponentialShadowMap = true;
  shadower.blurScale = 4;
  shadower.blurBoxOffset = 1;
  shadower.useKernelBlur = true;
  shadower.blurKernel = 64;
  shadower.bias = 0;

  return shadower;
}

function getMaterial(scene: Scene) {
  scene.ambientColor = new Color3(0.5, 1, 1);
  const myMaterial = new StandardMaterial("myMaterial", scene);
  myMaterial.diffuseColor = new Color3(1, 0, 1);
  myMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
  myMaterial.emissiveColor = new Color3(1, 0.4, 0.5);
  myMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);
  myMaterial.ambientTexture = new Texture("./../meshes01/assets/textures/grass.dds.jpg", scene);
  return myMaterial;
}

function createSphere(scene: Scene) {
  const sphere = MeshBuilder.CreateSphere(
    "ellipsoid",
    { diameter: 0.7, diameterY: 2, segments: 16 },
    scene,
  );
  sphere.position.x = 0;
  sphere.position.y = 1;
  return sphere;
}

function createBox(scene: Scene, myMaterial: any) {
  const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
  box.position.x = 3;
  box.position.y = 1;
  box.material = myMaterial;
  return box;
}

function createCylinder(scene: Scene) {
  const cylinder = MeshBuilder.CreateCylinder("cylinder", { height: 2, arc: 0.5, diameter: 1 }, scene);
  cylinder.position.x = 5;
  cylinder.position.y = 1;
  return cylinder;
}

function createCone(scene: Scene) {
  const cone = MeshBuilder.CreateCylinder("cone", { diameterTop: 0, diameterBottom: 1, height: 2 }, scene);
  cone.position.x = 7;
  cone.position.y = 1;
  return cone;
}

function createTriangle(scene: Scene) {
  const triangle = MeshBuilder.CreateCylinder("triangle", { height: 2, diameter: 1, tessellation: 3 }, scene);
  triangle.position.x = 9;
  triangle.position.y = 1;
  return triangle;
}

function createCapsule(scene: Scene) {
  const capsule = MeshBuilder.CreateCapsule("capsule", { height: 2, radius: 0.5, tessellation: 4, subdivisions: 4 }, scene);
  capsule.position.x = -3;
  capsule.position.y = 1;
  return capsule;
}

function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  return light;
}

function createGround(scene: Scene) {
  let ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
  var groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.backFaceCulling = false;
  groundMaterial.diffuseColor = new Color3(1, 0, 0);
  ground.material = groundMaterial;
  ground.receiveShadows = true;   
  return ground;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 10,
    camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene,
  );
  camera.attachControl(true);
  return camera;
}

export default function createStartScene(engine: Engine) {

  interface SceneData {
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

  let that: SceneData = { scene: new Scene(engine) };
  

  const mat1 = getMaterial(that.scene);
  that.hemi = createHemisphericLight(that.scene);
  that.pointLight = createPointLight(that.scene);
  that.dlLight = createDirectionalLight(that.scene);
  that.spot = createSpotLight(that.scene);
  that.box = createBox(that.scene, mat1);
  that.light = createLight(that.scene);
  that.sphere = createSphere(that.scene);
  that.cylinder = createCylinder(that.scene);
  that.cone = createCone(that.scene);
  that.triangle = createTriangle(that.scene);
  that.capsule = createCapsule(that.scene);
  that.ground = createGround(that.scene);
  that.camera = createArcRotateCamera(that.scene);

  
  const allMeshes: Mesh[] = [];
  if (that.box) allMeshes.push(that.box);
  if (that.sphere) allMeshes.push(that.sphere);
  if (that.cylinder) allMeshes.push(that.cylinder);
  if (that.cone) allMeshes.push(that.cone);
  if (that.triangle) allMeshes.push(that.triangle);
  if (that.capsule) allMeshes.push(that.capsule);

  
  if (that.pointLight) {
    createPointShadows(that.pointLight, allMeshes);
  }

  
  if (that.dlLight) {
    createDirectionalShadows(that.dlLight, allMeshes);
  }

  return that;
}
