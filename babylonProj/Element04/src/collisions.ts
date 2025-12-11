import { SceneData } from "./interfaces";
import { setText } from "./gui";

// общий лог
const collideCB = (collision: {
  collider: { transformNode: { name: any } };
  collidedAgainst: { transformNode: { name: any } };
  point: any;
  distance: any;
  impulse: any;
  normal: any;
}): void => {
  console.log(
    "collideCB",
    collision.collider.transformNode.name,
    collision.collidedAgainst.transformNode.name
  );
};

// лог шаров + вывод в GUI
const collideBallCB = (collision: {
  collider: { transformNode: { name: any } };
  collidedAgainst: { transformNode: { name: any } };
  point: any;
  distance: any;
  impulse: any;
  normal: any;
}): void => {
  console.log(
    "BALL COLLISION",
    collision.collider.transformNode.name,
    "→",
    collision.collidedAgainst.transformNode.name
  );

  setText(`Collider: ${collision.collider.transformNode.name}`, 1);
  setText(`Hit: ${collision.collidedAgainst.transformNode.name}`, 2);
  setText(`X: ${collision.point.x.toFixed(2)}`, 3);
  setText(`Z: ${collision.point.z.toFixed(2)}`, 4);
};

export function setupCollisions(sceneData: SceneData): void {
  const FILTER_GROUP_GROUND = 1;
  const FILTER_GROUP_BALL = 2;
  const FILTER_GROUP_PIN = 4;

  // --- ground / grounds ---
  const grounds: any[] = [];

  if (sceneData.ground) grounds.push(sceneData.ground);
  if (sceneData.grounds) grounds.push(...sceneData.grounds);

  grounds.forEach((agg) => {
    const shape = agg.shape;
    const body = agg.body;

    shape!.filterMembershipMask = FILTER_GROUP_GROUND;
    shape!.filterCollideMask = FILTER_GROUP_BALL | FILTER_GROUP_PIN;

    body!.getCollisionObservable().add(collideCB);
  });

  // --- balls ---
  if (sceneData.balls) {
    sceneData.balls.forEach((ballAgg) => {
      const shape = ballAgg.shape;
      const body = ballAgg.body;

      shape!.filterMembershipMask = FILTER_GROUP_BALL;
      shape!.filterCollideMask = FILTER_GROUP_GROUND | FILTER_GROUP_PIN;

      body!.getCollisionObservable().add(collideBallCB);
    });
  }

  // --- pins ---
  if (sceneData.pins) {
    sceneData.pins.forEach((pinAgg) => {
      const shape = pinAgg.shape;
      const body = pinAgg.body;

      shape!.filterMembershipMask = FILTER_GROUP_PIN;
      shape!.filterCollideMask = FILTER_GROUP_GROUND | FILTER_GROUP_BALL;

      body!.getCollisionObservable().add(collideCB);
    });
  }
}
