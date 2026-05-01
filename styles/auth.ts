import { StyleSheet } from 'react-native'
import { colors, fonts, fontSize, radius, spacing } from './theme'

export default StyleSheet.create({
  container:     { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.white },
  title:         { fontSize: fontSize['3xl'], fontFamily: fonts.bold, color: colors.primary, marginBottom: 6 },
  subtitle:      { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.gray500, marginBottom: spacing.xl },
  input:         { borderWidth: 1, borderColor: colors.gray100, borderRadius: radius.md, padding: 14, marginBottom: 12, fontSize: fontSize.md, fontFamily: fonts.regular, backgroundColor: colors.whiteGray },
  inputError:    { borderColor: colors.error },
  button:        { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, alignItems: 'center', marginTop: spacing.sm, marginBottom: 20 },
  buttonOff:     { opacity: 0.6 },
  buttonText:    { color: colors.white, fontFamily: fonts.bold, fontSize: fontSize.md },
  errorText:     { color: colors.error, fontSize: fontSize.sm, fontFamily: fonts.regular, marginBottom: spacing.sm },
  link:          { textAlign: 'center', color: colors.gray500, fontSize: fontSize.sm, fontFamily: fonts.regular },
  linkBold:      { color: colors.primary, fontFamily: fonts.semiBold },
})
