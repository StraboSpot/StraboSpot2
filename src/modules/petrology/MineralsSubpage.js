import React, {useEffect, useState} from 'react';
import {FlatList, View, Text} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {LABEL_DICTIONARY} from '../form';
import MineralReactionDetail from './MineralReactionDetail';
import MineralsByRockClass from './MineralsByRockClass';
import MineralsGlossary from './MineralsGlossary';
import {MINERAL_VIEW} from './petrology.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import commonStyles from '../../shared/common.styles';

const MineralsSubpage = (props) => {
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedMineral, setSelectedMineral] = useState({});
  const [mineralView, setMineralView] = useState(MINERAL_VIEW.OVERVIEW);

  const petDictionary = Object.values(LABEL_DICTIONARY.pet).reduce((acc, form) => ({...acc, ...form}), {});

  useEffect(() => {
    console.log('UE MineralsSubpage: spot changed to', spot);
    setSelectedMineral({});
  }, [spot]);

  const addMineral = (mineral) => {
    const newMineral = {id: getNewId()};
    if (mineral && mineral.Label) newMineral.full_mineral_name = mineral.Label;
    if (mineral && !isEmpty(mineral.Abbreviation)) newMineral.mineral_abbrev = mineral.Abbreviation.split(',')[0];
    setSelectedMineral(newMineral);
    setMineralView(MINERAL_VIEW.DETAIL);
  };

  const editMineral = (mineral) => {
    setSelectedMineral(mineral);
    setMineralView(MINERAL_VIEW.DETAIL);
  };

  const getLabel = (key) => {
    if (Array.isArray(key)) {
      const labelsArr = key.map(val => petDictionary[val] || val);
      return labelsArr.join(', ');
    }
    return petDictionary[key] || key;
  };

  const getMineralTitle = (mineral) => {
    return mineral.full_mineral_name || mineral.mineral_abbrev || 'Unknown';
  };

  const renderMineral = (mineral) => {
    const mineralTitle = getMineralTitle(mineral);
    const mineralFieldsText = Object.entries(mineral).reduce((acc, [key, value]) => {
      return key === 'id' ? acc : (acc === '' ? '' : acc + '\n') + getLabel(key) + ': ' + getLabel(value);
    }, '');
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={mineral.id}
        onPress={() => editMineral(mineral)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{mineralTitle}</ListItem.Title>
          {mineralFieldsText !== '' && (<ListItem.Subtitle>{mineralFieldsText}</ListItem.Subtitle>)}
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {mineralView === MINERAL_VIEW.OVERVIEW && (
        <View style={{flex: 1}}>
          <Button
            title={'+ Add Mineral'}
            type={'clear'}
            onPress={addMineral}
          />
          <Button
            title={'+ Add a Mineral By Rock Class'}
            type={'clear'}
            onPress={() => setMineralView(MINERAL_VIEW.ROCK_CLASS)}
          />
          <Button
            title={'+ Add a Mineral By Glossary'}
            type={'clear'}
            onPress={() => setMineralView(MINERAL_VIEW.GLOSSARY)}
          />
          <FlatList
            data={spot.properties.pet && spot.properties.pet.minerals && spot.properties.pet.minerals.slice().sort(
              (a, b) => getMineralTitle(a).localeCompare(getMineralTitle(b)))}
            renderItem={item => renderMineral(item.item)}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'There are no minerals at this Spot.'}/>}
          />
        </View>
      )}
      {mineralView === MINERAL_VIEW.DETAIL && (
        <MineralReactionDetail
          type={'minerals'}
          showMineralsReactionsOverview={() => setMineralView(MINERAL_VIEW.OVERVIEW)}
          selectedMineralReaction={selectedMineral}
        />)}
      {mineralView === MINERAL_VIEW.ROCK_CLASS && (
        <MineralsByRockClass
          showMineralsOverview={() => setMineralView(MINERAL_VIEW.OVERVIEW)}
          addMineral={(mineral) => addMineral(mineral)}
        />)}
      {mineralView === MINERAL_VIEW.GLOSSARY && (
        <MineralsGlossary
          showMineralsOverview={() => setMineralView(MINERAL_VIEW.OVERVIEW)}
          addMineral={(mineral) => addMineral(mineral)}
        />)}
    </React.Fragment>
  );
};

export default MineralsSubpage;
