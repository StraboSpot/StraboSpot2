import React from 'react';

import {Button} from 'react-native-elements';
import {PRIMARY_ACCENT_COLOR} from '../styles.constants';

const SaveButton = ({
                      onPress,
                      title,
                    }) => {
  return (
    <Button
      title={title}
      type={'clear'}
      // containerStyle={{alignItems: 'center', padding: 10}}
      // buttonStyle={{borderRadius: 10, marginTop: 10, marginBottom: 10, backgroundColor: PRIMARY_ACCENT_COLOR}}
      onPress={onPress}
    />
  );
};

export default SaveButton;
