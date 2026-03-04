import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

// 导入页面
import HomeScreen from './screens/HomeScreen';
import ResourceScreen from './screens/ResourceScreen';
import MuseumScreen from './screens/MuseumScreen';
import ActivityScreen from './screens/ActivityScreen';
import SearchScreen from './screens/SearchScreen';

// 导入详情页
import PicDetailScreen from './screens/PicDetailScreen';
import VideoDetailScreen from './screens/VideoDetailScreen';
import MusicDetailScreen from './screens/MusicDetailScreen';
import ActivityDetailScreen from './screens/ActivityDetailScreen';
import MuseumDetailScreen from './screens/MuseumDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab 图标组件
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    resource: '🎵',
    museum: '🏛️',
    activity: '📅',
    search: '🔍',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '•'}
    </Text>
  );
}

// 主 Tab 导航
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a0a2e',
          borderTopColor: 'rgba(138, 43, 226, 0.3)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#c084fc',
        tabBarInactiveTintColor: 'rgba(192, 132, 252, 0.4)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="resource"
        component={ResourceScreen}
        options={{
          tabBarLabel: '资源',
          tabBarIcon: ({ focused }) => <TabIcon name="resource" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="museum"
        component={MuseumScreen}
        options={{
          tabBarLabel: '博物馆',
          tabBarIcon: ({ focused }) => <TabIcon name="museum" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="activity"
        component={ActivityScreen}
        options={{
          tabBarLabel: '动态',
          tabBarIcon: ({ focused }) => <TabIcon name="activity" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="search"
        component={SearchScreen}
        options={{
          tabBarLabel: '搜索',
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// 根 Stack 导航（包含详情页）
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#0d0118' },
            }}
          >
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="PicDetail" component={PicDetailScreen} />
            <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />
            <Stack.Screen name="MusicDetail" component={MusicDetailScreen} />
            <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
            <Stack.Screen name="MuseumDetail" component={MuseumDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
