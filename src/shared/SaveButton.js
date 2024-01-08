import React from 'react';

import {Button} from 'react-native-elements';

const SaveButton = ({
                      onPress,
                      title,
                    }) => {
  return (
    <Button
      title={title}
      type={'solid'}
      color={'red'}
      containerStyle={{alignItems: 'center', padding: 10}}
      buttonStyle={{borderRadius: 10, paddingLeft: 30, paddingRight: 30, backgroundColor: 'red'}}
      onPress={onPress}
    />
  );
};

export default SaveButton;
