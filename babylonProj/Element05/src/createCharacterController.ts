import "@babylonjs/loaders/glTF/2.0";

import {
  Scene,
  Vector3,
  MeshBuilder,
  PhysicsCharacterController,
  Quaternion,
  CharacterSupportedState,
  KeyboardEventTypes,
  StandardMaterial,
  Color3,
  SceneLoader,
  AbstractMesh,
  AnimationGroup,
  Mesh,
} from "@babylonjs/core";

type ControllerOptions = {
  arcadeMesh?: Mesh;
  onInteract?: () => void;
};

export function createCharacterController(scene: Scene, options: ControllerOptions = {}) {

  let characterState = "ON_GROUND";
  const inAirSpeed = 8.0;
  const onGroundSpeed = 10;
  const jumpHeight = 1.5;
  const characterGravity = new Vector3(0, -18, 0);

 
  let keyInput = new Vector3(0, 0, 0);
  let wantJump = false;

  
  let characterOrientation = Quaternion.Identity();

  
  const h = 1.8;
  const r = 0.6;

  const displayCapsule = MeshBuilder.CreateCapsule(
    "CharacterDisplay",
    { height: h, radius: r },
    scene
  );
  displayCapsule.position = new Vector3(0, h / 2, 0);

  const capsuleMat = new StandardMaterial("capsuleMat", scene);
  capsuleMat.diffuseColor = new Color3(0.8, 0.2, 0.2);
  capsuleMat.emissiveColor = new Color3(0.3, 0.1, 0.1);
  displayCapsule.material = capsuleMat;

 
  let idleAnim: AnimationGroup | null = null;
  let walkAnim: AnimationGroup | null = null;
  let isMoving = false;

  const updateAnimation = () => {
    if (!idleAnim && !walkAnim) return;

    const wantMove = keyInput.x !== 0 || keyInput.z !== 0;
    if (wantMove === isMoving) return;

    isMoving = wantMove;

    if (isMoving) {
      if (idleAnim) idleAnim.stop();
      if (walkAnim) walkAnim.play(true);
    } else {
      if (walkAnim) walkAnim.stop();
      if (idleAnim) idleAnim.play(true);
    }
  };

  
  const updateFacingFromInput = () => {
    if (keyInput.x === 0 && keyInput.z === 0) return;

    const angle = Math.atan2(keyInput.x, keyInput.z);
    const q = Quaternion.FromEulerAngles(0, angle, 0);

    characterOrientation = q;
    displayCapsule.rotationQuaternion = q;
  };

  
  SceneLoader.ImportMeshAsync("", "./assets/men/", "Farmer.gltf", scene)
    .then((result) => {
      const farmerRoot = result.meshes[0] as AbstractMesh;

      farmerRoot.parent = displayCapsule;
      farmerRoot.position = new Vector3(0, -0.9, 0);
      farmerRoot.scaling = new Vector3(1.4, 1.4, 1.4);
      farmerRoot.rotationQuaternion = Quaternion.Identity();

      const groups = result.animationGroups;

      if (groups && groups.length > 0) {
        idleAnim =
          groups.find((g) => g.name.toLowerCase().includes("idle")) || groups[0];

        walkAnim =
          groups.find((g) => {
            const n = g.name.toLowerCase();
            return n.includes("walk") || n.includes("run");
          }) || groups[1] || null;

        if (idleAnim) idleAnim.play(true);
      }

      
      displayCapsule.visibility = 0;
    })
    .catch((err) => {
      console.error("Failed to load Farmer.gltf", err);
    });

  // PHYSICS CHARACTER CONTROLLER 
  const characterController = new PhysicsCharacterController(
    displayCapsule.position.clone(),
    { capsuleHeight: h, capsuleRadius: r },
    scene
  );

  const getDesiredVelocity = function (
    deltaTime: number,
    supportInfo: {
      supportedState: CharacterSupportedState;
      averageSurfaceNormal: Vector3;
      averageSurfaceVelocity: Vector3;
    },
    currentVelocity: Vector3
  ): Vector3 {
    if (
      characterState === "ON_GROUND" &&
      supportInfo.supportedState !== CharacterSupportedState.SUPPORTED
    ) {
      characterState = "IN_AIR";
    } else if (
      characterState === "IN_AIR" &&
      supportInfo.supportedState === CharacterSupportedState.SUPPORTED
    ) {
      characterState = "ON_GROUND";
    }

    if (characterState === "ON_GROUND" && wantJump) {
      characterState = "START_JUMP";
    } else if (characterState === "START_JUMP") {
      characterState = "IN_AIR";
    }

    const upWorld = characterGravity.normalizeToNew().scale(-1.0);
    const forwardWorld = new Vector3(0, 0, 1);

    if (characterState === "IN_AIR") {
      const desiredVelocity = keyInput.scale(inAirSpeed);

      let outputVelocity = characterController.calculateMovement(
        deltaTime,
        forwardWorld,
        upWorld,
        currentVelocity,
        Vector3.ZeroReadOnly,
        desiredVelocity,
        upWorld
      );

      outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
      outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
      outputVelocity.addInPlace(characterGravity.scale(deltaTime));
      return outputVelocity;
    }

    if (characterState === "ON_GROUND") {
      const desiredVelocity = keyInput.scale(onGroundSpeed);

      let outputVelocity = characterController.calculateMovement(
        deltaTime,
        forwardWorld,
        supportInfo.averageSurfaceNormal,
        currentVelocity,
        supportInfo.averageSurfaceVelocity,
        desiredVelocity,
        upWorld
      );

      outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
      const inv1k = 1e-3;
      if (outputVelocity.dot(upWorld) > inv1k) {
        const velLen = outputVelocity.length();
        outputVelocity.normalizeFromLength(velLen);
        const horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
        const c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
        outputVelocity = c.cross(upWorld);
        outputVelocity.scaleInPlace(horizLen);
      }
      outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
      return outputVelocity;
    }

    if (characterState === "START_JUMP") {
      const upWorld2 = characterGravity.normalizeToNew().scale(-1.0);
      const u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
      const curRelVel = currentVelocity.dot(upWorld2);
      return currentVelocity.add(upWorld2.scale(u - curRelVel));
    }

    return Vector3.Zero();
  };


  scene.onBeforeRenderObservable.add(() => {
    displayCapsule.position.copyFrom(characterController.getPosition());
    updateAnimation();
  });

  
  scene.onAfterPhysicsObservable?.add(() => {
    if (scene.deltaTime === undefined) return;
    const dt = scene.deltaTime / 1000.0;
    if (dt === 0) return;

    const down = new Vector3(0, -1, 0);
    const support = characterController.checkSupport(dt, down);

    const desiredLinearVelocity = getDesiredVelocity(
      dt,
      support,
      characterController.getVelocity()
    );
    characterController.setVelocity(desiredLinearVelocity);
    characterController.integrate(dt, support, characterGravity);
  });

  
  scene.onKeyboardObservable.add((kbInfo) => {
    const key = kbInfo.event.key.toLowerCase();

    switch (kbInfo.type) {
      case KeyboardEventTypes.KEYDOWN:
        if (key === "w" || key === "arrowup") keyInput.z = 1;
        else if (key === "s" || key === "arrowdown") keyInput.z = -1;
        else if (key === "a" || key === "arrowleft") keyInput.x = -1;
        else if (key === "d" || key === "arrowright") keyInput.x = 1;
        else if (key === " ") wantJump = true;

        // INTERACT (E)
        else if (key === "e") {
          const arcade = options.arcadeMesh;
          const onInteract = options.onInteract;

          if (arcade && onInteract) {
            const dist = displayCapsule.position.subtract(arcade.position).length();
            if (dist < 2.0) {
              onInteract();
            }
          }
        }

        updateFacingFromInput();
        break;

      case KeyboardEventTypes.KEYUP:
        if (key === "w" || key === "s" || key === "arrowup" || key === "arrowdown") {
          keyInput.z = 0;
        }
        if (key === "a" || key === "d" || key === "arrowleft" || key === "arrowright") {
          keyInput.x = 0;
        }
        if (key === " ") wantJump = false;

        updateFacingFromInput();
        break;
    }
  });
}
