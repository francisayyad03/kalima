import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/colors';

interface HomeInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function HomeInfoModal({ visible, onClose }: HomeInfoModalProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const modalMaxHeight = height - insets.top - insets.bottom - 24;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
        <View style={[styles.modal, { maxHeight: modalMaxHeight }]}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
            <Text style={styles.title}>عن كلمة</Text>

            <Text style={styles.body}>
              كلمة هي واجهة ألعاب كلمات عربية. من الشاشة الرئيسية يمكنك التنقل بين أوضاع اللعب المختلفة وفتح الوضع الذي تريده.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الأوضاع الحالية</Text>
              <Text style={styles.sectionText}>الكلمة اليومية: لغز يومي جديد بخمس خانات.</Text>
              <Text style={styles.sectionText}>الأرشيف: وضع قادم لاسترجاع الألغاز السابقة.</Text>
              <Text style={styles.sectionText}>الوضع الصعب: وضع قادم بقواعد أكثر صرامة.</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>كيفية الاستخدام</Text>
              <Text style={styles.sectionText}>اسحب يميناً ويساراً للتنقل بين الأوضاع.</Text>
              <Text style={styles.sectionText}>اضغط على البطاقة الجانبية لتبديل الوضع المعروض في المنتصف.</Text>
              <Text style={styles.sectionText}>اضغط على زر ابدأ اللعب للدخول إلى الوضع المتاح حالياً.</Text>
            </View>
          </ScrollView>

          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>موافق</Text>
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
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  section: {
    width: '100%',
    backgroundColor: COLORS.grid,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.lightGrey,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sectionText: {
    color: COLORS.lightGrey,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
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
