import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'
import { useEmailAuth } from '../hooks/useEmailAuth'
import s from '../styles/auth'

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> }

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const { signUp, loading, error, needsConfirmation } = useEmailAuth()

  const mismatch = confirm.length > 0 && password !== confirm

  if (needsConfirmation) {
    return (
      <View style={ls.confirmBox}>
        <Text style={ls.icon}>📧</Text>
        <Text style={ls.confirmTitle}>Cek Email Kamu</Text>
        <Text style={s.link}>Link konfirmasi dikirim ke{'\n'}<Text style={s.linkBold}>{email}</Text></Text>
        <Text style={[s.link, { marginTop: 8, marginBottom: 32 }]}>Klik link tersebut lalu login.</Text>
        <TouchableOpacity style={s.button} onPress={() => navigation.navigate('Login')}>
          <Text style={s.buttonText}>Ke Halaman Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Buat Akun</Text>
        <Text style={s.subtitle}>Daftar untuk mulai menggunakan Laju</Text>

        <TextInput style={s.input} placeholder="Nama lengkap" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={[s.input, mismatch && s.inputError]} placeholder="Konfirmasi password" value={confirm} onChangeText={setConfirm} secureTextEntry />

        {mismatch && <Text style={s.errorText}>Password tidak sama</Text>}
        {error && <Text style={s.errorText}>{error}</Text>}

        <TouchableOpacity style={[s.button, (loading || mismatch) && s.buttonOff]} onPress={() => signUp(email, password, name)} disabled={loading || mismatch}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Daftar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={s.link}>Sudah punya akun? <Text style={s.linkBold}>Masuk</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const ls = StyleSheet.create({
  confirmBox:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  icon:         { fontSize: 56, marginBottom: 24 },
  confirmTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
})
