import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {useDispatch} from 'react-redux';

import Modal from '../../shared/ui/modal/Modal';
import SaveButton from '../../shared/ui/SaveButton';
import {setModalVisible} from '../home/home.slice';

const ReportModal = () => {
  const dispatch = useDispatch();

  const saveReport = async () => {
    try {
      console.log('Finished saving report data');
      dispatch(setModalVisible({modal: null}));
    }
    catch (e) {
      console.log('Error saving report data', e);
    }
  };

  return (
    <Modal
      title={'Create New Report'}
      buttonTitleRight={'Close'}
    >
      <Text>REPORT TOP BUTTONS</Text>
      <FlatList
        bounces={false}
        ListHeaderComponent={
          <View style={{flex: 1}}>
            <Text>REPORT BODY</Text>
          </View>
        }
      />
      <SaveButton title={'Save Report'} onPress={saveReport}/>
    </Modal>
  );
};

export default ReportModal;
