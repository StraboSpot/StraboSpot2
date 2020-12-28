import React, {useState} from 'react';
import {FlatList, View, Text} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {LABEL_DICTIONARY} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import ThreeDStructureDetail from './ThreeDStructureDetail';

const ThreeDStructuresPage = (props) => {
  const dispatch = useDispatch();

  const spot = useSelector(state => state.spot.selectedSpot);

  const [selected3dStructure, setSelected3dStructure] = useState({});
  const [isDetailView, setIsDetailView] = useState(false);

  const threeDStructuresDictionary = Object.values(LABEL_DICTIONARY._3d_structures).reduce(
    (acc, form) => ({...acc, ...form}), {});

  const add3dStructure = (type) => {
    const new3dStructure = {id: getNewId(), type: type};
    setSelected3dStructure(new3dStructure);
    setIsDetailView(true);
  };

  const edit3dStructure = (threeDStructure) => {
    setSelected3dStructure(threeDStructure);
    setIsDetailView(true);
  };

  const getLabel = (key) => {
    if (Array.isArray(key)) {
      const labelsArr = key.map(val => threeDStructuresDictionary[val] || val);
      return labelsArr.join(', ');
    }
    return threeDStructuresDictionary[key] || key;
  };

  const get3dStructureTitle = (threeDStructure) => {
    return threeDStructure.label || getLabel(threeDStructure.feature_type) || getLabel(threeDStructure.type) || '';
  };

  const render3dStructure = (threeDStructure) => {
    const threeDStructureTitle = get3dStructureTitle(threeDStructure);
    const threeDStructureFieldsText = Object.entries(threeDStructure).reduce((acc, [key, value]) => {
      return key === 'id' ? acc : (acc === '' ? '' : acc + '\n') + getLabel(key) + ': ' + getLabel(value);
    }, '');
    return (
      <ListItem key={threeDStructure.id}
                onPress={() => edit3dStructure(threeDStructure)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title>{threeDStructureTitle}</ListItem.Title>
          {threeDStructureFieldsText !== '' && (
            <ListItem.Subtitle
              style={{color: themes.PRIMARY_ITEM_TEXT_COLOR}}>{threeDStructureFieldsText}</ListItem.Subtitle>
          )}
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {!isDetailView && (
        <View style={{flex: 1}}>
          <ReturnToOverviewButton
            onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
          />
          <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
            <Button
              title={'+ Add Fabric'}
              type={'clear'}
              onPress={() => add3dStructure('fabric')}
            />
            <Button
              title={'+ Add Fold'}
              type={'clear'}
              onPress={() => add3dStructure('fold')}
            />
            <Button
              title={'+ Add Tensor'}
              type={'clear'}
              onPress={() => add3dStructure('tensor')}
            />
            <Button
              title={'+ Add Other'}
              type={'clear'}
              onPress={() => add3dStructure('other')}
            />
          </View>
          {!spot.properties._3d_structures && (
            <View style={{padding: 10}}>
              <Text>There are no 3D Structures at this Spot.</Text>
            </View>
          )}
          {spot.properties._3d_structures && (
            <FlatList
              data={spot.properties._3d_structures.slice().sort(
                (a, b) => get3dStructureTitle(a).localeCompare(get3dStructureTitle(b)))}
              renderItem={item => render3dStructure(item.item)}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => <View style={{borderTopWidth: 1}}/>}
            />
          )}
        </View>
      )}
      {isDetailView && (
        <ThreeDStructureDetail
          show3dStructuresOverview={() => setIsDetailView(false)}
          selected3dStructure={selected3dStructure}
        />)}
    </React.Fragment>
  );
};

export default ThreeDStructuresPage;
