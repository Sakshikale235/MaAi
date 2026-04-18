import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Send, Mic } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import ChatBubble from '@/components/chat/ChatBubble';
import { ChatMessage } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

const SUGGESTED = [
  'chat_q1',
  'chat_q2',
  'chat_q3',
  'chat_q4',
  'chat_q5',
];

const AI_RESPONSES: Record<string, string> = {
  default:
    'I can help with clinical questions about maternal and neonatal health. Please ask me anything specific.',
  bp: 'High BP in pregnancy (≥140/90 mmHg) can indicate gestational hypertension. BP ≥160/110 mmHg is a hypertensive emergency requiring immediate intervention. Monitor symptoms like headache and visual disturbances closely.',
  preeclampsia:
    'For pre-eclampsia: 1) Monitor BP every 30 min, 2) Check for protein in urine, 3) Watch for headache/visual changes, 4) Give magnesium sulphate if available, 5) Arrange urgent referral to a facility with C-section capability.',
  refer:
    'Refer immediately if: BP ≥160/110, severe headache with visual changes, convulsions, heavy vaginal bleeding, fetal heart rate <110 or >160 BPM, no fetal movement for >12 hours, or MUAC <18cm.',
  muac:
    'MUAC (Mid Upper Arm Circumference) measures nutritional status. Values: <18cm = Severe Acute Malnutrition, 18-21cm = Moderate Malnutrition, >23cm = Normal. It is a quick, reliable indicator for identifying undernourished pregnant women.',
  fhr:
    'Normal fetal heart rate is 110–160 BPM. Below 110 BPM (bradycardia) or above 160 BPM (tachycardia) requires immediate assessment. Use a fetal Doppler or Pinard stethoscope at 20+ weeks.',
};

let msgId = 1;

function getResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('bp') || lower.includes('blood pressure') || lower.includes('hypertension')) return AI_RESPONSES.bp;
  if (lower.includes('pre-eclampsia') || lower.includes('preeclampsia')) return AI_RESPONSES.preeclampsia;
  if (lower.includes('refer') || lower.includes('emergency')) return AI_RESPONSES.refer;
  if (lower.includes('muac') || lower.includes('arm')) return AI_RESPONSES.muac;
  if (lower.includes('fetal') || lower.includes('heart')) return AI_RESPONSES.fhr;
  return AI_RESPONSES.default;
}

export default function ChatbotScreen() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: t('chat_welcome'),
      sender: 'ai',
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnim.stopAnimation();
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const sendMessage = async (text: string = input) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: String(msgId++),
      content: text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    setIsTyping(false);

    const aiMsg: ChatMessage = {
      id: String(msgId++),
      content: getResponse(text) === AI_RESPONSES.default ? t('chat_resp_default') : getResponse(text),
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>AI</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{t('maa_ai')} Assistant</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{t('chat_online_status')}</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => <ChatBubble message={item} />}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingIndicator}>
              <View style={styles.typingBubble}>
                <Animated.Text style={[styles.typingDots, { opacity: typingAnim }]}>
                  ● ● ●
                </Animated.Text>
              </View>
            </View>
          ) : null
        }
      />

      <View style={styles.suggestedScroll}>
        <Text style={styles.suggestedLabel}>{t('chat_suggested')}</Text>
        <FlatList
          horizontal
          data={SUGGESTED}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestedChip}
              onPress={() => sendMessage(t(item as any))}
            >
              <Text style={styles.suggestedText}>{t(item as any)}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.micBtn}>
            <Mic size={20} color={Colors.text.muted} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('chat_ask')}
            placeholderTextColor={Colors.text.muted}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim()}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    gap: 12,
    ...Shadow.sm,
  },
  back: { padding: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.risk.low },
  onlineText: { fontSize: FontSize.xs, color: Colors.text.muted },
  chatList: { padding: Spacing.md, paddingBottom: 8 },
  typingIndicator: { paddingLeft: Spacing.md, paddingVertical: 4 },
  typingBubble: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: 4,
    padding: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  typingDots: { fontSize: FontSize.sm, color: Colors.text.muted, letterSpacing: 4 },
  suggestedScroll: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.surface,
    paddingTop: 8,
    paddingBottom: 4,
  },
  suggestedLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
    paddingHorizontal: Spacing.md,
    marginBottom: 6,
  },
  suggestedList: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: 4 },
  suggestedChip: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  suggestedText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    maxHeight: 100,
    backgroundColor: Colors.background,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  sendBtnDisabled: { backgroundColor: Colors.border.medium, elevation: 0 },
});
