import React from 'react';
import {View} from 'react-native';

import {useDispatch} from 'react-redux';

import {ReportsList} from '.';
import AddButton from '../../shared/ui/AddButton';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {MODAL_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';

const ReportsPage = ({}) => {
  console.log('Rendering ReportsPage...');

  const dispatch = useDispatch();

  const addReport = () => {
    dispatch(setModalValues({}));
    dispatch(setModalVisible({modal: MODAL_KEYS.NOTEBOOK.REPORTS}));
  };

  return (
    <View style={{flex: 1}}>
      <ReturnToOverviewButton/>
      <AddButton
        onPress={addReport}
        title={'Create New Report'}
        type={'outline'}
      />
      <ReportsList/>
    </View>
  );
};

export default ReportsPage;
