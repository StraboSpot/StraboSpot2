import React, {useState} from 'react';
import {Alert, FlatList, View, Text} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {getNewId} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {LABEL_DICTIONARY} from '../form';
import MineralDetail from './MineralDetail';

const MineralsSubpage = (props) => {
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isMineralDetailVisible, setIsMineralDetailVisible] = useState(false);
  const [selectedMineral, setSelectedMineral] = useState({});

  const petDictionary = Object.values(LABEL_DICTIONARY.pet).reduce((acc, form) => ({...acc, ...form}), {});

  const addMineral = () => {
    setSelectedMineral({id: getNewId()});
    setIsMineralDetailVisible(true);
  };

  const editMineral = (mineral) => {
    setSelectedMineral(mineral);
    setIsMineralDetailVisible(true);
  };

  const getLabel = (key) => {
    if (Array.isArray(key)) {
      const labelsArr = key.map(val => petDictionary[val] || val);
      return labelsArr.join(', ');
    }
    return petDictionary[key] || key;
  };

  const renderMineral = (mineral) => {
    const mineralTitle = mineral.full_mineral_name || mineral.mineral_abbrev || 'Unknown';
    const mineralFieldsText = Object.entries(mineral).reduce((acc, [key, value]) => {
      return key === 'id' ? acc : (acc === '' ? '' : acc + '\n') + getLabel(key) + ': ' + getLabel(value);
    }, '');
    return (
      <ListItem key={mineral.id}
                onPress={() => editMineral(mineral)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title>{mineralTitle}</ListItem.Title>
          <ListItem.Subtitle style={{color: themes.PRIMARY_ITEM_TEXT_COLOR}}>{mineralFieldsText}</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {!isMineralDetailVisible && (
        <View>
          <Button
            title={'+ Add Mineral'}
            type={'clear'}
            onPress={addMineral}
          />
          <Button
            title={'+ Add a Mineral By Rock Class'}
            type={'clear'}
            onPress={() => Alert.alert('Not implemented yet.')}
          />
          <Button
            title={'+ Add a Mineral By Glossary'}
            type={'clear'}
            onPress={() => Alert.alert('Not implemented yet.')}
          />
          {(!spot.properties.pet || !spot.properties.pet.minerals) && (
            <View style={{padding: 10}}>
              <Text>There are no minerals at this Spot.</Text>
            </View>
          )}
          {spot.properties.pet && spot.properties.pet.minerals && (
            <FlatList
              data={spot.properties.pet.minerals}
              renderItem={item => renderMineral(item.item)}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => <View style={{borderTopWidth: 1}}/>}
            />
          )}
        </View>
      )}
      {isMineralDetailVisible && (
        <MineralDetail
          hideMineralDetail={() => setIsMineralDetailVisible(false)}
          selectedMineral={selectedMineral}
        />)}
    </React.Fragment>
  );
};

export default MineralsSubpage;
