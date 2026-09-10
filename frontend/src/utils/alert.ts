import { Alert, Platform } from 'react-native';

export const showCrossPlatformAlert = (
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    if (onConfirm) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'OK', onPress: onConfirm }
    ]);
  }
};
