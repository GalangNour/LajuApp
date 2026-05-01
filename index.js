import { registerRootComponent } from 'expo'
import { defineLocationTask } from './hooks/useGps'
import App from './App'

// Task harus didaftarkan sebelum app render
defineLocationTask()

registerRootComponent(App)
