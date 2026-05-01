import { View, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import HomeScreen from '../screens/HomeScreen'
import RiwayatScreen from '../screens/RiwayatScreen'
import { colors } from '../styles/theme'

export type TabParamList = {
  Beranda:  undefined
  Riwayat:  undefined
  Progress: undefined
  Profil:   undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const ICONS: Record<keyof TabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Beranda:  { active: 'home',           inactive: 'home-outline' },
  Riwayat:  { active: 'time',           inactive: 'time-outline' },
  Progress: { active: 'bar-chart',      inactive: 'bar-chart-outline' },
  Profil:   { active: 'person-circle',  inactive: 'person-circle-outline' },
}

function ProgressScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.onSurfaceDim, fontSize: 16 }}>Coming Soon</Text>
    </View>
  )
}

function ProfilScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.onSurfaceDim, fontSize: 16 }}>Coming Soon</Text>
    </View>
  )
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position:        'absolute',
          backgroundColor: colors.surface2,
          borderTopWidth:   1,
          borderTopColor:  colors.surfaceBorder,
          height:           60 + insets.bottom,
          paddingBottom:    insets.bottom,
        },
        tabBarActiveTintColor:   colors.secondary,
        tabBarInactiveTintColor: colors.onSurfaceDim,
        tabBarLabelStyle: {
          fontSize:     10,
          fontWeight:   '600',
          marginBottom:  4,
        },
        tabBarIcon: ({ focused, color }) => {
          const icon = ICONS[route.name as keyof TabParamList]
          return (
            <Ionicons
              name={focused ? icon.active : icon.inactive}
              size={22}
              color={color}
            />
          )
        },
      })}
    >
      <Tab.Screen name="Beranda"  component={HomeScreen} />
      <Tab.Screen name="Riwayat"  component={RiwayatScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profil"   component={ProfilScreen} />
    </Tab.Navigator>
  )
}

