import React from 'react';
import {View} from 'react-native';

import {Button, Icon} from 'react-native-elements';

import SectionDivider from './SectionDivider';
import styles from '../../shared/ui/ui.styles';
import commonStyles from '../common.styles';
import {PRIMARY_ACCENT_COLOR} from '../styles.constants';

const SectionDividerWithRightButton = ({buttonTitle, disabled, dividerText, iconName, iconType, iconSize, onPress}) => {
  return (
    <View style={styles.sectionDividerWithButtonContainer}>
      <SectionDivider dividerText={dividerText}/>
      <Button
        title={buttonTitle}
        icon={!buttonTitle
          && (
            <Icon name={iconName || 'add'}
                  style={{paddingRight: 10, paddingLeft: 10}}
                  size={ iconSize || 30}
                  color={PRIMARY_ACCENT_COLOR}
                  type={iconType}
            />)
        }
        titleStyle={commonStyles.standardButtonText}
        type={'clear'}
        onPress={onPress}
        disabled={disabled}
      />
    </View>
  );
};

export default SectionDividerWithRightButton;
