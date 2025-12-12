import {
  Scene,
  Engine,
  Vector3,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Mesh,
  KeyboardEventTypes,
  Observable,
} from "@babylonjs/core";

import { SnakeSceneData } from "./interfaces";

type GridPos = { x: number; y: number };

function same(a: GridPos, b: GridPos) {
  return a.x === b.x && a.y === b.y;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function createRunScene(engine: Engine): Promise<SnakeSceneData> {
  const scene = new Scene(engine);

  // --- typed observable for GUI updates ---
  const score$ = new Observable<number>();
  scene.metadata = scene.metadata ?? {};
  (scene.metadata as any).score$ = score$;

  // Light
  const hemi = new HemisphericLight("snakeLight", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.9;

  // Camera (perspective from above, pulled back a bit)
  const camera = new FreeCamera("snakeCamera", new Vector3(0, 26, -6), scene);
  camera.setTarget(new Vector3(0, 0, 0));
  // static (no attachControl)

  // Grid settings
  const GRID = 20;
  const CELL = 1;
  const half = (GRID * CELL) / 2;

  // Floor
  const floor = MeshBuilder.CreateGround("snakeFloor", { width: GRID, height: GRID }, scene);

  const floorMat = new StandardMaterial("snakeFloorMat", scene);
  floorMat.diffuseColor = new Color3(0.25, 0.25, 0.25);
  floorMat.specularColor = new Color3(0.05, 0.05, 0.05);
  floor.material = floorMat;

  // Borders (visible cube borders)
  const wallMat = new StandardMaterial("wallMatSnake", scene);
  wallMat.diffuseColor = new Color3(0.6, 0.6, 0.65);

  const wallMeshes: Mesh[] = [];
  const wallY = 0.5;

  for (let i = 0; i < GRID; i++) {
    // top row (y = GRID-1)
    {
      const m = MeshBuilder.CreateBox(`wall_t_${i}`, { size: 1 }, scene);
      m.position = new Vector3(-half + 0.5 + i, wallY, -half + 0.5 + (GRID - 1));
      m.material = wallMat;
      wallMeshes.push(m);
    }
    // bottom row (y = 0)
    {
      const m = MeshBuilder.CreateBox(`wall_b_${i}`, { size: 1 }, scene);
      m.position = new Vector3(-half + 0.5 + i, wallY, -half + 0.5 + 0);
      m.material = wallMat;
      wallMeshes.push(m);
    }
    // left col (x = 0)
    {
      const m = MeshBuilder.CreateBox(`wall_l_${i}`, { size: 1 }, scene);
      m.position = new Vector3(-half + 0.5 + 0, wallY, -half + 0.5 + i);
      m.material = wallMat;
      wallMeshes.push(m);
    }
    // right col (x = GRID-1)
    {
      const m = MeshBuilder.CreateBox(`wall_r_${i}`, { size: 1 }, scene);
      m.position = new Vector3(-half + 0.5 + (GRID - 1), wallY, -half + 0.5 + i);
      m.material = wallMat;
      wallMeshes.push(m);
    }
  }

  // Snake materials
  const snakeMat = new StandardMaterial("snakeMat", scene);
  snakeMat.diffuseColor = new Color3(0.1, 0.8, 0.2);

  const foodMat = new StandardMaterial("foodMat", scene);
  foodMat.diffuseColor = new Color3(0.9, 0.2, 0.2);
  foodMat.emissiveColor = new Color3(0.2, 0.05, 0.05);

  // State
  let dir: GridPos = { x: 1, y: 0 };
  let nextDir: GridPos = { x: 1, y: 0 };
  let score = 0;

  let snake: GridPos[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  let food: GridPos = { x: 14, y: 10 };

  // Meshes for snake
  const segmentMeshes: Mesh[] = [];
  function ensureSegmentMeshes() {
    while (segmentMeshes.length < snake.length) {
      const m = MeshBuilder.CreateBox(`seg_${segmentMeshes.length}`, { size: 0.9 }, scene);
      m.material = snakeMat;
      m.position.y = 0.45;
      segmentMeshes.push(m);
    }
    while (segmentMeshes.length > snake.length) {
      segmentMeshes.pop()!.dispose();
    }
  }

  // Food mesh
  const foodMesh = MeshBuilder.CreateBox("food", { size: 0.9 }, scene);
  foodMesh.material = foodMat;
  foodMesh.position.y = 0.45;

  function gridToWorld(p: GridPos): Vector3 {
    return new Vector3(-half + 0.5 + p.x, 0.45, -half + 0.5 + p.y);
  }

  function placeFood() {
    while (true) {
      const candidate = { x: randInt(1, GRID - 2), y: randInt(1, GRID - 2) };
      const onSnake = snake.some((s) => same(s, candidate));
      if (!onSnake) {
        food = candidate;
        foodMesh.position = gridToWorld(food);
        return;
      }
    }
  }

  function renderSnake() {
    ensureSegmentMeshes();
    for (let i = 0; i < snake.length; i++) {
      segmentMeshes[i].position = gridToWorld(snake[i]);
    }
  }

  function isWall(p: GridPos) {
    return p.x <= 0 || p.x >= GRID - 1 || p.y <= 0 || p.y >= GRID - 1;
  }

  function isSelf(p: GridPos) {
    for (let i = 1; i < snake.length; i++) {
      if (same(snake[i], p)) return true;
    }
    return false;
  }

  function gameOver() {
    setTimeout(() => window.location.reload(), 900);
  }

  function restartSnakeOnly() {
    score = 0;
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    placeFood();
    renderSnake();
    score$.notifyObservers(score);
  }

  // init
  placeFood();
  renderSnake();
  score$.notifyObservers(score);

  // Keyboard (WASD)
  scene.onKeyboardObservable.add((kb) => {
    if (kb.type !== KeyboardEventTypes.KEYDOWN) return;

    const k = kb.event.key.toLowerCase();
    const trySet = (nx: number, ny: number) => {
      if (dir.x === -nx && dir.y === -ny) return; // no 180° turn
      nextDir = { x: nx, y: ny };
    };

    if (k === "w") trySet(0, 1);
    if (k === "s") trySet(0, -1);
    if (k === "a") trySet(-1, 0);
    if (k === "d") trySet(1, 0);

    if (k === "r") restartSnakeOnly();
  });

  // Tick loop (constant speed)
  const STEP = 0.18;
  let acc = 0;

  scene.onBeforeRenderObservable.add(() => {
    const dt = (scene.getEngine().getDeltaTime() || 0) / 1000;
    acc += dt;
    if (acc < STEP) return;
    acc -= STEP;

    dir = nextDir;

    const head = snake[0];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    if (isWall(newHead) || isSelf(newHead)) {
      gameOver();
      return;
    }

    snake.unshift(newHead);

    if (same(newHead, food)) {
      score += 1;
      placeFood();
      score$.notifyObservers(score);
    } else {
      snake.pop();
    }

    renderSnake();
  });

  // API for GUI
  (scene.metadata as any).snakeApi = {
    restart: () => restartSnakeOnly(),
    getScore: () => score,
  };

  return { scene, camera };
}
