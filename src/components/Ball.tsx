import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface BallProps {
  position: { x: number; y: number };
  size?: number;
}

const Ball: React.FC<BallProps> = ({ position, size = 20 }) => {
  return (
    <Svg width={size} height={size} style={{ position: 'absolute', left: position.x - size/2, top: position.y - size/2 }}>
      <Circle
        cx={size/2}
        cy={size/2}
        r={size/2}
        fill="#FF5733"
      />
    </Svg>
  );
};

export default Ball;
