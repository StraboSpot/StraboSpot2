import React, {useState} from 'react';
import {Switch, ScrollView, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {ListItem} from 'react-native-elements';
import {projectReducers} from './Project.constants';

import {isEmpty} from '../shared/Helpers';

const DatasetList = (props) => {
  const projectDatasets = useSelector(state => state.project.projectDatasets);
  const dispatch = useDispatch();

  const renderProjectDatasets = () => {
    if (!isEmpty(projectDatasets)) {
      return (
        <ScrollView>
          {projectDatasets.map((item, index) => {
            return <ListItem
              key={item.id}
              title={item.name}
              containerStyle={{padding: 5}}
              bottomDivider
              rightElement={
                <Switch
                  onValueChange={(value) => setSwitchValue(value, index)}
                  value={item.active}
                />}
            />;
          })}
        </ScrollView>);
    }
  };

  const setSwitchValue = (val, ind) => {
    const tempData = JSON.parse(JSON.stringify(projectDatasets));
    tempData[ind].active = val;
    dispatch({type: projectReducers.DATASETS.PROJECT_DATASETS, datasets: tempData});
  };

  return (
    <View style={{flex: 1}}>
      {renderProjectDatasets()}
    </View>
  );
};

export default DatasetList;
