import React, {useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {LABEL_DICTIONARY} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import FabricDetail from './FabricDetail';

const FabricsPage = (props) => {
  const dispatch = useDispatch();

  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedFabric, setSelectedFabric] = useState({});
  const [isDetailView, setIsDetailView] = useState(false);

  const fabricsDictionary = Object.values(LABEL_DICTIONARY.fabrics).reduce(
    (acc, form) => ({...acc, ...form}), {});

  useEffect(() => {
    console.log('UE FabricsPage: spot changed to', spot);
    setSelectedFabric({});
  }, [spot]);

  const addFabric = (type) => {
    const newFabric = {id: getNewId(), type: type};
    setSelectedFabric(newFabric);
    setIsDetailView(true);
  };

  const editFabric = (fabric) => {
    setSelectedFabric(fabric);
    setIsDetailView(true);
  };

  const getLabel = (key) => {
    if (Array.isArray(key)) {
      const labelsArr = key.map(val => fabricsDictionary[val] || val);
      return labelsArr.join(', ');
    }
    return fabricsDictionary[key] || key.replace('_', ' ');
  };

  const getFabricTitle = (fabric) => {
    return fabric.label || getLabel(fabric.type) || '';
  };

  const renderFabric = (fabric) => {
    const fabricTitle = getFabricTitle(fabric);
    const fabricFieldsText = Object.entries(fabric).reduce((acc, [key, value]) => {
      return key === 'id' ? acc : (acc === '' ? '' : acc + '\n') + getLabel(key) + ': ' + getLabel(value);
    }, '');
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={fabric.id}
        onPress={() => editFabric(fabric)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{fabricTitle}</ListItem.Title>
          {fabricFieldsText !== '' && (
            <ListItem.Subtitle>{fabricFieldsText}</ListItem.Subtitle>
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
              title={'+ Add a Fault Rock Fabric'}
              type={'clear'}
              onPress={() => addFabric('fault_rock')}
            />
            <Button
              title={'+ Add an Igneous Fabric'}
              type={'clear'}
              onPress={() => addFabric('igneous_rock')}
            />
            <Button
              title={'+ Add a Metamorphic Fabric'}
              type={'clear'}
              onPress={() => addFabric('metamorphic_rock')}
            />
          </View>
          <FlatList
            data={spot.properties && spot.properties.fabrics && spot.properties.fabrics.slice().sort(
              (a, b) => getFabricTitle(a).localeCompare(getFabricTitle(b)))}
            renderItem={({item}) => renderFabric(item)}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'There are no Fabrics at this Spot.'}/>}
          />
        </View>
      )}
      {isDetailView && (
        <FabricDetail
          showFabricsOverview={() => setIsDetailView(false)}
          selectedFabric={selectedFabric}
        />)}
    </React.Fragment>
  );
};

export default FabricsPage;
