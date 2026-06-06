import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Text } from "react-native"
import { colors } from "@liuyao/shared/design"
import LandingScreen from "@/screens/LandingScreen"
import PaipanScreen from "@/screens/PaipanScreen"
import ChatScreen from "@/screens/ChatScreen"
import HistoryScreen from "@/screens/HistoryScreen"
import ProfileScreen from "@/screens/ProfileScreen"
import LoginScreen from "@/screens/LoginScreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: "☯",
    History: "📜",
    Profile: "👤",
  }
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? "●"}
    </Text>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkDim,
        tabBarStyle: {
          backgroundColor: colors.clean.bg,
          borderTopColor: colors.clean.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={LandingScreen}
        options={{
          tabBarLabel: "起卦",
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: "历史",
          tabBarIcon: ({ focused }) => <TabIcon label="History" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "我的",
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Paipan"
          component={PaipanScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: "slide_from_bottom", presentation: "modal" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
