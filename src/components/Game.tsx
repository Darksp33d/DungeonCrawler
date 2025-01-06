import React, { useEffect } from 'react';
import { View, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Canvas, Circle, Group, Rect } from '@shopify/react-native-skia';
import useGameStore from '../store/gameStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const { width, height } = Dimensions.get('window');
const TILE_SIZE = Math.min(width, height) / 25; // Made tiles slightly smaller
const GAME_OFFSET_X = width * 0.1; // 10% margin from left
const GAME_OFFSET_Y = height * 0.1; // 10% margin from top

export const Game: React.FC<Props> = ({ route }) => {
  const initializeGame = useGameStore(state => state.initializeGame);
  const player = useGameStore(state => state.player);
  const dungeon = useGameStore(state => state.dungeon);
  const movePlayer = useGameStore(state => state.movePlayer);

  useEffect(() => {
    initializeGame(route.params?.saveId);
  }, []);

  const handleMove = (dx: number, dy: number) => {
    movePlayer(dx, dy);
  };

  if (!dungeon) return null;

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Rect x={0} y={0} width={width} height={height} color="#000000" />
        
        {/* Draw dungeon tiles */}
        <Group transform={[{ translateX: GAME_OFFSET_X }, { translateY: GAME_OFFSET_Y }]}>
          {dungeon.tiles.map((row: number[], y: number) =>
            row.map((tile: number, x: number) => (
              <Rect
                key={`${x}-${y}`}
                x={x * TILE_SIZE}
                y={y * TILE_SIZE}
                width={TILE_SIZE}
                height={TILE_SIZE}
                color={tile === 1 ? '#333333' : '#111111'}
              />
            ))
          )}
        </Group>

        {/* Draw player */}
        <Group
          transform={[
            { translateX: GAME_OFFSET_X + player.x * TILE_SIZE },
            { translateY: GAME_OFFSET_Y + player.y * TILE_SIZE },
          ]}
        >
          <Circle 
            cx={TILE_SIZE / 2} 
            cy={TILE_SIZE / 2} 
            r={TILE_SIZE * 0.4} 
            color="#4a9eff" 
          />
          <Circle
            cx={TILE_SIZE / 2}
            cy={TILE_SIZE / 2}
            r={TILE_SIZE * 0.5}
            color="rgba(74, 158, 255, 0.3)"
          />
        </Group>
      </Canvas>

      {/* Control buttons */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.button, styles.topButton]} 
          onPress={() => handleMove(0, -1)}
        >
          <View style={[styles.arrow, styles.arrowUp]} />
        </TouchableOpacity>
        
        <View style={styles.horizontalControls}>
          <TouchableOpacity 
            style={[styles.button, styles.leftButton]} 
            onPress={() => handleMove(-1, 0)}
          >
            <View style={[styles.arrow, styles.arrowLeft]} />
          </TouchableOpacity>
          
          <View style={styles.buttonSpacer} />
          
          <TouchableOpacity 
            style={[styles.button, styles.rightButton]} 
            onPress={() => handleMove(1, 0)}
          >
            <View style={[styles.arrow, styles.arrowRight]} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, styles.bottomButton]} 
          onPress={() => handleMove(0, 1)}
        >
          <View style={[styles.arrow, styles.arrowDown]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvas: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  horizontalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonSpacer: {
    width: 80,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(74, 158, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  topButton: {
    marginBottom: 10,
  },
  bottomButton: {
    marginTop: 10,
  },
  leftButton: {
    marginRight: 10,
  },
  rightButton: {
    marginLeft: 10,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#4a9eff',
  },
  arrowDown: {
    transform: [{ rotate: '180deg' }],
  },
  arrowLeft: {
    transform: [{ rotate: '-90deg' }],
  },
  arrowRight: {
    transform: [{ rotate: '90deg' }],
  },
  arrowUp: {
    transform: [{ rotate: '0deg' }],
  },
});
