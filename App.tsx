import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoadingScreen } from './src/components/LoadingScreen';
import { Game } from './src/components/Game';

export type RootStackParamList = {
  Loading: undefined;
  Game: { saveId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Loading"
        screenOptions={{ 
          headerShown: false,
          animation: 'fade'
        }}
      >
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen 
          name="Game" 
          component={Game}
          initialParams={{ saveId: undefined }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
