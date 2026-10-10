import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GeneratedCard } from '../cardTypes';
import { PlayySvg } from './PlayySvg';

/** Cards are laid out at a fixed 340x510 design size and scaled with `scale`. */
export const CARD_W = 340;
export const CARD_H = 510;

interface TrumpCardProps {
  card: GeneratedCard;
  scale?: number;
}

export const heroName = (card: GeneratedCard) =>
  (card.config.kidName?.trim() || 'PLAYY HERO').toUpperCase();

const Frame: React.FC<{ scale: number; border: string; children: React.ReactNode }> = ({
  scale,
  border,
  children,
}) => (
  <View style={{ width: CARD_W * scale, height: CARD_H * scale }}>
    <View
      style={[
        styles.border,
        {
          width: CARD_W,
          height: CARD_H,
          backgroundColor: border,
          transform: [{ translateX: -(CARD_W * (1 - scale)) / 2 }, { translateY: -(CARD_H * (1 - scale)) / 2 }, { scale }],
        },
      ]}
    >
      <View style={styles.inner}>{children}</View>
    </View>
  </View>
);

export const TrumpCardFront: React.FC<TrumpCardProps> = ({ card, scale = 1 }) => {
  const { config, stats, archetype, id } = card;
  const pills = [
    { icon: '⚔️', val: stats.power, lbl: 'PWR' },
    { icon: '⚡', val: stats.speed, lbl: 'SPD' },
    { icon: '🧠', val: stats.intelligence, lbl: 'INT' },
    { icon: '✨', val: stats.energy, lbl: 'NRG' },
  ];

  return (
    <Frame scale={scale} border="#FACC15">
      <View style={styles.row}>
        <View style={styles.elementBadge}>
          <Text style={styles.elementText}>{archetype.element}</Text>
        </View>
        <View style={styles.rarityBadge}>
          <Text style={styles.rarityText}>{archetype.rarity.toUpperCase()}</Text>
        </View>
      </View>

      <View>
        <Text style={styles.name} numberOfLines={1}>{heroName(card)}</Text>
        <Text style={styles.archetype}>{archetype.title}</Text>
      </View>

      <View style={styles.art}>
        <PlayySvg config={config} mode="color" width={200} height={245} />
      </View>

      <View style={styles.statGrid}>
        {pills.map((p) => (
          <View key={p.lbl} style={styles.pill}>
            <Text style={styles.pillIcon}>{p.icon}</Text>
            <Text style={styles.pillVal}>{p.val}</Text>
            <Text style={styles.pillLbl}>{p.lbl}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.serial}>ID: #{id.toUpperCase()}</Text>
        <Text style={styles.brand}>PLAYYS TRUMP CARD</Text>
      </View>
    </Frame>
  );
};

export const TrumpCardBack: React.FC<TrumpCardProps> = ({ card, scale = 1 }) => {
  const { stats, archetype, id } = card;
  const rows = [
    { label: 'POWER', val: stats.power, color: '#EF4444', icon: '⚔️' },
    { label: 'SPEED', val: stats.speed, color: '#EAB308', icon: '⚡' },
    { label: 'INTELLIGENCE', val: stats.intelligence, color: '#3B82F6', icon: '🧠' },
    { label: 'ENERGY', val: stats.energy, color: '#A855F7', icon: '✨' },
    { label: 'COURAGE', val: stats.courage, color: '#10B981', icon: '🦁' },
  ];
  const abilities = [archetype.specialAbility1, archetype.specialAbility2];

  return (
    <Frame scale={scale} border="#3B82F6">
      <View style={styles.center}>
        <Text style={styles.dossierTag}>CHARACTER DOSSIER</Text>
        <Text style={styles.name}>{archetype.title.toUpperCase()}</Text>
        <Text style={styles.archetype}>{archetype.subTitle}</Text>
      </View>

      <View style={styles.statsBox}>
        {rows.map((r) => (
          <View key={r.label} style={styles.statRow}>
            <Text style={styles.statLabel}>{r.icon} {r.label}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${r.val}%`, backgroundColor: r.color }]} />
            </View>
            <Text style={styles.statNum}>{r.val}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 6 }}>
        <Text style={styles.sectionHeader}>⚡ SPECIAL ABILITIES</Text>
        {abilities.map((a) => (
          <View key={a.name} style={styles.ability}>
            <View style={styles.abilityRow}>
              <Text style={styles.abilityName}>{a.name}</Text>
              <Text style={styles.abilityDmg}>DMG: {a.damage}</Text>
            </View>
            <Text style={styles.abilityDesc}>{a.description}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.quote}>"{archetype.quote}"</Text>

      <View style={styles.footer}>
        <Text style={styles.serial}>CARD SERIAL: #{id.toUpperCase()}</Text>
        <Text style={styles.seal}>AUTHENTIC COLLECTIBLE ★</Text>
      </View>
    </Frame>
  );
};

const styles = StyleSheet.create({
  border: {
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  inner: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#FEF08A',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  center: { alignItems: 'center' },
  elementBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  elementText: { color: '#F8FAFC', fontSize: 12, fontWeight: 'bold' },
  rarityBadge: { backgroundColor: '#7C3AED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rarityText: { color: '#FDE047', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  name: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  archetype: { color: '#94A3B8', fontSize: 11, fontWeight: '700', textAlign: 'center', letterSpacing: 1 },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
    height: CARD_H * 0.5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    padding: 4,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 6,
  },
  pill: { alignItems: 'center' },
  pillIcon: { fontSize: 13 },
  pillVal: { color: '#FACC15', fontSize: 13, fontWeight: '900' },
  pillLbl: { color: '#64748B', fontSize: 9, fontWeight: '800' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  serial: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  brand: { color: '#38BDF8', fontSize: 10, fontWeight: '800' },
  seal: { color: '#FACC15', fontSize: 9, fontWeight: '800' },
  dossierTag: { color: '#38BDF8', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  statsBox: { backgroundColor: '#1E293B', borderRadius: 14, padding: 10, gap: 6 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { width: 112, color: '#CBD5E1', fontSize: 10, fontWeight: '700' },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#334155', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  statNum: { width: 24, textAlign: 'right', color: '#FACC15', fontSize: 10, fontWeight: '900' },
  sectionHeader: { color: '#FDE047', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  ability: { backgroundColor: '#1E293B', borderRadius: 12, padding: 8 },
  abilityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  abilityName: { color: '#F8FAFC', fontSize: 12, fontWeight: '800' },
  abilityDmg: { color: '#FACC15', fontSize: 11, fontWeight: '900' },
  abilityDesc: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  quote: { color: '#C4B5FD', fontSize: 11, fontStyle: 'italic', textAlign: 'center' },
});
