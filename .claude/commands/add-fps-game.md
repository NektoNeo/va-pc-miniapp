Add a new game to the FPS metrics system.

This command helps extend the fixed list of 13 games with a new game.

Required updates:
1. **Validation** (`apps/miniapp/lib/validations/fps-metrics.ts`)
   - Add game to FIXED_GAMES array

2. **Game Icons** (`apps/miniapp/lib/game-icons.ts`)
   - Add game to GAME_ICONS mapping
   - Assign emoji icon
   - Set brand color

3. **Documentation**
   - Update README/docs with new game list

Usage: `/add-fps-game $ARGUMENTS`
Example: `/add-fps-game "The Witcher 3"`

Game name: $ARGUMENTS
