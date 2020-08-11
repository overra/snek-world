import Color from "color";

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export interface SnekGameConfig {
  container: Element;
  blockSize: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rule {
  condition(head: Point): void;
}

export class SnekGame {
  /* Element and Layout Properties */
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private blockSize: number;

  /* Game State -- TODO: Use xstate */
  private running: Boolean = false;
  private direction: Direction = Direction.UP;
  private initialParts: Point[] = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
  ];
  private parts: Point[] = this.initialParts;
  private foods: Point[] = [];
  private rocks: Point[] = [];
  private rules: Rule[] = [
    {
      // Check if snek should eat food
      condition: (head) => {
        const foodIndex = this.foods.findIndex(
          (food) => food.x === head.x && food.y === head.y,
        );
        if (foodIndex >= 0) {
          this.foods = this.generateRandomPoints();
          this.parts[this.parts.length] = this.parts[this.parts.length - 1];
        }
      },
    },
    {
      // Check if snek hits the wall
      condition: (head) => {
        if (
          head.x < -this.boundaryX ||
          head.x > this.boundaryX ||
          head.y < -this.boundaryY ||
          head.y > this.boundaryY
        ) {
          this.running = false;
          // draw game over message
        }
      },
    },
    {
      // Check if snek hits self
      condition: (head) => {
        const headIsInBody = this.parts
          .slice(1)
          .findIndex((part) => part.x === head.x && part.y === head.y);
        if (headIsInBody >= 0) {
          this.running = false;
        }
      },
    },
    {
      condition: (head) => {
        const rockIndex = this.rocks.findIndex(
          (rock) => rock.x === head.x && rock.y === head.y,
        );
        if (rockIndex >= 0) {
          this.running = false;
        }
      },
    },
  ];

  constructor(config: SnekGameConfig) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context === null) {
      throw new Error(
        "Mannn, I can't get the 2D render context of this element!",
      );
    }
    this.context = context;

    config.container.appendChild(canvas);

    this.blockSize = config.blockSize;

    this.width = canvas.width = config.container.clientWidth;
    this.height = canvas.height = config.container.clientHeight;

    console.log(this.width, this.height);
    canvas.style.backgroundColor = "#eee";

    document.addEventListener("keydown", (event) => this.handleKeyPress(event));

    this.startGame();
    this.tick();
  }

  private startGame() {
    this.running = true;
    this.parts = this.initialParts;
    this.direction = Direction.UP;
    this.foods = this.generateRandomPoints();
    this.rocks = this.generateRandomPoints(4);
  }

  private get midX() {
    return this.width / 2;
  }
  private get midY() {
    return this.height / 2;
  }

  private get boundaryX() {
    return this.midX / this.blockSize;
  }

  private get boundaryY() {
    return this.midY / this.blockSize;
  }

  private handleKeyPress(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        return (
          this.direction === Direction.UP || (this.direction = Direction.DOWN)
        );
      case "ArrowUp":
        return (
          this.direction === Direction.DOWN || (this.direction = Direction.UP)
        );
      case "ArrowLeft":
        return (
          this.direction === Direction.RIGHT ||
          (this.direction = Direction.LEFT)
        );
      case "ArrowRight":
        return (
          this.direction === Direction.LEFT ||
          (this.direction = Direction.RIGHT)
        );
      case " ": // Space
        return !this.running && this.startGame();
    }
  }

  private generateRandomPoints(count: number = 1) {
    let foods: Point[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(
        this.boundaryX - Math.floor(Math.random() * this.boundaryX) * 2,
      );
      const y = Math.floor(
        this.boundaryY - Math.floor(Math.random() * this.boundaryY) * 2,
      );
      const snekOnPoint = this.parts.findIndex(
        (part) => part.x === x && part.y === y,
      );
      if (snekOnPoint >= 0) {
        --i;
        continue;
      }
      foods = [...foods, { x, y }];
    }
    return foods;
  }

  private drawRect(x: number, y: number, color: string = "#000") {
    const size = this.blockSize;
    const halfBlock = size / 2;
    const xOffset = this.midX + x * size;
    const yOffset = this.midY + y * size;
    const left = xOffset - halfBlock;
    const right = xOffset + halfBlock;
    const top = yOffset - halfBlock;
    const bottom = yOffset + halfBlock;
    const ctx = this.context;

    ctx.fillStyle = Color(color).alpha(0.5).toString();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.lineTo(left, top);
    ctx.stroke();
    ctx.fill();
  }

  private moveDirection({ x, y }: Point, direction: Direction) {
    switch (direction) {
      case Direction.UP:
        return { x, y: y - 1 };
      case Direction.DOWN:
        return { x, y: y + 1 };
      case Direction.LEFT:
        return { x: x - 1, y };
      case Direction.RIGHT:
        return { x: x + 1, y };
    }
  }

  private tick(frame: number = 0) {
    if (frame % 15 === 0) {
      this.parts = this.parts.map((v, i) => (i === 0 ? v : this.parts[i - 1]));
      let head = (this.parts[0] = this.moveDirection(
        this.parts[0],
        this.direction,
      ));

      try {
        for (let rule of this.rules) {
          rule.condition(head);
        }
      } catch (err) {}

      if (this.running) {
        this.context.clearRect(0, 0, this.width, this.height);

        for (let index = 0; index < this.parts.length; index++) {
          const part = this.parts[index];
          this.drawRect(part.x, part.y, "#0c0");
        }

        for (let food of this.foods) {
          this.drawRect(food.x, food.y, "#c00");
        }

        for (let rock of this.rocks) {
          this.drawRect(rock.x, rock.y, "#aaa");
        }

        this.context.fillStyle = "#000";
        this.context.fillText(String(this.parts.length), 20, 20);
      }
    }

    // Queue up the next tick!
    window.requestAnimationFrame(() => this.tick((frame + 1) % 60));
  }
}
