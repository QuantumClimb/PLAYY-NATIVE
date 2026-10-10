import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Share,
  Platform,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { PlayySvg } from './src/components/PlayySvg';
import { generatePrintPackHtml } from './src/utils/printTemplate';
import { QUIZ_QUESTIONS } from './src/data/questions';
import { calculateArchetype } from './src/data/archetypes';
import { BASE_STATS, CharacterStats, GeneratedCard } from './src/cardTypes';
import { TrumpCardFront, TrumpCardBack, CARD_W, CARD_H } from './src/components/TrumpCard';
import { PlayyConfig, HeadId, PoseId, SymbolId, BackgroundId } from './src/types';

const STAT_KEYS: (keyof CharacterStats)[] = ['power', 'speed', 'intelligence', 'energy', 'courage'];
const STEP_LABELS = ['Head', 'Pose', 'Symbol', 'World', 'Name', 'Quiz', 'Card'];

const HEADS: { id: HeadId; name: string; color: string; desc: string }[] = [
  { id: 'blue', name: 'Bluey Head', color: '#2563EB', desc: 'Star crown & friendly smile' },
  { id: 'dreamyy', name: 'Dreamyy Bear', color: '#EC4899', desc: 'Round ears & sweet cheeks' },
  { id: 'sparkyy', name: 'Sparkyy Cat', color: '#F59E0B', desc: 'Curved whiskers & dynamic ears' },
];

const POSES: { id: PoseId; name: string; icon: string; desc: string }[] = [
  { id: 'wave', name: 'Friendly Wave', icon: 'hand-peace', desc: 'Warm greeting' },
  { id: 'hero', name: 'Heroic Stand', icon: 'shield-alt', desc: 'Hands on hips confident' },
  { id: 'jump', name: 'Joyful Jump', icon: 'running', desc: 'Hands high in air' },
  { id: 'sitting', name: 'Chill Sitting', icon: 'couch', desc: 'Sitting relaxed' },
];

const SYMBOLS: { id: SymbolId; name: string; emoji: string }[] = [
  { id: 'star', name: 'Star', emoji: '⭐' },
  { id: 'heart', name: 'Heart', emoji: '💖' },
  { id: 'lightning', name: 'Bolt', emoji: '⚡' },
  { id: 'cloud', name: 'Cloud', emoji: '☁️' },
  { id: 'flame', name: 'Fire', emoji: '🔥' },
  { id: 'moon', name: 'Moon', emoji: '🌙' },
  { id: 'crown', name: 'Crown', emoji: '👑' },
  { id: 'paw', name: 'Paw', emoji: '🐾' },
  { id: 'gear', name: 'Gear', emoji: '⚙️' },
];

const BACKGROUNDS: { id: BackgroundId; name: string; color: string }[] = [
  { id: 'happy-hills', name: 'Happy Hills', color: '#86EFAC' },
  { id: 'magic-castle', name: 'Magic Castle', color: '#F472B6' },
  { id: 'space-world', name: 'Space World', color: '#93C5FD' },
  { id: 'jungle-world', name: 'Jungle World', color: '#34D399' },
  { id: 'cloud-kingdom', name: 'Cloud Kingdom', color: '#67E8F9' },
  { id: 'city-adventure', name: 'City Adventure', color: '#FBBF24' },
];

export default function App() {
  const [config, setConfig] = useState<PlayyConfig>({
    head: 'blue',
    pose: 'wave',
    symbol: 'star',
    background: 'happy-hills',
  });
  const [activeStep, setActiveStep] = useState<number>(1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [card, setCard] = useState<GeneratedCard | null>(null);
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const triggerHaptic = (type: 'light' | 'medium' | 'success') => {
    if (Platform.OS === 'web') return;
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRandomize = useCallback(() => {
    triggerHaptic('medium');
    const randomHead = HEADS[Math.floor(Math.random() * HEADS.length)].id;
    const randomPose = POSES[Math.floor(Math.random() * POSES.length)].id;
    const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id;
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)].id;
    setConfig({
      head: randomHead,
      pose: randomPose,
      symbol: randomSymbol,
      background: randomBg,
    });
  }, []);

  // Each answer adds its stat boost on top of the base stats (capped at 100)
  const handleAnswer = (optionIndex: number) => {
    triggerHaptic('light');
    const next = [...answers, optionIndex];
    if (next.length < QUIZ_QUESTIONS.length) {
      setAnswers(next);
      return;
    }
    const stats: CharacterStats = { ...BASE_STATS };
    next.forEach((optIdx, qIdx) => {
      const boost = QUIZ_QUESTIONS[qIdx].options[optIdx].statBoost;
      STAT_KEYS.forEach((k) => {
        stats[k] = Math.min(100, stats[k] + (boost[k] ?? 0));
      });
    });
    setCard({
      id: Math.random().toString(36).substring(2, 9),
      config,
      stats,
      archetype: calculateArchetype(stats),
      createdAt: new Date().toISOString(),
    });
    setAnswers([]);
    setCardSide('front');
    setActiveStep(7);
  };

  const goToStep = (step: number) => {
    triggerHaptic('light');
    if (step === 7 && !card) return;
    if (step !== 6) setAnswers([]);
    setActiveStep(step);
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      triggerHaptic('success');
      const html = generatePrintPackHtml(config, card);
      await Print.printAsync({ html });
    } catch (e: any) {
      Alert.alert('Printing Error', e?.message || 'Could not launch print service');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    try {
      triggerHaptic('medium');
      const html = generatePrintPackHtml(config, card);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Share your PLAYY coloring page!',
        });
      } else {
        await Share.share({
          message: `Look at my PLAYY character: ${config.head} in ${config.background}!`,
        });
      }
    } catch (e: any) {
      Alert.alert('Sharing Error', e?.message || 'Unable to share');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>PLAYYS</Text>
          <View style={styles.expoBadge}>
            <Text style={styles.expoBadgeText}>EXPO NATIVE</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.randomButton}
            onPress={handleRandomize}
            activeOpacity={0.7}
          >
            <Ionicons name="dice" size={20} color="#6366F1" />
            <Text style={styles.randomButtonText}>Surprise</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Preview Hero (hidden on quiz / card steps to leave room) */}
      {activeStep <= 5 && (
        <View style={styles.previewContainer}>
          <View style={styles.svgWrapper}>
            <PlayySvg config={config} mode="color" width={260} height={320} />
          </View>
        </View>
      )}

      {/* Step Tabs Indicator */}
      <View style={styles.stepsBar}>
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.stepItem, activeStep === s && styles.stepItemActive]}
            onPress={() => goToStep(s)}
          >
            <Text style={[styles.stepText, activeStep === s && styles.stepTextActive]}>
              {s}. {STEP_LABELS[s - 1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Interactive Picker Section */}
      <ScrollView style={styles.pickerScroll} contentContainerStyle={styles.pickerContent}>
        {activeStep === 1 && (
          <View style={styles.optionsGrid}>
            {HEADS.map((h) => (
              <TouchableOpacity
                key={h.id}
                style={[styles.optionCard, config.head === h.id && styles.optionCardActive]}
                onPress={() => {
                  triggerHaptic('light');
                  setConfig({ ...config, head: h.id });
                }}
              >
                <View style={[styles.optionColorDot, { backgroundColor: h.color }]} />
                <View style={styles.optionDetails}>
                  <Text style={styles.optionName}>{h.name}</Text>
                  <Text style={styles.optionDesc}>{h.desc}</Text>
                </View>
                {config.head === h.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeStep === 2 && (
          <View style={styles.optionsGrid}>
            {POSES.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.optionCard, config.pose === p.id && styles.optionCardActive]}
                onPress={() => {
                  triggerHaptic('light');
                  setConfig({ ...config, pose: p.id });
                }}
              >
                <View style={styles.optionIconContainer}>
                  <FontAwesome5 name={p.icon as any} size={20} color="#6366F1" />
                </View>
                <View style={styles.optionDetails}>
                  <Text style={styles.optionName}>{p.name}</Text>
                  <Text style={styles.optionDesc}>{p.desc}</Text>
                </View>
                {config.pose === p.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeStep === 3 && (
          <View style={styles.symbolsGrid}>
            {SYMBOLS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.symbolCard, config.symbol === s.id && styles.symbolCardActive]}
                onPress={() => {
                  triggerHaptic('light');
                  setConfig({ ...config, symbol: s.id });
                }}
              >
                <Text style={styles.symbolEmoji}>{s.emoji}</Text>
                <Text style={styles.symbolName}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeStep === 4 && (
          <View style={styles.optionsGrid}>
            {BACKGROUNDS.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[styles.optionCard, config.background === b.id && styles.optionCardActive]}
                onPress={() => {
                  triggerHaptic('light');
                  setConfig({ ...config, background: b.id });
                }}
              >
                <View style={[styles.bgSwatch, { backgroundColor: b.color }]} />
                <View style={styles.optionDetails}>
                  <Text style={styles.optionName}>{b.name}</Text>
                </View>
                {config.background === b.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeStep === 5 && (
          <View style={styles.exportSection}>
            <Text style={styles.exportTitle}>What is your name?</Text>
            <Text style={styles.exportSubtitle}>It goes on your trump card. You can skip this.</Text>
            <TextInput
              style={styles.nameInput}
              value={config.kidName ?? ''}
              onChangeText={(t) => setConfig({ ...config, kidName: t.toUpperCase().slice(0, 10) })}
              placeholder="YOUR NAME"
              placeholderTextColor="#94A3B8"
              maxLength={10}
              autoCapitalize="characters"
            />
          </View>
        )}

        {activeStep === 6 && QUIZ_QUESTIONS[answers.length] && (
          <View style={styles.exportSection}>
            <Text style={styles.quizCount}>
              QUESTION {answers.length + 1} OF {QUIZ_QUESTIONS.length}
            </Text>
            <Text style={styles.exportTitle}>{QUIZ_QUESTIONS[answers.length].question}</Text>
            <Text style={styles.exportSubtitle}>{QUIZ_QUESTIONS[answers.length].subtitle}</Text>
            <View style={styles.optionsGrid}>
              {QUIZ_QUESTIONS[answers.length].options.map((opt, i) => (
                <TouchableOpacity key={opt.label} style={styles.optionCard} onPress={() => handleAnswer(i)}>
                  <Text style={styles.quizIcon}>{opt.icon}</Text>
                  <View style={styles.optionDetails}>
                    <Text style={styles.optionName}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeStep === 7 && card && (() => {
          const scale = Math.min(1, (windowHeight * 0.45) / CARD_H, (windowWidth - 32) / CARD_W);
          return (
            <View style={styles.exportSection}>
              <Text style={styles.exportTitle}>Your PLAYY Trump Card is Ready!</Text>
              <View style={{ alignItems: 'center', marginVertical: 8 }}>
                {cardSide === 'front' ? (
                  <TrumpCardFront card={card} scale={scale} />
                ) : (
                  <TrumpCardBack card={card} scale={scale} />
                )}
              </View>

              <TouchableOpacity
                style={styles.secondaryShareBtn}
                onPress={() => {
                  triggerHaptic('light');
                  setCardSide(cardSide === 'front' ? 'back' : 'front');
                }}
              >
                <Ionicons name="sync" size={20} color="#4338CA" />
                <Text style={styles.shareBtnText}>Flip card to {cardSide === 'front' ? 'back' : 'front'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryPrintBtn} onPress={handlePrint} disabled={isPrinting}>
                <Ionicons name="print" size={24} color="#451A03" />
                <View>
                  <Text style={styles.printBtnTitle}>Print Coloring Page + Card</Text>
                  <Text style={styles.printBtnSub}>Expo Print &bull; AirPrint / Wi-Fi printer</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryShareBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color="#4338CA" />
                <Text style={styles.shareBtnText}>Share PDF</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </ScrollView>

      {/* Bottom Step Nav */}
      <View style={styles.bottomNav}>
        {activeStep > 1 && (
          <TouchableOpacity
            style={styles.navBackBtn}
            onPress={() => {
              triggerHaptic('light');
              if (activeStep === 6 && answers.length > 0) {
                setAnswers(answers.slice(0, -1));
              } else {
                goToStep(activeStep - 1);
              }
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#475569" />
            <Text style={styles.navBackText}>Back</Text>
          </TouchableOpacity>
        )}

        {activeStep < 6 && (
          <TouchableOpacity
            style={styles.navNextBtn}
            onPress={() => {
              triggerHaptic('medium');
              setActiveStep(activeStep + 1);
            }}
          >
            <Text style={styles.navNextText}>
              {activeStep === 5 ? 'Start Quiz' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#0F172A" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  expoBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  expoBadgeText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  randomButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },
  svgWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 14,
    marginTop: 10,
    gap: 4,
  },
  modePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  modePillActive: {
    backgroundColor: '#6366F1',
  },
  modePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modePillTextActive: {
    color: '#FFFFFF',
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0F172A',
    marginTop: 12,
  },
  quizCount: { fontSize: 12, fontWeight: '800', color: '#F59E0B', letterSpacing: 1.5, textAlign: 'center' },
  quizIcon: { fontSize: 30, marginRight: 12 },
  stepsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  stepItemActive: {
    borderBottomColor: '#6366F1',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepTextActive: {
    color: '#6366F1',
  },
  pickerScroll: {
    flex: 1,
  },
  pickerContent: {
    padding: 16,
  },
  optionsGrid: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCardActive: {
    borderColor: '#6366F1',
    backgroundColor: '#F5F3FF',
  },
  optionColorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bgSwatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 12,
  },
  optionDetails: {
    flex: 1,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  symbolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  symbolCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  symbolCardActive: {
    borderColor: '#6366F1',
    backgroundColor: '#F5F3FF',
  },
  symbolEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  symbolName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  exportSection: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  exportSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  primaryPrintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBBF24',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '100%',
    gap: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  printBtnTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#451A03',
  },
  printBtnSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78350F',
  },
  secondaryShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    marginTop: 10,
    gap: 8,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4338CA',
  },
  bottomNav: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  navBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  navNextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FACC15',
    gap: 6,
  },
  navNextText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
});
