import React from 'react';

import {Button} from 'react-native-elements';

import {PRIMARY_TEXT_COLOR, SECONDARY_BACKGROUND_COLOR} from '../../../shared/styles.constants';
import homeStyles from '../home.style';

const EditCancelSaveButtons = ({clickHandler}) => {
  return (
    <>
      <Button
        containerStyle={{alignContent: 'center'}}
        buttonStyle={homeStyles.drawToolsButtons}
        titleStyle={homeStyles.drawToolsTitle}
        type={'clear'}
        title={'Save Edits'}
        onPress={() => clickHandler('saveEdits')}
      />
      <Button
        containerStyle={{alignContent: 'center', paddingTop: 5}}
        buttonStyle={{...homeStyles.drawToolsButtons, backgroundColor: SECONDARY_BACKGROUND_COLOR}}
        titleStyle={{...homeStyles.drawToolsTitle, color: PRIMARY_TEXT_COLOR}}
        type={'clear'}
        title={'Cancel'}
        onPress={() => clickHandler('cancelEdits')}
      />
    </>
  );
};

export default EditCancelSaveButtons;
