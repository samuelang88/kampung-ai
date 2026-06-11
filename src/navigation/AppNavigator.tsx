import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PropertyScreen from '../screens/PropertyScreen';
import ValuationScreen from '../screens/ValuationScreen';
import AboutScreen from '../screens/AboutScreen';
import { COLORS } from '../utils/colors';

export type RootStackParamList = {
  Home: undefined;
  Property: { projectName: string };
  Valuation: { projectName: string };
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.blue,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          contentStyle: {
            backgroundColor: COLORS.gray50,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Kampung.ai',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="Property"
          component={PropertyScreen}
          options={({ route }) => ({
            title: route.params.projectName,
          })}
        />
        <Stack.Screen
          name="Valuation"
          component={ValuationScreen}
          options={{
            title: 'AI Valuation Report',
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'About Kampung.ai',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
