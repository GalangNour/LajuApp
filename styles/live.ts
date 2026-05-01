import { StyleSheet } from 'react-native'
import { colors, fonts, fontSize, radius, spacing } from './theme'

export const liveMapStyle = [
  { elementType: 'geometry',              stylers: [{ color: colors.surface2 }] },
  { elementType: 'labels.text.fill',      stylers: [{ color: colors.onSurface, opacity: 0.4 }] },
  { featureType: 'road', elementType: 'geometry',        stylers: [{ color: colors.surface3 }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: colors.surface }] },
  { featureType: 'water', elementType: 'geometry',       stylers: [{ color: colors.surface }] },
  { featureType: 'poi',     stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

export default StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.surface },

  // Map overlay — top bar
  topBar:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  gpsBadge:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(2,24,32,0.85)', borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.surfaceBorder },
  gpsDot:           { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.successAlt },
  gpsBadgeText:     { fontSize: fontSize.xs, fontFamily: fonts.semiBold, color: colors.onSurface },
  settingsBtn:      { width: 36, height: 36, backgroundColor: 'rgba(2,24,32,0.85)', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.surfaceBorder, alignItems: 'center', justifyContent: 'center' },
  settingsBtnText:  { fontSize: fontSize.md, color: colors.onSurface },
  recenterBtn:      { width: 44, height: 44, backgroundColor: colors.onSurface, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 5 },

  // Bottom panel
  panel:            { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40 },

  distanceRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: spacing.md },
  distanceNum:      { fontSize: 80, fontFamily: fonts.bold, color: colors.onSurface, lineHeight: 84 },
  distanceUnit:     { fontSize: 14, fontFamily: fonts.semiBold, color: colors.onSurfaceDim, paddingBottom: 12 },

  statsRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statItem:         { flex: 1, alignItems: 'center' },
  statDivider:      { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },
  statVal:          { fontSize: fontSize.lg, fontFamily: fonts.bold, color: colors.onSurface, marginBottom: 2 },
  statLbl:          { fontSize: 10, fontFamily: fonts.medium, color: colors.onSurfaceDim, letterSpacing: 0.5 },

  // idle: full-width start button
  btnStart:         { backgroundColor: colors.secondary, borderRadius: radius.lg, padding: 18, alignItems: 'center', shadowColor: colors.secondary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  btnStartText:     { fontSize: fontSize.md, fontFamily: fonts.bold, color: colors.surface },

  // running/paused: 3-button controls
  controls:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  btnSecondary:     { width: 52, height: 52, backgroundColor: colors.surface3, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  btnLocked:        { backgroundColor: colors.primaryLight },
  btnDisabled:      { opacity: 0.4 },
  btnSecondaryText: { fontSize: fontSize.xl },
  btnCenter:        { width: 64, height: 64, backgroundColor: colors.secondary, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', shadowColor: colors.secondary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  btnCenterText:    { fontSize: fontSize.xl, color: colors.surface },
})
