import React, {useState} from 'react';

import {ButtonGroup} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {setModalVisible} from '../../modules/home/home.slice';
import {PRIMARY_ACCENT_COLOR} from '../styles.constants';

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
      containerStyle={{height: 40, borderRadius: 10, marginTop: 10, marginBottom: 10}}
      onPress={onPress}
      selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
      selectedIndex={selectedIndex}
      textStyle={{color: PRIMARY_ACCENT_COLOR}}
    />
  );
};

export default SaveAndCloseModalButtons;
