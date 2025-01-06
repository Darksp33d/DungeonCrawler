interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

export class Dungeon {
  width: number;
  height: number;
  tiles: number[][];
  rooms: Room[];
  startPosition: Position;
  endPosition: Position;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = Array(height).fill(0).map(() => Array(width).fill(1)); // 1 represents walls
    this.rooms = [];
    this.startPosition = { x: 0, y: 0 };
    this.endPosition = { x: 0, y: 0 };
  }

  isWalkable(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return this.tiles[y][x] === 0;
  }

  carveRoom(room: Room) {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (y > 0 && y < this.height - 1 && x > 0 && x < this.width - 1) {
          this.tiles[y][x] = 0; // 0 represents floor
        }
      }
    }
  }

  carveCorridor(start: Position, end: Position) {
    let x = start.x;
    let y = start.y;

    while (x !== end.x || y !== end.y) {
      if (Math.random() < 0.5) {
        if (x < end.x) x++;
        else if (x > end.x) x--;
        else if (y < end.y) y++;
        else if (y > end.y) y--;
      } else {
        if (y < end.y) y++;
        else if (y > end.y) y--;
        else if (x < end.x) x++;
        else if (x > end.x) x--;
      }

      if (y > 0 && y < this.height - 1 && x > 0 && x < this.width - 1) {
        this.tiles[y][x] = 0;
        // Add some width to corridors
        if (x > 0) this.tiles[y][x - 1] = 0;
        if (x < this.width - 1) this.tiles[y][x + 1] = 0;
      }
    }
  }

  getRoomCenter(room: Room): Position {
    return {
      x: Math.floor(room.x + room.width / 2),
      y: Math.floor(room.y + room.height / 2),
    };
  }
}

export const generateDungeon = (width: number, height: number): Dungeon => {
  const dungeon = new Dungeon(width, height);
  const numRooms = Math.floor(Math.random() * 3) + 4; // 4-7 rooms
  const minRoomSize = 5;
  const maxRoomSize = 8;

  // Generate rooms
  for (let i = 0; i < numRooms; i++) {
    const roomWidth = Math.floor(Math.random() * (maxRoomSize - minRoomSize)) + minRoomSize;
    const roomHeight = Math.floor(Math.random() * (maxRoomSize - minRoomSize)) + minRoomSize;
    const roomX = Math.floor(Math.random() * (width - roomWidth - 4)) + 2;
    const roomY = Math.floor(Math.random() * (height - roomHeight - 4)) + 2;

    const newRoom: Room = {
      x: roomX,
      y: roomY,
      width: roomWidth,
      height: roomHeight,
    };

    // Check if room overlaps with existing rooms (including a buffer zone)
    let overlaps = false;
    for (const room of dungeon.rooms) {
      if (
        newRoom.x - 2 <= room.x + room.width &&
        newRoom.x + newRoom.width + 2 >= room.x &&
        newRoom.y - 2 <= room.y + room.height &&
        newRoom.y + newRoom.height + 2 >= room.y
      ) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      dungeon.rooms.push(newRoom);
      dungeon.carveRoom(newRoom);

      // Connect to previous room
      if (i > 0) {
        const prevRoom = dungeon.rooms[i - 1];
        const start = dungeon.getRoomCenter(prevRoom);
        const end = dungeon.getRoomCenter(newRoom);
        dungeon.carveCorridor(start, end);
      }
    }
  }

  // Set start and end positions
  if (dungeon.rooms.length > 0) {
    const startRoom = dungeon.rooms[0];
    const endRoom = dungeon.rooms[dungeon.rooms.length - 1];
    dungeon.startPosition = dungeon.getRoomCenter(startRoom);
    dungeon.endPosition = dungeon.getRoomCenter(endRoom);
  }

  return dungeon;
};
