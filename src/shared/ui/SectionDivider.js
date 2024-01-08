import React from 'react';
import {Text, View} from 'react-native';

import styles from '../../shared/ui/ui.styles';

const SectionDivider = ({
                          dividerText,
                          style,
                        }) => {
  return (
    <View style={[styles.sectionDivider, style]}>
      <Text style={styles.sectionDividerText}>{dividerText.toUpperCase()}</Text>
    </View>
  );
};

export default SectionDivider;
