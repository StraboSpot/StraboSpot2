import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import homeStyles from '../home.style';

const EditCancelSaveButtons = ({clickHandler}) => {
  return (
    <View style={homeStyles.editButtonsContainer}>
      <Button
        containerStyle={{padding: 5}}
        buttonStyle={homeStyles.drawToolsButtons}
        titleStyle={homeStyles.drawToolsTitle}
        type={'clear'}
        title={'Save Edits'}
        onPress={() => clickHandler('saveEdits')}
      />
      <Button
        containerStyle={{padding: 5}}
        buttonStyle={[homeStyles.drawToolsButtons, {backgroundColor: 'white'}]}
        titleStyle={[homeStyles.drawToolsTitle, {color: 'black'}]}
        type={'clear'}
        title={'Cancel'}
        onPress={() => clickHandler('cancelEdits')}
      />
    </View>
  );
};

export default EditCancelSaveButtons;
