import { create } from 'zustand';
import { generateDungeon } from '../utils/dungeonGenerator';
import * as Storage from '../services/storage';

export interface Player {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  inventory: Item[];
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion';
  value: number;
}

export interface GameState {
  player: Player;
  dungeon: any; // We'll type this properly when we implement the dungeon generator
  gameStatus: 'menu' | 'loading' | 'playing' | 'paused' | 'gameOver';
  currentSaveId: string | null;
  setGameStatus: (status: GameState['gameStatus']) => void;
  initializeGame: (saveId?: string) => Promise<void>;
  movePlayer: (dx: number, dy: number) => void;
  takeDamage: (amount: number) => void;
  gainExperience: (amount: number) => void;
  addToInventory: (item: Item) => void;
  saveGame: () => Promise<void>;
  loadGame: (saveId: string) => Promise<void>;
  quickSave: () => Promise<void>;
}

const useGameStore = create<GameState>((set, get) => ({
  player: {
    x: 0,
    y: 0,
    health: 100,
    maxHealth: 100,
    level: 1,
    experience: 0,
    inventory: [],
  },
  dungeon: null,
  gameStatus: 'menu',
  currentSaveId: null,

  setGameStatus: (status) => set({ gameStatus: status }),

  initializeGame: async (saveId?: string) => {
    set({ gameStatus: 'loading' });

    try {
      if (saveId) {
        const savedGame = await Storage.loadGame(saveId);
        if (savedGame) {
          set({
            player: savedGame.playerData,
            dungeon: savedGame.dungeonState,
            gameStatus: 'playing',
            currentSaveId: saveId
          });
          return;
        }
      }

      // Start new game if no save game loaded
      const dungeon = generateDungeon(50, 50);
      const newPlayer = {
        x: dungeon.startPosition.x,
        y: dungeon.startPosition.y,
        health: 100,
        maxHealth: 100,
        level: 1,
        experience: 0,
        inventory: [],
      };

      // Save the new game and get the ID
      const newSaveId = await Storage.saveGame(newPlayer, dungeon);
      
      set({
        player: newPlayer,
        dungeon,
        gameStatus: 'playing',
        currentSaveId: newSaveId
      });

      // Start auto-save
      Storage.startAutoSave(() => ({
        playerData: get().player,
        dungeonState: get().dungeon
      }));

    } catch (error) {
      console.error('Failed to initialize game:', error);
      set({ gameStatus: 'menu' });
    }
  },

  movePlayer: (dx, dy) => {
    const { player, dungeon } = get();
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (dungeon.isWalkable(newX, newY)) {
      set({ player: { ...player, x: newX, y: newY } });
    }
  },

  takeDamage: (amount) => {
    const { player, gameStatus } = get();
    const newHealth = Math.max(0, player.health - amount);
    set({ player: { ...player, health: newHealth } });

    if (newHealth === 0) {
      set({ gameStatus: 'gameOver' });
    }
  },

  gainExperience: (amount) => {
    const { player } = get();
    const newExperience = player.experience + amount;
    const experienceToLevel = player.level * 100;

    if (newExperience >= experienceToLevel) {
      set({
        player: {
          ...player,
          level: player.level + 1,
          experience: newExperience - experienceToLevel,
          maxHealth: player.maxHealth + 10,
          health: player.maxHealth + 10,
        },
      });
    } else {
      set({
        player: {
          ...player,
          experience: newExperience,
        },
      });
    }
  },

  addToInventory: (item) => {
    const { player } = get();
    set({
      player: {
        ...player,
        inventory: [...player.inventory, item],
      },
    });
  },

  saveGame: async () => {
    try {
      const { player, dungeon } = get();
      const saveId = await Storage.saveGame(player, dungeon);
      set({ currentSaveId: saveId });
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  },

  loadGame: async (saveId: string) => {
    try {
      const savedGame = await Storage.loadGame(saveId);
      if (savedGame) {
        set({
          player: savedGame.playerData,
          dungeon: savedGame.dungeonState,
          gameStatus: 'playing',
          currentSaveId: saveId
        });
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    }
  },

  quickSave: async () => {
    try {
      const { player, dungeon, currentSaveId } = get();
      if (currentSaveId) {
        await Storage.quickSave(player, dungeon);
      } else {
        const saveId = await Storage.saveGame(player, dungeon);
        set({ currentSaveId: saveId });
      }
    } catch (error) {
      console.error('Failed to quick save:', error);
    }
  },
}));

export default useGameStore;
