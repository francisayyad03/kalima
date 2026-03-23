import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/colors';

interface HomeSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRIVACY_URL = 'https://francisayyad03.github.io/kalimaPrivacy/';

export function HomeSettingsModal({ visible, onClose }: HomeSettingsModalProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const modalMaxHeight = height - insets.top - insets.bottom - 24;

  const openPrivacy = () => {
    void Linking.openURL(PRIVACY_URL);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
        <View style={[styles.modal, { maxHeight: modalMaxHeight }]}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>الإعدادات</Text>

            <Pressable style={styles.actionRow} onPress={openPrivacy}>
              <Text style={styles.actionTitle}>سياسة الخصوصية</Text>
              <Text style={styles.actionMeta}>فتح الرابط</Text>
            </Pressable>

            <View style={styles.placeholderRow}>
              <Text style={styles.actionTitle}>إعدادات الإشعارات</Text>
              <Text style={styles.placeholderMeta}>قريباً</Text>
            </View>

            <View style={styles.placeholderRow}>
              <Text style={styles.actionTitle}>الصوت والاهتزاز</Text>
              <Text style={styles.placeholderMeta}>قريباً</Text>
            </View>

            <View style={styles.placeholderRow}>
              <Text style={styles.actionTitle}>خيارات العرض</Text>
              <Text style={styles.placeholderMeta}>قريباً</Text>
            </View>
          </ScrollView>

          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>إغلاق</Text>
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
    width: '100%',
    paddingBottom: 8,
  },
  title: {
    color: COLORS.lightGrey,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  actionRow: {
    width: '100%',
    backgroundColor: COLORS.grid,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    marginBottom: 12,
  },
  placeholderRow: {
    width: '100%',
    backgroundColor: 'rgba(65, 65, 64, 0.55)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    marginBottom: 12,
  },
  actionTitle: {
    color: COLORS.lightGrey,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 4,
  },
  actionMeta: {
    color: COLORS.green,
    fontSize: 13,
    textAlign: 'right',
  },
  placeholderMeta: {
    color: 'rgba(217, 217, 217, 0.64)',
    fontSize: 13,
    textAlign: 'right',
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
});
