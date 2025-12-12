import { Scene, Observable } from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  TextBlock,
  Rectangle,
  Button,
  Control,
} from "@babylonjs/gui/2D";

export function createRoomGUI(scene: Scene) {
  const ui = AdvancedDynamicTexture.CreateFullscreenUI("roomUI", true, scene);

  const hintRect = new Rectangle("hintRect");
  hintRect.width = "420px";
  hintRect.height = "60px";
  hintRect.cornerRadius = 14;
  hintRect.thickness = 2;
  hintRect.color = "white";
  hintRect.background = "#00000088";
  hintRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  hintRect.top = "-30px";
  hintRect.isVisible = false;

  const hintText = new TextBlock("hintText", "Press E to play Snake");
  hintText.color = "white";
  hintText.fontSize = 26;

  hintRect.addControl(hintText);
  ui.addControl(hintRect);

  return {
    showPressE: (show: boolean) => {
      hintRect.isVisible = show;
    },
  };
}

export function createSnakeGUI(scene: Scene) {
  const ui = AdvancedDynamicTexture.CreateFullscreenUI("snakeUI", true, scene);

  const scoreText = new TextBlock("scoreText", "Score: 0");
  scoreText.color = "white";
  scoreText.fontSize = 30;
  scoreText.top = "18px";
  scoreText.left = "18px";
  scoreText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  scoreText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  ui.addControl(scoreText);

  const restartBtn = Button.CreateSimpleButton("restartBtn", "Restart (R)");
  restartBtn.width = "180px";
  restartBtn.height = "45px";
  restartBtn.cornerRadius = 18;
  restartBtn.color = "white";
  restartBtn.background = "green";
  restartBtn.top = "80px";
  restartBtn.left = "18px";
  restartBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  restartBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  ui.addControl(restartBtn);

  const backBtn = Button.CreateSimpleButton("backBtn", "Back to Room");
  backBtn.width = "180px";
  backBtn.height = "45px";
  backBtn.cornerRadius = 18;
  backBtn.color = "white";
  backBtn.background = "blue";
  backBtn.top = "135px";
  backBtn.left = "18px";
  backBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  backBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  ui.addControl(backBtn);

  const api = {
    onBack: () => {},
  };

  const md = scene.metadata as any;

  restartBtn.onPointerClickObservable.add(() => {
    md?.snakeApi?.restart?.();
    // score$ сам обновит текст, но на всякий случай:
    if (md?.snakeApi?.getScore) {
      scoreText.text = `Score: ${md.snakeApi.getScore()}`;
    }
  });

  backBtn.onPointerClickObservable.add(() => api.onBack());

  // Subscribe to score$
  const score$ = md?.score$ as Observable<number> | undefined;
  if (score$) {
    score$.add((s) => {
      scoreText.text = `Score: ${s}`;
    });
  }

  // Initial score draw
  if (md?.snakeApi?.getScore) {
    scoreText.text = `Score: ${md.snakeApi.getScore()}`;
  }

  return api;
}
