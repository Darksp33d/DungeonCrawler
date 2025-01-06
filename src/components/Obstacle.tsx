import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface ObstacleProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const Obstacle: React.FC<ObstacleProps> = ({ position, size }) => {
  return (
    <Svg width={size.width} height={size.height} style={{ position: 'absolute', left: position.x, top: position.y }}>
      <Rect
        width={size.width}
        height={size.height}
        fill="#4A90E2"
      />
    </Svg>
  );
};

export default Obstacle;
