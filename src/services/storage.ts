import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize AsyncStorage
const storage = AsyncStorage;

export interface SaveGame {
  id: string;
  playerData: {
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    level: number;
    experience: number;
    inventory: any[];
  };
  dungeonState: {
    tiles: number[][];
    rooms: any[];
    startPosition: { x: number; y: number };
    endPosition: { x: number; y: number };
  };
  timestamp: number;
}

const SAVES_KEY = 'game_saves';
const CURRENT_SAVE_KEY = 'current_save';

// Helper function to get all saves
const getAllSavesFromStorage = async (): Promise<{ [key: string]: SaveGame }> => {
  try {
    const savesJson = await storage.getItem(SAVES_KEY);
    return savesJson ? JSON.parse(savesJson) : {};
  } catch (error) {
    console.error('Error getting saves:', error);
    return {};
  }
};

// Save game state
export const saveGame = async (
  playerData: SaveGame['playerData'],
  dungeonState: SaveGame['dungeonState']
): Promise<string> => {
  try {
    const saves = await getAllSavesFromStorage();
    const id = Date.now().toString();
    
    const saveGame: SaveGame = {
      id,
      playerData,
      dungeonState,
      timestamp: Date.now()
    };

    saves[id] = saveGame;
    await storage.setItem(SAVES_KEY, JSON.stringify(saves));
    await storage.setItem(CURRENT_SAVE_KEY, id);

    return id;
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  }
};

// Load a game state by ID
export const loadGame = async (saveId: string): Promise<SaveGame | null> => {
  try {
    const saves = await getAllSavesFromStorage();
    return saves[saveId] || null;
  } catch (error) {
    console.error('Error loading game:', error);
    return null;
  }
};

// Load the most recent save
export const loadCurrentGame = async (): Promise<SaveGame | null> => {
  try {
    const currentSaveId = await storage.getItem(CURRENT_SAVE_KEY);
    if (!currentSaveId) return null;
    return loadGame(currentSaveId);
  } catch (error) {
    console.error('Error loading current game:', error);
    return null;
  }
};

// Get all saved games
export const getAllSaves = async (): Promise<SaveGame[]> => {
  try {
    const saves = await getAllSavesFromStorage();
    return Object.values(saves).sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting all saves:', error);
    return [];
  }
};

// Delete a saved game
export const deleteSave = async (saveId: string): Promise<void> => {
  try {
    const saves = await getAllSavesFromStorage();
    delete saves[saveId];
    await storage.setItem(SAVES_KEY, JSON.stringify(saves));
    
    const currentSaveId = await storage.getItem(CURRENT_SAVE_KEY);
    if (currentSaveId === saveId) {
      await storage.removeItem(CURRENT_SAVE_KEY);
    }
  } catch (error) {
    console.error('Error deleting save:', error);
    throw error;
  }
};

// Clear all saved games
export const clearAllSaves = async (): Promise<void> => {
  try {
    await storage.removeItem(SAVES_KEY);
    await storage.removeItem(CURRENT_SAVE_KEY);
  } catch (error) {
    console.error('Error clearing saves:', error);
    throw error;
  }
};

// Quick save current game state
export const quickSave = async (
  playerData: SaveGame['playerData'],
  dungeonState: SaveGame['dungeonState']
): Promise<void> => {
  try {
    const currentSaveId = await storage.getItem(CURRENT_SAVE_KEY);
    if (currentSaveId) {
      const saves = await getAllSavesFromStorage();
      saves[currentSaveId] = {
        id: currentSaveId,
        playerData,
        dungeonState,
        timestamp: Date.now()
      };
      await storage.setItem(SAVES_KEY, JSON.stringify(saves));
    } else {
      await saveGame(playerData, dungeonState);
    }
  } catch (error) {
    console.error('Error quick saving:', error);
    throw error;
  }
};

// Auto-save functionality
let autoSaveInterval: ReturnType<typeof setInterval> | null = null;

export const startAutoSave = (
  getGameState: () => { playerData: SaveGame['playerData']; dungeonState: SaveGame['dungeonState'] }
): void => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }

  autoSaveInterval = setInterval(async () => {
    const { playerData, dungeonState } = getGameState();
    await quickSave(playerData, dungeonState);
  }, 5 * 60 * 1000); // Auto-save every 5 minutes
};

export const stopAutoSave = (): void => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
};
