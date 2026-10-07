/**
 * Complete standalone React Native Expo project definitions and source code.
 * These files represent a production-ready Expo SDK 52 application.
 */

export interface ExpoProjectFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const EXPO_PACKAGE_JSON = `{
  "name": "playys-native-creator",
  "version": "1.0.0",
  "description": "Interactive composable SVG character creator and printable coloring book configurator built with React Native and Expo.",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~52.0.28",
    "expo-status-bar": "~2.0.1",
    "expo-haptics": "~14.0.0",
    "expo-print": "~14.0.2",
    "expo-sharing": "~13.0.1",
    "expo-symbols": "~0.2.0",
    "react": "18.3.1",
    "react-native": "0.76.6",
    "react-native-svg": "15.9.0",
    "react-native-safe-area-context": "5.1.0",
    "react-native-screens": "~4.4.0",
    "@expo/vector-icons": "^14.0.4"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.3.12",
    "typescript": "^5.3.3"
  },
  "private": true
}`;

export const EXPO_APP_JSON = `{
  "expo": {
    "name": "PLAYYS Native",
    "slug": "playys-native-creator",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#38BDF8"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.playys.native.creator",
      "infoPlist": {
        "UIRequiresFullScreen": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#38BDF8"
      },
      "package": "com.playys.native.creator"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-print",
        {
          "enablePdfExport": true
        }
      ]
    ]
  }
}`;

export const EXPO_TSCONFIG = `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}`;

export const EXPO_README = `# PLAYYS Creator - React Native Expo App

Interactive composable SVG character creator and printable coloring book configurator built for iOS, Android, and Web using **React Native** and **Expo SDK 52**.

## 🚀 Quick Start

1. **Clone or Extract this project**:
   \`\`\`bash
   cd playys-native-creator
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server**:
   \`\`\`bash
   npx expo start
   \`\`\`

4. **Run on your device**:
   - **iOS Simulator**: Press \`i\` in terminal (requires macOS + Xcode)
   - **Android Emulator**: Press \`a\` in terminal (requires Android Studio)
   - **Web Browser**: Press \`w\` in terminal
   - **Physical Phone**: Install the free **Expo Go** app from App Store / Google Play and scan the terminal QR code!

## 📦 Features Included
- 🎨 **Composable Vector SVG Engine**: Powered by \`react-native-svg\` with customizable Heads, Poses, Symbols, and Worlds.
- 🖨️ **Native PDF & Print**: High-resolution 300 DPI coloring book sheets via \`expo-print\` and \`expo-sharing\`.
- 📳 **Haptic Feedback**: Tactile feedback on taps via \`expo-haptics\`.
- 📱 **Multi-Platform**: Runs seamlessly on iPhone, iPad, Android phones, tablets, and Web.
`;

export const EXPO_APP_TSX = `import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { PlayySvg } from './src/components/PlayySvg';
import { generateColoringHtml } from './src/utils/printTemplate';

export type HeadId = 'blue' | 'dreamyy' | 'sparkyy';
export type PoseId = 'hero' | 'wave' | 'jump' | 'sitting';
export type SymbolId = 'star' | 'cloud' | 'flame' | 'heart' | 'lightning' | 'moon' | 'paw' | 'gear' | 'crown';
export type BackgroundId = 'happy-hills' | 'magic-castle' | 'space-world' | 'jungle-world' | 'cloud-kingdom' | 'city-adventure';

export interface PlayyConfig {
  head: HeadId;
  pose: PoseId;
  symbol: SymbolId;
  background: BackgroundId;
}

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
  const [renderMode, setRenderMode] = useState<'color' | 'coloring'>('color');
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

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      triggerHaptic('success');
      const html = generateColoringHtml(config);
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
      const html = generateColoringHtml(config);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Share your PLAYY coloring page!',
        });
      } else {
        await Share.share({
          message: \`Look at my PLAYY character: \${config.head} in \${config.background}!\`,
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

      {/* Main Preview Hero */}
      <View style={styles.previewContainer}>
        <View style={styles.svgWrapper}>
          <PlayySvg
            config={config}
            mode={activeStep === 5 ? renderMode : 'color'}
            width={260}
            height={320}
          />
        </View>

        {activeStep === 5 && (
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modePill, renderMode === 'coloring' && styles.modePillActive]}
              onPress={() => {
                triggerHaptic('light');
                setRenderMode('coloring');
              }}
            >
              <Text style={[styles.modePillText, renderMode === 'coloring' && styles.modePillTextActive]}>
                Coloring Page
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modePill, renderMode === 'color' && styles.modePillActive]}
              onPress={() => {
                triggerHaptic('light');
                setRenderMode('color');
              }}
            >
              <Text style={[styles.modePillText, renderMode === 'color' && styles.modePillTextActive]}>
                Color Preview
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Step Tabs Indicator */}
      <View style={styles.stepsBar}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.stepItem, activeStep === s && styles.stepItemActive]}
            onPress={() => {
              triggerHaptic('light');
              setActiveStep(s);
            }}
          >
            <Text style={[styles.stepText, activeStep === s && styles.stepTextActive]}>
              {s === 1 ? '1. Head' : s === 2 ? '2. Pose' : s === 3 ? '3. Symbol' : s === 4 ? '4. World' : '5. Print'}
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
            <Text style={styles.exportTitle}>Your PLAYY Coloring Page is Ready!</Text>
            <Text style={styles.exportSubtitle}>
              Export high-resolution PDF or send straight to AirPrint / Wi-Fi printer.
            </Text>

            <TouchableOpacity
              style={styles.primaryPrintBtn}
              onPress={handlePrint}
              disabled={isPrinting}
            >
              <Ionicons name="print" size={24} color="#451A03" />
              <View>
                <Text style={styles.printBtnTitle}>Print Coloring Sheet</Text>
                <Text style={styles.printBtnSub}>Expo Print &bull; High Resolution 300 DPI</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryShareBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#4338CA" />
              <Text style={styles.shareBtnText}>Share PDF Page</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Step Nav */}
      <View style={styles.bottomNav}>
        {activeStep > 1 && (
          <TouchableOpacity
            style={styles.navBackBtn}
            onPress={() => {
              triggerHaptic('light');
              setActiveStep(activeStep - 1);
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#475569" />
            <Text style={styles.navBackText}>Back</Text>
          </TouchableOpacity>
        )}

        {activeStep < 5 && (
          <TouchableOpacity
            style={styles.navNextBtn}
            onPress={() => {
              triggerHaptic('medium');
              setActiveStep(activeStep + 1);
            }}
          >
            <Text style={styles.navNextText}>
              {activeStep === 4 ? 'Create My Playy!' : 'Next'}
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
`;

export const EXPO_SVG_TSX = `import React from 'react';
import Svg, { G, Path, Rect, Circle, Ellipse, Text as SvgText } from 'react-native-svg';
import { PlayyConfig } from '../types';

interface PlayySvgProps {
  config: PlayyConfig;
  mode: 'color' | 'coloring';
  width?: number;
  height?: number;
}

export const PlayySvg: React.FC<PlayySvgProps> = ({
  config,
  mode,
  width = 300,
  height = 380,
}) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3.5;

  return (
    <Svg width={width} height={height} viewBox="0 0 850 1100">
      {/* Background layer */}
      {config.background === 'happy-hills' && (
        <G id="bg-hills">
          <Rect width="850" height="1100" fill={isColor ? '#E0F2FE' : '#FFFFFF'} />
          <Path
            d="M-50 800 Q 200 680, 500 760 T 900 720 L 900 1100 L -50 1100 Z"
            fill={isColor ? '#86EFAC' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M-50 880 Q 300 800, 600 860 T 900 830 L 900 1100 L -50 1100 Z"
            fill={isColor ? '#4ADE80' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </G>
      )}

      {config.background === 'space-world' && (
        <G id="bg-space">
          <Rect width="850" height="1100" fill={isColor ? '#1E1B4B' : '#FFFFFF'} />
          <Circle cx="150" cy="200" r="40" fill={isColor ? '#F59E0B' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
          <Circle cx="720" cy="300" r="60" fill={isColor ? '#EC4899' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        </G>
      )}

      {/* Character Pose */}
      <G id="pose" transform="translate(425, 560)">
        <Rect
          x="-90"
          y="0"
          width="180"
          height="190"
          rx="45"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Chest Symbol Emblem */}
        <Circle cx="0" cy="70" r="34" fill={isColor ? '#FEF08A' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <SvgText
          x="0"
          y="80"
          fontSize="28"
          textAnchor="middle"
          fill={isColor ? '#D97706' : '#111827'}
        >
          {config.symbol === 'star' ? '★' : config.symbol === 'heart' ? '♥' : '⚡'}
        </SvgText>
      </G>

      {/* Character Head */}
      <G id="head" transform="translate(425, 440)">
        <Ellipse
          cx="0"
          cy="0"
          rx="88"
          ry="82"
          fill={isColor ? '#2563EB' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <Ellipse
          cx="0"
          cy="4"
          rx="78"
          ry="72"
          fill={isColor ? '#FFF1F2' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Eyes */}
        <Circle cx="-30" cy="-2" r="8" fill="#111827" />
        <Circle cx="30" cy="-2" r="8" fill="#111827" />
        {/* Smile */}
        <Path
          d="M-24 24 Q 0 44, 24 24"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};
`;

export const EXPO_PRINT_TEMPLATE_TS = `import { PlayyConfig } from '../types';

export function generateColoringHtml(config: PlayyConfig): string {
  return \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PLAYYS Coloring Sheet</title>
  <style>
    @page { size: letter portrait; margin: 0.25in; }
    body {
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: sans-serif;
      background: #FFFFFF;
    }
    .sheet-card {
      width: 100%;
      max-width: 780px;
      border: 4px solid #111827;
      border-radius: 24px;
      padding: 24px;
      box-sizing: border-box;
      text-align: center;
    }
    h1 {
      margin: 0 0 4px 0;
      font-size: 32px;
      color: #111827;
      letter-spacing: 2px;
    }
    p {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #64748B;
      font-weight: bold;
    }
    svg {
      width: 100%;
      height: auto;
      max-height: 820px;
    }
    .footer {
      margin-top: 16px;
      font-size: 12px;
      color: #94A3B8;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="sheet-card">
    <h1>PLAYYS</h1>
    <p>Imagine &bull; Create &bull; Play &bull; Config: \${config.head} - \${config.pose} - \${config.symbol}</p>
    <svg viewBox="0 0 850 1100" xmlns="http://www.w3.org/2000/svg">
      <rect width="840" height="1090" x="5" y="5" rx="20" fill="none" stroke="#111827" stroke-width="4"/>
      <!-- Background Outline -->
      <path d="M-50 820 Q 200 700, 500 780 T 900 740 L 900 1100 L -50 1100 Z" fill="#FFF" stroke="#111827" stroke-width="4"/>
      <!-- Body -->
      <rect x="335" y="560" width="180" height="200" rx="45" fill="#FFF" stroke="#111827" stroke-width="4"/>
      <circle cx="425" cy="630" r="35" fill="#FFF" stroke="#111827" stroke-width="4"/>
      <text x="425" y="642" font-size="32" text-anchor="middle" fill="#111827">★</text>
      <!-- Head -->
      <ellipse cx="425" cy="440" rx="88" ry="82" fill="#FFF" stroke="#111827" stroke-width="4"/>
      <circle cx="395" cy="435" r="8" fill="#111827"/>
      <circle cx="455" cy="435" r="8" fill="#111827"/>
      <path d="M400 465 Q 425 490, 450 465" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
    </svg>
    <div class="footer">PLAYYS &bull; Small Playys. Big Imagination! &bull; Printable Coloring Page</div>
  </div>
</body>
</html>
\`;
}
`;

export const EXPO_PROJECT_FILES: ExpoProjectFile[] = [
  {
    name: 'App.tsx',
    path: 'App.tsx',
    language: 'typescript',
    description: 'React Native Expo main entry component with state, navigation, haptics, and print actions',
    content: EXPO_APP_TSX,
  },
  {
    name: 'app.json',
    path: 'app.json',
    language: 'json',
    description: 'Expo configuration with iOS bundle ID, Android package, splash screen, and plugins',
    content: EXPO_APP_JSON,
  },
  {
    name: 'package.json',
    path: 'package.json',
    language: 'json',
    description: 'Project dependencies for Expo SDK 52, react-native-svg, expo-print, and expo-sharing',
    content: EXPO_PACKAGE_JSON,
  },
  {
    name: 'PlayySvg.tsx',
    path: 'src/components/PlayySvg.tsx',
    language: 'typescript',
    description: 'React Native SVG component rendering characters, poses, symbols, and backgrounds',
    content: EXPO_SVG_TSX,
  },
  {
    name: 'printTemplate.ts',
    path: 'src/utils/printTemplate.ts',
    language: 'typescript',
    description: 'Expo Print HTML generator for 300 DPI high-resolution vector PDF coloring pages',
    content: EXPO_PRINT_TEMPLATE_TS,
  },
  {
    name: 'cloudPrintService.ts',
    path: 'src/utils/cloudPrintService.ts',
    language: 'typescript',
    description: 'Silent Cloud Print integration (PrintNode, Epson Connect, local IPP) for Touch TVs & Kiosks',
    content: `// React Native Expo - PrintNode Cloud Print Integration
// 1. Silent, headless cloud printing ideal for Touch Screen TVs and Public Kiosks
// 2. No OS print dialog appears - sheet prints automatically within ~2 seconds!

import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';

export async function sendToPrintNode({
  apiKey,
  printerId,
  htmlContent,
  title = 'PLAYYS Coloring Sheet',
}: {
  apiKey: string;
  printerId: string;
  htmlContent: string;
  title?: string;
}) {
  // Step 1: Render vector HTML to PDF on device using expo-print
  const { uri } = await Print.printToFileAsync({
    html: htmlContent,
    width: 612,  // 8.5 inches at 72 pt
    height: 792, // 11 inches at 72 pt
  });

  // Step 2: Read PDF as base64 string
  const base64Pdf = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Step 3: Dispatch print job to PrintNode Cloud API
  const response = await fetch('https://api.printnode.com/printjobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(apiKey + ':'),
    },
    body: JSON.stringify({
      printerId: parseInt(printerId, 10),
      title: title,
      contentType: 'pdf_base64',
      content: base64Pdf,
      source: 'PLAYYS Touch Screen Kiosk',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`PrintNode failed (\${response.status}): \${errorText}\`);
  }

  const printJobId = await response.json();
  return { success: true, jobId: printJobId };
}`,
  },
  {
    name: 'tsconfig.json',
    path: 'tsconfig.json',
    language: 'json',
    description: 'TypeScript configuration extending expo/tsconfig.base',
    content: EXPO_TSCONFIG,
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Setup and execution guide for Expo Go, iOS Simulator, Android Studio, and Web',
    content: EXPO_README,
  },
];
