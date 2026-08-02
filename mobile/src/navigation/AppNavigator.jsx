import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import TermsModal from '../components/TermsModal';
import MobileNavbar from '../components/MobileNavbar';
import HomeScreen from '../screens/HomeScreen';
import BreedingFormScreen from '../screens/BreedingFormScreen';
import BreedingPairsScreen from '../screens/BreedingPairsScreen';
import ComputationResultScreen from '../screens/ComputationResultScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpScreen from '../screens/HelpScreen';
import AdminScreen from '../screens/AdminScreen';
import BirdListScreen from '../screens/BirdListScreen';
import { navigationRef } from './navigationRef';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="About" component={AboutScreen} />
      <MoreStack.Screen name="Help" component={HelpScreen} />
      <MoreStack.Screen name="Admin" component={AdminScreen} />
    </MoreStack.Navigator>
  );
}

function MainTabs() {
  const { user, openLogin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Breed"
        component={BreedingFormScreen}
        listeners={() => ({
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              openLogin();
            }
          },
        })}
      />
      <Tab.Screen
        name="Birds"
        component={BirdListScreen}
        listeners={() => ({
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              openLogin();
            }
          },
        })}
      />
      <Tab.Screen
        name="Pairs"
        component={BreedingPairsScreen}
        listeners={() => ({
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              openLogin();
            }
          },
        })}
      />
      <Tab.Screen name="More" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}

function ShellScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MobileNavbar />
      <View style={{ flex: 1 }}>
        <MainTabs />
      </View>
    </View>
  );
}

function ResultShell({ route, navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.toolEnd }}>
      <MobileNavbar />
      <View style={{ flex: 1 }}>
        <ComputationResultScreen route={route} navigation={navigation} />
      </View>
    </View>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name="Shell" component={ShellScreen} />
        <AppStack.Screen name="ComputationResult" component={ResultShell} />
      </AppStack.Navigator>
      <LoginModal />
      {user ? <TermsModal /> : null}
    </>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}
