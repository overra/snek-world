# snek changelog

## 0.2.0

- Home and Game Over screens
- Press space to pause the game
- Replace `running` boolean with `state` that can be `HOME | RUNNING | PAUSE | GAME_OVER`
- Double resolution of canvas
- Increase food and rock count

## 0.1.1

- Ignore arrow key if the snek's current direction is the opposite of the key

## 0.1.0

- Added base snek game functionality
  - Snek, food and rocks
  - Rules
    - Eating food extends snek
    - Running into self, rock, boundary
  - Snek bit counter at top left
