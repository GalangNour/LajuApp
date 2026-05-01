import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'
import { useEmailAuth } from '../hooks/useEmailAuth'
import s from '../styles/auth'

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> }

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, loading, error } = useEmailAuth()

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.container}>
        <Text style={s.title}>Selamat Datang</Text>
        <Text style={s.subtitle}>Masuk ke akun Laju kamu</Text>

        <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        {error && <Text style={s.errorText}>{error}</Text>}

        <TouchableOpacity style={[s.button, loading && s.buttonOff]} onPress={() => signIn(email, password)} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Masuk</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.link}>Belum punya akun? <Text style={s.linkBold}>Daftar</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
