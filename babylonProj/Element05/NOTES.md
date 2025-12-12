# Element 5 – Multi-Scene Interactive Game (BabylonJS)

## 1. Overview
Element 5 is a two-scene interactive game created using BabylonJS. The element demonstrates scene management and scene switching within a single web application. The player controls a character inside a room environment and can interact with an arcade machine to launch a Snake mini-game. This element focuses on gameplay logic, interaction, and clean scene lifecycle handling rather than complex physics.

## 2. Scene Structure

### Scene A: Room

The first scene represents a room environment where the player controls a farmer character from a third-person perspective. The scene includes lighting, a controllable player character with animations, and an arcade machine placed inside the room. The player can freely move using keyboard input and approach the arcade machine to interact with it.

![Scene A – Room with player and arcade machine](babylonProj/Element05/image-5.png)

*Figure 1: Room scene with player character and arcade machine.*

### Scene B: Snake Game

The second scene is a classic Snake mini-game presented from a top-down perspective. The game uses a grid-based system where the snake is built from individual cube meshes. The snake moves at a constant speed, grows when collecting food, and the game ends when the snake collides with itself or the surrounding walls.

![Scene B – Snake gameplay](babylonProj/Element05/image-6.png)

*Figure 2: Snake mini-game shown from a top-down perspective.*

## 3. Scene Switching Logic

Scene switching is handled entirely within BabylonJS without changing HTML pages. When the player approaches the arcade machine in Scene A and presses the interaction key (E), the current scene is disposed and a new Snake scene is created. When the Snake game ends, the application reloads, returning the player to the initial room scene. This approach keeps the logic simple and ensures a clean reset of game state.


---

### Code Example – Scene Trigger

```ts
if (distanceToArcade < interactionDistance && keyPressed === "E") {
    scene.dispose();
    createSnakeScene(engine);
}
```

## 4. Gameplay Mechanics – Snake

The Snake game is based on a fixed grid (20×20 cells). Each segment of the snake occupies a single grid cell represented by a cube mesh. Player input changes the snake’s movement direction using keyboard controls. The score increases each time food is collected, and the snake grows by adding a new segment.

### Code Example – Grid Movement

```ts
snakeHead.position.x += direction.x * cellSize;
snakeHead.position.z += direction.z * cellSize;

```
## 5. BabylonJS Techniques Used

Scene creation and disposal
MeshBuilder for procedural geometry
Camera setup (third-person and top-down views)
Keyboard input handling
GUI elements using AdvancedDynamicTexture
glTF model loading and animation
Scene lifecycle management

## 6. Reflection

The most challenging part of Element 5 was managing scene transitions while keeping the code understandable and maintainable. Designing the Snake game helped reinforce concepts such as grid-based movement and state management. If more time were available, additional features such as sound effects, difficulty levels, or persistent score tracking could be added. This element significantly improved my understanding of BabylonJS scene management and gameplay architecture.