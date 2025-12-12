import { Scene } from "@babylonjs/core";
import {
  Button,
  AdvancedDynamicTexture,
  TextBlock,
  Control,
  Grid,
  Rectangle,
} from "@babylonjs/gui/2D";

var text1!: TextBlock;
var text2!: TextBlock;
var text3!: TextBlock;
var text4!: TextBlock;
var heading1!: TextBlock;

function createSceneButton(
  name: string,
  index: string,
  x: string,
  y: string
) {
  var button: Button = Button.CreateSimpleButton(name, index);
  button.left = x;
  button.top = y;
  button.width = "180px";
  button.height = "35px";
  button.color = "white";
  button.cornerRadius = 20;
  button.background = "blue";

  button.onPointerClickObservable.add(function () {
    window.location.reload();
  });

  return button;
}

function createTextBlock(
  name: string,
  index: string,
  left: string,
  top: string
) {
  let text: TextBlock = new TextBlock(name, index);
  text.text = index;
  text.color = "white";
  text.fontSize = 24;
  text.left = left;
  text.top = top;
  text.width = "200px";
  text.height = "46px";
  text.fontFamily = "Verdana";
  text.textWrapping = true;
  text.highlightColor = "red";
  text.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
  text.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;

  text.onPointerEnterObservable.add(function () {
    text.isHighlighted = true;
  });
  text.onPointerOutObservable.add(function () {
    text.isHighlighted = false;
  });

  return text;
}

export function gui(scene: Scene): void {
  let advancedTexture: AdvancedDynamicTexture =
    AdvancedDynamicTexture.CreateFullscreenUI("myUI", true, scene);

    advancedTexture.rootContainer.top = "80px";

  let button1: Button = createSceneButton(
    "restartButton",
    "Restart Scene",
    "0px",
    "0px"
  );

  scene.getEngine().setHardwareScalingLevel(1 / window.devicePixelRatio);
  advancedTexture.rootContainer.scaleX = window.devicePixelRatio;
  advancedTexture.rootContainer.scaleY = window.devicePixelRatio;

  heading1 = createTextBlock("heading1", "Bowling Game", "1px", "1px");
  text1 = createTextBlock("text1", "Debug", "1px", "1px");
  text2 = createTextBlock("text2", "Debug", "1px", "1px");
  text3 = createTextBlock("text3", "Debug", "1px", "1px");
  text4 = createTextBlock("text4", "Debug", "1px", "1px");

  const grid = new Grid();
  grid.addColumnDefinition(100, true);
  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(0.25);
  grid.addColumnDefinition(100, true);
  grid.addRowDefinition(50, true);
  grid.addRowDefinition(50, true);

  const rect1 = new Rectangle();
  rect1.background = "#76d56e88";
  rect1.thickness = 0;
  rect1.addControl(heading1);

  const rect2 = new Rectangle();
  rect2.background = "#60955b88";
  rect2.thickness = 0;
  rect2.addControl(button1);

  const rect3 = new Rectangle();
  rect3.background = "#76d56e88";
  rect3.thickness = 0;

  const rect4 = new Rectangle();
  rect4.background = "#60955b88";
  rect4.thickness = 0;

  const rect5 = new Rectangle();
  rect5.background = "#76d56e88";
  rect5.thickness = 0;
  rect5.addControl(text1);

  const rect6 = new Rectangle();
  rect6.background = "#60955b88";
  rect6.thickness = 0;
  rect6.addControl(text2);

  const rect7 = new Rectangle();
  rect7.background = "#76d56e88";
  rect7.thickness = 0;
  rect7.addControl(text3);

  const rect8 = new Rectangle();
  rect8.background = "#60955b88";
  rect8.thickness = 0;
  rect8.addControl(text4);

  grid.addControl(rect1, 0, 1);
  grid.addControl(rect2, 0, 2);
  grid.addControl(rect3, 0, 3);
  grid.addControl(rect4, 0, 4);
  grid.addControl(rect5, 1, 1);
  grid.addControl(rect6, 1, 2);
  grid.addControl(rect7, 1, 3);
  grid.addControl(rect8, 1, 4);

  advancedTexture.addControl(grid);
}

export function setText(newtext: string, index: number) {
  switch (index) {
    case 1:
      text1.text = newtext;
      break;
    case 2:
      text2.text = newtext;
      break;
    case 3:
      text3.text = newtext;
      break;
    case 4:
      text4.text = newtext;
      break;
  }
}
