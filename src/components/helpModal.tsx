import { Modal, View, Text, StyleSheet, Pressable, Linking, ScrollView, useWindowDimensions } from 'react-native';
import { COLORS } from '../utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}
const PRIVACY_URL = 'https://francisayyad03.github.io/kalimaPrivacy/';
export function HelpModal({ visible, onClose }: HelpModalProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const modalMaxHeight = height - insets.top - insets.bottom - 24;

  const openPrivacy = () => {
    Linking.openURL(PRIVACY_URL);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
        <View style={[styles.modal, { maxHeight: modalMaxHeight }]}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
          <Text style={styles.title}>طريقة اللعب</Text>

          <Text style={styles.body}>
            خمن الكلمة خلال ٦ محاولات.
          </Text>

          {/* ===== RULES ===== */}
          <View style={styles.rules}>
            <Text style={styles.ruleLine}>🟩 الحرف صحيح وفي مكانه</Text>
            <Text style={styles.ruleLine}>🟨 الحرف موجود لكن بمكان آخر</Text>
          </View>

          {/* ===== LANGUAGE NOTES ===== */}
            <View style={styles.notes}>
            <Text style={styles.noteTitle}>ملاحظات لغوية:</Text>

            <Text style={styles.noteText}>
                • جميع أشكال الهمزة تعتبر حرفاً واحداً
                (ء، أ، إ، آ، ؤ، ئ) تُحسب كحرف واحد «ء».
            </Text>

            <Text style={styles.noteText}>
                • لا يتم استخدام الحركات (الفتحة، الضمة، الكسرة...)
            </Text>
            </View>

          <Pressable onPress={openPrivacy}>
            <Text style={styles.privacyText}>سياسة الخصوصية</Text>
          </Pressable>
          </ScrollView>

          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>حسناً</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 17, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.charcoal,
    borderRadius: 12,
    padding: 24,
    width: '92%',
    alignItems: 'center',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  title: {
    color: COLORS.lightGrey,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    color: COLORS.lightGrey,
    fontSize: 15,
    marginBottom: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  rules: {
    width: '100%',
    backgroundColor: COLORS.grid,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    marginBottom: 16,
  },
  ruleLine: {
    color: COLORS.lightGrey,
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'right',
  },
  notes: {
    width: '100%',
    backgroundColor: COLORS.grid,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    marginBottom: 18,
  },
  noteTitle: {
    color: COLORS.lightGrey,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'right',
  },
  noteText: {
    color: COLORS.lightGrey,
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'right',
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.lightGrey,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.charcoal,
    fontSize: 16,
    fontWeight: 'bold',
  },

  privacyText: {
    color: COLORS.lightGrey,
    fontSize: 13,
    textDecorationLine: 'underline',
    marginBottom: 18,
  }
});
