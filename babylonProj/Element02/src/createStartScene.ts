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
  CubeTexture,
  Nullable,
  Vector4,
  InstancedMesh,
  SpriteManager,
  Sprite,
  DirectionalLight,
  ShadowGenerator,
  PointLight,
} from "@babylonjs/core";


function createTerrain(scene: Scene) {
  const largeGroundMat = new StandardMaterial("largeGroundMat", scene);
  largeGroundMat.diffuseTexture = new Texture(
    "./assets/environments/valleygrass.png",
    scene
  );

  const largeGround = MeshBuilder.CreateGroundFromHeightMap(
    "largeGround",
    "./assets/environments/villageheightmap.png",
    {
      width: 150,
      height: 150,
      subdivisions: 20,
      minHeight: 0,
      maxHeight: 10,
    },
    scene
  );

  largeGround.material = largeGroundMat;
  largeGround.position.y = -0.01;

  return largeGround;
}


function createGround(scene: Scene) {
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseTexture = new Texture(
    "./assets/environments/villagegreen.png",
    scene
  );
  groundMaterial.diffuseTexture.hasAlpha = true;
  groundMaterial.backFaceCulling = false;

  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 24, height: 24 },
    scene
  );
  ground.material = groundMaterial;
  ground.position.y = 0.01;
  return ground;
}


function createHemisphericLight(scene: Scene) {
  const light = new HemisphericLight(
    "light",
    new Vector3(2, 1, 0),
    scene
  );
  light.intensity = 0.8;
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
  sun.position = new Vector3(20, 40, 20);
  sun.intensity = 0.7;
  return sun;
}


function createSky(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
  const skyboxMaterial = new StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture(
    "./assets/textures/skybox/skybox",
    scene
  );
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
  return skybox;
}


function createBox(style: number) {
  const boxMat = new StandardMaterial("boxMat");
  const faceUV: Vector4[] = [];

  if (style === 1) {
    boxMat.diffuseTexture = new Texture("./assets/textures/cubehouse.png");
    faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); // rear
    faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); // front
    faceUV[2] = new Vector4(0.25, 0.0, 0.5, 1.0); // right
    faceUV[3] = new Vector4(0.75, 0.0, 1.0, 1.0); // left
  } else {
    boxMat.diffuseTexture = new Texture("./assets/textures/semihouse.png");
    faceUV[0] = new Vector4(0.6, 0.0, 1.0, 1.0); // rear
    faceUV[1] = new Vector4(0.0, 0.0, 0.4, 1.0); // front
    faceUV[2] = new Vector4(0.4, 0.0, 0.6, 1.0); // right
    faceUV[3] = new Vector4(0.4, 0.0, 0.6, 1.0); // left
  }

  const box = MeshBuilder.CreateBox("box", {
    width: style,
    height: 1,
    faceUV,
    wrap: true,
  });
  box.position = new Vector3(0, 0.5, 0);
  box.material = boxMat;
  return box;
}

function createRoof(style: number) {
  const roof = MeshBuilder.CreateCylinder("roof", {
    diameter: 1.3,
    height: 1.2,
    tessellation: 3,
  });
  roof.scaling.x = 0.75;
  roof.scaling.y = style * 0.85;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.22;

  const roofMat = new StandardMaterial("roofMat");
  roofMat.diffuseTexture = new Texture("./assets/textures/roof.jpg");
  roof.material = roofMat;
  return roof;
}

function createHouse(scene: Scene, style: number): Mesh {
  const box = createBox(style);
  const roof = createRoof(style);
  const house = Mesh.MergeMeshes(
    [box, roof],
    true,
    false,
    undefined,
    false,
    true
  ) as Mesh; 
  return house;
}


function createHouses(scene: Scene, style: number): (Mesh | InstancedMesh)[] {
  const allHouses: (Mesh | InstancedMesh)[] = [];

  if (style === 1) {
    const h = createHouse(scene, 1);
    allHouses.push(h);
    return allHouses;
  }
  if (style === 2) {
    const h = createHouse(scene, 2);
    allHouses.push(h);
    return allHouses;
  }

  if (style === 3) {
    const houses: Nullable<Mesh>[] = [];

   
    houses[0] = createHouse(scene, 1);
    houses[0]!.rotation.y = -Math.PI / 16;
    houses[0]!.position.x = -6.8;
    houses[0]!.position.z = 2.5;
    allHouses.push(houses[0]!);

    houses[1] = createHouse(scene, 2);
    houses[1]!.rotation.y = -Math.PI / 16;
    houses[1]!.position.x = -4.5;
    houses[1]!.position.z = 3;
    allHouses.push(houses[1]!);

    const ihouses: InstancedMesh[] = [];
    const places: number[][] = []; 

    places.push([2, -Math.PI / 16, -1.5, 4]);
    places.push([2, -Math.PI / 3, 1.5, 6]);
    places.push([2, (15 * Math.PI) / 16, -6.4, -1.5]);
    places.push([1, (15 * Math.PI) / 16, -4.1, -1]);
    places.push([2, (15 * Math.PI) / 16, -2.1, -0.5]);
    places.push([1, (5 * Math.PI) / 4, 0, -1]);
    places.push([1, Math.PI + Math.PI / 2.5, 0.5, -3]);
    places.push([2, Math.PI + Math.PI / 2.1, 0.75, -5]);
    places.push([1, Math.PI + Math.PI / 2.25, 0.75, -7]);
    places.push([2, Math.PI / 1.9, 4.75, -1]);
    places.push([1, Math.PI / 1.95, 4.5, -3]);
    places.push([2, Math.PI / 1.9, 4.75, -5]);
    places.push([1, Math.PI / 1.9, 4.75, -7]);
    places.push([2, -Math.PI / 3, 5.25, 2]);
    places.push([1, -Math.PI / 3, 6, 4]);

    for (let i = 0; i < places.length; i++) {
      if (places[i][0] === 1) {
        ihouses[i] = houses[0]!.createInstance("house" + i);
      } else {
        ihouses[i] = houses[1]!.createInstance("house" + i);
      }
      ihouses[i].rotation.y = places[i][1];
      ihouses[i].position.x = places[i][2];
      ihouses[i].position.z = places[i][3];

      allHouses.push(ihouses[i]);
    }
  }

  return allHouses;
}


function createLantern(scene: Scene) {
  // столб
  const post = MeshBuilder.CreateCylinder(
    "lampPost",
    {
      height: 1.4,
      diameter: 0.1,
    },
    scene
  );
  post.position = new Vector3(0, 0.7, 0.8);

  const postMat = new StandardMaterial("lampPostMat", scene);
  postMat.diffuseColor = new Color3(0.2, 0.2, 0.2);
  post.material = postMat;

  
  const bulb = MeshBuilder.CreateSphere(
    "lampBulb",
    { diameter: 0.25 },
    scene
  );
  bulb.position = new Vector3(0, 1.3, 0.8);

  const bulbMat = new StandardMaterial("lampBulbMat", scene);
  bulbMat.emissiveColor = new Color3(1, 0.85, 0.5); 
  bulb.material = bulbMat;

  
  const lanternLight = new PointLight(
    "lanternLight",
    new Vector3(0, 1.28, 0.8),
    scene
  );
  lanternLight.intensity = 0.9;
  lanternLight.range = 8;

  return { post, bulb, lanternLight };
}


function createTrees(scene: Scene) {
  const spriteManagerTrees = new SpriteManager(
    "treesManager",
    "./assets/sprites/tree.png",
    4000,
    { width: 512, height: 1024 },
    scene
  );

  const innerHalfSize = 15;
  const outerHalfSize = 45;
  const treesPerSide = 800;

  
  for (let i = 0; i < treesPerSide; i++) {
    const tree = new Sprite("tree", spriteManagerTrees);
    tree.position.x =
      -innerHalfSize - Math.random() * (outerHalfSize - innerHalfSize);
    tree.position.z = (Math.random() * 2 - 1) * outerHalfSize;
    tree.position.y = 0.2;
  }

  
  for (let i = 0; i < treesPerSide; i++) {
    const tree = new Sprite("tree", spriteManagerTrees);
    tree.position.x =
      innerHalfSize + Math.random() * (outerHalfSize - innerHalfSize);
    tree.position.z = (Math.random() * 2 - 1) * outerHalfSize;
    tree.position.y = 0.2;
  }

  
  for (let i = 0; i < treesPerSide; i++) {
    const tree = new Sprite("tree", spriteManagerTrees);
    tree.position.z =
      innerHalfSize + Math.random() * (outerHalfSize - innerHalfSize);
    tree.position.x = (Math.random() * 2 - 1) * outerHalfSize;
    tree.position.y = 0.2;
  }

  
  for (let i = 0; i < treesPerSide; i++) {
    const tree = new Sprite("tree", spriteManagerTrees);
    tree.position.z =
      -innerHalfSize - Math.random() * (outerHalfSize - innerHalfSize);
    tree.position.x = (Math.random() * 2 - 1) * outerHalfSize;
    tree.position.y = 0.2;
  }
}


function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2;
  let camBeta = Math.PI / 2.5;
  let camDist = 25;
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

  camera.attachControl(true);
  return camera;
}


export default function createStartScene(engine: Engine): SceneData {
  const scene = new Scene(engine);

  const ground = createGround(scene);
  const terrain = createTerrain(scene);

  const lightHemispheric = createHemisphericLight(scene);
  const sunLight = createSunLight(scene);

  const sky = createSky(scene);

  const houses = createHouses(scene, 3);
  const lantern = createLantern(scene); 
  createTrees(scene);

  const camera = createArcRotateCamera(scene);

  
  const shadowGenerator = new ShadowGenerator(2048, sunLight);
  houses.forEach((h) => shadowGenerator.addShadowCaster(h));
  shadowGenerator.addShadowCaster(lantern.post);
  shadowGenerator.addShadowCaster(lantern.bulb);

  ground.receiveShadows = true;
  terrain.receiveShadows = true;

  const that: SceneData = {
    scene,
    ground,
    sky,
    lightHemispheric,
    camera,
  };
  return that;
}
