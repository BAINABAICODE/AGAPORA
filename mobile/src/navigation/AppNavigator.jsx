import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import TermsModal from '../components/TermsModal';
import HomeScreen from '../screens/HomeScreen';
import BreedingFormScreen from '../screens/BreedingFormScreen';
import BreedingPairsScreen from '../screens/BreedingPairsScreen';
import ComputationResultScreen from '../screens/ComputationResultScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpScreen from '../screens/HelpScreen';
import AdminScreen from '../screens/AdminScreen';
import MoreScreen from '../screens/MoreScreen';
import BirdListScreen from '../screens/BirdListScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen name="MoreHome" component={MoreScreen} options={{ title: 'More' }} />
      <MoreStack.Screen name="About" component={AboutScreen} />
      <MoreStack.Screen name="Help" component={HelpScreen} options={{ title: 'Help' }} />
      <MoreStack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin' }} />
    </MoreStack.Navigator>
  );
}

function MainTabs() {
  const { user, openLogin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.navBg },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.bgElevated },
        tabBarIcon: ({ color, size }) => {
          const map = {
            Home: 'home',
            Breed: 'flask',
            Birds: 'paw',
            Pairs: 'people',
            More: 'menu',
          };
          return <Ionicons name={map[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'AGAPORAS' }} />
      <Tab.Screen
        name="Breed"
        component={BreedingFormScreen}
        options={{ title: 'Breed', headerStyle: { backgroundColor: colors.toolEnd }, headerTintColor: colors.toolGold }}
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
        options={{ title: 'Birds' }}
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
        options={{
          title: 'Pairs',
          headerStyle: { backgroundColor: colors.toolEnd },
          headerTintColor: colors.toolGold,
        }}
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
        name="More"
        component={MoreStackNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
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
      <RootStack.Navigator>
        <RootStack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="ComputationResult"
          component={ComputationResultScreen}
          options={{
            title: 'Results',
            headerStyle: { backgroundColor: colors.toolEnd },
            headerTintColor: colors.toolGold,
          }}
        />
      </RootStack.Navigator>
      <LoginModal />
      {user ? <TermsModal /> : null}
    </>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
