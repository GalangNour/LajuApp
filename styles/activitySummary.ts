import { StyleSheet } from 'react-native'
import { colors, fonts, fontSize, radius, spacing } from './theme'

export const darkMapStyle = [
  { elementType: 'geometry',              stylers: [{ color: colors.surface2 }] },
  { elementType: 'labels.text.fill',      stylers: [{ color: colors.onSurface, opacity: 0.4 }] },
  { featureType: 'road', elementType: 'geometry',        stylers: [{ color: colors.surface3 }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: colors.surface }] },
  { featureType: 'water', elementType: 'geometry',       stylers: [{ color: colors.surface }] },
  { featureType: 'poi',     stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

export default StyleSheet.create({
  safe:              { flex: 1, backgroundColor: colors.surface },
  scroll:            { flex: 1 },

  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  iconBtn:           { width: 36, height: 36, backgroundColor: colors.surface3, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  iconBtnText:       { color: colors.onSurface, fontSize: fontSize.md },
  headerTitle:       { fontSize: fontSize.md, fontFamily: fonts.semiBold, color: colors.onSurface },

  hero:              { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  heroTitle:         { fontSize: fontSize['2xl'], fontFamily: fonts.bold, color: colors.onSurface },
  heroSub:           { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.onSurfaceDim, marginTop: 2 },

  mapWrap:           { marginHorizontal: spacing.lg, borderRadius: radius.lg, overflow: 'hidden', height: 180, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.surfaceBorder },
  map:               { flex: 1 },
  mapPlaceholder:    { backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  mapBadge:          { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(2,24,32,0.85)', borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.surfaceBorder },
  gpsDot:            { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.secondary },
  mapBadgeText:      { fontSize: fontSize.xs, fontFamily: fonts.semiBold, color: colors.onSurfaceDim },

  mainStat:          { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.lg, gap: 6, marginBottom: spacing.md },
  mainNumber:        { fontSize: 72, fontFamily: fonts.bold, color: colors.onSurface, lineHeight: 76 },
  mainUnitWrap:      { paddingBottom: 10 },
  mainUnit:          { fontSize: fontSize.xl, fontFamily: fonts.bold, color: colors.secondary },
  progressBadge:     { backgroundColor: colors.secondaryDim, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3, marginTop: spacing.xs, borderWidth: 1, borderColor: 'rgba(238,164,0,0.3)' },
  progressBadgeText: { fontSize: 10, fontFamily: fonts.bold, color: colors.secondary },

  statsGrid:         { flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.surface2, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: spacing.sm, overflow: 'hidden' },
  statCell:          { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statCellBorder:    { borderRightWidth: 1, borderRightColor: colors.surfaceBorder },
  statVal:           { fontSize: fontSize.xl, fontFamily: fonts.bold, color: colors.onSurface, marginBottom: spacing.xs },
  statLbl:           { fontSize: 10, fontFamily: fonts.medium, color: colors.onSurfaceDim, textTransform: 'uppercase', letterSpacing: 0.5 },

  secondaryRow:      { flexDirection: 'row', marginHorizontal: spacing.lg, gap: 10, marginBottom: spacing.sm },
  secCard:           { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface2, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder },
  secIcon:           { width: 36, height: 36, backgroundColor: colors.secondaryDim, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  secIconText:       { fontSize: fontSize.lg },
  secVal:            { fontSize: 18, fontFamily: fonts.bold, color: colors.onSurface },
  secLbl:            { fontSize: 10, fontFamily: fonts.medium, color: colors.onSurfaceDim, textTransform: 'uppercase' },

  insightCard:       { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: spacing.lg, backgroundColor: colors.surface2, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: spacing.md },
  insightIcon:       { width: 42, height: 42, backgroundColor: colors.secondaryDim, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  insightLabel:      { fontSize: 10, fontFamily: fonts.bold, color: colors.secondary, letterSpacing: 0.5, marginBottom: spacing.xs },
  insightText:       { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.onSurface, lineHeight: 20 },

  splitsSection:     { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  sectionTitle:      { fontSize: 12, fontFamily: fonts.bold, color: colors.onSurfaceDim, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  splitRow:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  splitKm:           { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.onSurfaceDim, width: 36 },
  splitBarWrap:      { flex: 1, height: 4, backgroundColor: colors.surface3, borderRadius: 2, overflow: 'hidden' },
  splitBar:          { height: '100%', backgroundColor: colors.secondary, borderRadius: 2 },
  splitBarBest:      { backgroundColor: colors.successAlt },
  splitPace:         { fontSize: fontSize.sm, fontFamily: fonts.bold, color: colors.onSurface, width: 44, textAlign: 'right' },
  bestTag:           { backgroundColor: colors.successAltDim, borderRadius: spacing.xs, paddingHorizontal: 5, paddingVertical: 2 },
  bestTagText:       { fontSize: 9, fontFamily: fonts.bold, color: colors.successAlt },

  btnGroup:          { padding: spacing.lg, gap: 10 },
  btnPrimary:        { backgroundColor: colors.secondary, borderRadius: radius.lg, padding: 18, alignItems: 'center', shadowColor: colors.secondary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  btnSaved:          { backgroundColor: colors.successAlt },
  btnPrimaryText:    { fontSize: fontSize.md, fontFamily: fonts.bold, color: colors.surface },
  btnSecondary:      { borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.surfaceBorder },
  btnSecondaryText:  { fontSize: fontSize.md, fontFamily: fonts.semiBold, color: colors.onSurfaceDim },
  btnDiscard:        { padding: 12, alignItems: 'center' },
  btnDiscardText:    { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.onSurfaceDim },
})
