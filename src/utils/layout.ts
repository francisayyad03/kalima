import { I18nManager, type FlexStyle } from 'react-native';

export const ltrRow: FlexStyle['flexDirection'] = I18nManager.isRTL ? 'row-reverse' : 'row';
export const rtlRow: FlexStyle['flexDirection'] = I18nManager.isRTL ? 'row' : 'row-reverse';
