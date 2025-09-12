import React from 'react';
import { View, Platform } from 'react-native';

const WebSafeView = ({ children, style }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[{ minHeight: '100vh', position: 'relative' }, style]}>
        {children}
      </View>
    );
  }
  
  return (
    <View style={style}>
      {children}
    </View>
  );
};

export default WebSafeView;