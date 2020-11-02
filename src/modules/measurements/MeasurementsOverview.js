import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {setSelectedAttributes} from '../spots/spots.slice';
import MeasurementItem from './MeasurementItem';

const MeasurementsOverview = () => {
  const dispatch = useDispatch();
  const orientationsData = useSelector(state => state.spot.selectedSpot.properties.orientation_data);

  const onMeasurementPressed = (item) => {
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.MEASUREMENTDETAIL));
  };

  return (
    <View>
      {orientationsData ? <FlatList
        data={orientationsData}
        renderItem={item => <MeasurementItem item={item}
                                             selectedIds={[]}
                                             onPress={() => onMeasurementPressed(item.item)}/>}
        keyExtractor={(item, index) => index.toString()}
      /> : <Text style={commonStyles.noValueText}>No Measurements</Text>}
    </View>
  );
};

export default MeasurementsOverview;

