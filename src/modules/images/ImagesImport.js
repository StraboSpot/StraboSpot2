import React from 'react';
import {Text, View} from 'react-native';

import {Icon} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import ButtonRounded from '../../shared/ui/ButtonRounded';
import {imageStyles} from './index';

const ImagesImport = (props) => {
  return (
    <React.Fragment>
      <ButtonRounded
        icon={
          <Icon
            name={'images-outline'}
            type={'ionicon'}
            iconStyle={imageStyles.icon}
            color={commonStyles.iconColor.color}/>
        }
        title={'Import'}
        titleStyle={commonStyles.standardButtonText}
        buttonStyle={imageStyles.buttonContainer}
        type={'outline'}
        onPress={() => props.handleGetImages()}
      />
    </React.Fragment>
  );
};

export default ImagesImport;
