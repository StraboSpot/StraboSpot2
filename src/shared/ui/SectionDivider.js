import React from 'react';
import {Text, View} from 'react-native';

import styles from '../../shared/ui/ui.styles';

const SectionDivider = ({
                          dividerText,
                          style,
                          textStyle,
                        }) => {
  return (
    <View style={[styles.sectionDivider, style]}>
      <Text style={[styles.sectionDividerText, textStyle]}>{dividerText.toUpperCase()}</Text>
    </View>
  );
};

export default SectionDivider;
