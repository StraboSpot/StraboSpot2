import React, {useState} from 'react';

import {ButtonGroup} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {setModalVisible} from '../../modules/home/home.slice';
import {POSITIVE_COLOR} from '../styles.constants';

const SaveAndCloseModalButtons = ({
                                    saveAction,
                                  }) => {
  const dispatch = useDispatch();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onPress = async (value) => {
    setSelectedIndex(value);
    await saveAction();
    if (value === 1) dispatch(setModalVisible({modal: null}));
  };

  return (
    <ButtonGroup
      buttons={['Save', 'Save and Close']}
      selectedIndex={selectedIndex}
      onPress={onPress}
      textStyle={{color: POSITIVE_COLOR}}
      containerStyle={{height: 40, borderRadius: 10, marginTop: 10, marginBottom: 10}}
      buttonStyle={{padding: 5}}
      selectedButtonStyle={{backgroundColor: POSITIVE_COLOR}}
      disabledSelectedStyle={{type: 'outline', borderColor: POSITIVE_COLOR, backgroundColor: 'pink'}}
      disabledSelectedTextStyle={{type: 'outline', borderColor: POSITIVE_COLOR, backgroundColor: 'yellow'}}
      disabledStyle={{type: 'outline', borderColor: POSITIVE_COLOR, backgroundColor: 'blue'}}
    />
  );
};

export default SaveAndCloseModalButtons;
