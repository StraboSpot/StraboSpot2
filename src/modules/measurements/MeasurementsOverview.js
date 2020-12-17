import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {NOTEBOOK_SUBPAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {setSelectedAttributes} from '../spots/spots.slice';
import MeasurementItem from './MeasurementItem';

const MeasurementsOverview = () => {
  const dispatch = useDispatch();
  const orientationsData = useSelector(state => state.spot.selectedSpot.properties.orientation_data);

  const onMeasurementPressed = (item) => {
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(NOTEBOOK_SUBPAGES.MEASUREMENTDETAIL));
  };

  const renderMeasurementsOverviewList = () => {
    return (
      <FlatList
        data={orientationsData}
        renderItem={item => (
          <MeasurementItem item={item}
                           selectedIds={[]}
                           onPress={() => onMeasurementPressed(item.item)}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  const renderNoMeasurementsText = () => {
    return <Text style={commonStyles.noValueText}>No Measurements</Text>;
  };

  return (
    <View>
      {orientationsData ? renderMeasurementsOverviewList() : renderNoMeasurementsText()}
    </View>
  );
};

export default MeasurementsOverview;

