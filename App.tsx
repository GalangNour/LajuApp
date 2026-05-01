import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useFonts } from './hooks/useFonts'
import { colors } from './styles/theme'
import type { Activity } from './lib/activityStorage'

import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import HomeScreen from './screens/HomeScreen'
import PermissionTestScreen from './screens/PermissionTestScreen'
import LiveScreen from './screens/LiveScreen'
import ActivitySummaryScreen from './screens/ActivitySummaryScreen'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Home: undefined
  PermissionTest: undefined
  Live: undefined
  ActivitySummary: { activity: Activity }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function Navigator() {
  const { session, loading } = useAuth()

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Live" component={LiveScreen} />
          <Stack.Screen name="ActivitySummary" component={ActivitySummaryScreen} options={{ headerShown: true, title: 'Ringkasan' }} />
          <Stack.Screen name="PermissionTest" component={PermissionTestScreen} options={{ headerShown: true, title: 'Test Lokasi' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  const { loaded } = useFonts()

  if (!loaded) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )

  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    </AuthProvider>
  )
}
