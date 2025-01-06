import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Storage from '../services/storage';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

interface SaveListItem {
  id: string;
  date: string;
  playerLevel: number;
}

export const LoadingScreen: React.FC<Props> = ({ navigation }) => {
  const [saves, setSaves] = useState<SaveListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const allSaves = await Storage.getAllSaves();
      const saveItems: SaveListItem[] = allSaves.map(save => ({
        id: save.id,
        date: new Date(save.timestamp).toLocaleDateString(),
        playerLevel: save.playerData.level
      }));
      setSaves(saveItems);
    } catch (error) {
      console.error('Error loading saves:', error);
      setError('Failed to load saved games');
    } finally {
      setLoading(false);
    }
  };

  const handleNewGame = () => {
    navigation.replace('Game', { saveId: undefined });
  };

  const handleLoadGame = (saveId: string) => {
    navigation.replace('Game', { saveId });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4a9eff" />
        <Text style={styles.loadingText}>Loading saves...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dungeon Crawler</Text>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <TouchableOpacity 
        style={styles.newGameButton}
        onPress={handleNewGame}
      >
        <Text style={styles.buttonText}>New Game</Text>
      </TouchableOpacity>

      {saves.length > 0 && (
        <>
          <Text style={styles.subtitle}>Saved Games</Text>
          <FlatList
            data={saves}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.saveItem}
                onPress={() => handleLoadGame(item.id)}
              >
                <Text style={styles.saveText}>Level {item.playerLevel} - {item.date}</Text>
              </TouchableOpacity>
            )}
            style={styles.savesList}
          />
        </>
      )}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 24,
    color: '#fff',
    marginTop: 30,
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  errorText: {
    color: '#ff4a4a',
    fontSize: 16,
    marginBottom: 20,
  },
  newGameButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    width: width * 0.7,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  savesList: {
    width: width * 0.8,
    maxHeight: height * 0.4,
  },
  saveItem: {
    backgroundColor: 'rgba(74, 158, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
  },
});
