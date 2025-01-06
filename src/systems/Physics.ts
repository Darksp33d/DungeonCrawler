interface Entity {
  position: { x: number; y: number };
  velocity?: { y: number };
  size?: { width: number; height: number };
}

interface GameEntities {
  [key: string]: Entity;
}

interface TouchEvent {
  type: string;
  event: { pageX: number; pageY: number };
}

interface GameContext {
  time: { current: number; delta: number };
  touches: TouchEvent[];
}

const Physics = (entities: GameEntities, { time, touches }: GameContext) => {
  const ball = entities.ball;
  
  // Handle touches
  touches.filter(touch => touch.type === 'press').forEach(() => {
    if (ball.velocity) {
      ball.velocity.y = -8;
    }
  });

  // Update ball position
  if (ball.velocity && ball.position) {
    ball.position.y += ball.velocity.y;
    ball.velocity.y += 0.4; // gravity
  }

  // Keep ball within bounds
  if (entities.floor && ball.position) {
    if (ball.position.y > entities.floor.position.y - 20) {
      ball.position.y = entities.floor.position.y - 20;
      if (ball.velocity) {
        ball.velocity.y = 0;
      }
    }
  }

  // Move obstacles
  Object.keys(entities).forEach(key => {
    if (key.startsWith('obstacle')) {
      entities[key].position.x -= 3;
      
      // Reset obstacle position when it goes off screen
      if (entities[key].position.x < -50) {
        entities[key].position.x = 400;
      }
    }
  });

  return entities;
};

export default Physics;
