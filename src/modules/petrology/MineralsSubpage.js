import React, {useState} from 'react';
import {Alert, FlatList, View, Text} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {isEmpty, getNewId} from '../../shared/Helpers';
import styles from '../measurements/measurements.styles';
import MineralDetail from './MineralDetail';

const MineralsSubpage = (props) => {
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isMineralDetailVisible, setIsMineralDetailVisible] = useState(false);
  const [selectedMineral, setSelectedMineral] = useState({});

  const addMineral = () => {
    setSelectedMineral({id: getNewId()});
    setIsMineralDetailVisible(true);
  };

  const editMineral = (mineral) => {
    setSelectedMineral(mineral);
    setIsMineralDetailVisible(true);
  };

  const getMineralName = (mineral) => {
    let names = [];
    if (isEmpty(names)) {
      const name = mineral.full_mineral_name || mineral.mineral_abbrev;
      names.push(name);
    }
    return names.join(', ') || 'Unknown';
  };

  const renderMineral = (mineral) => {
    console.log('mineral', mineral);
    return (
      <ListItem key={mineral.id}
                onPress={() => editMineral(mineral)}
      >
        <ListItem.Content>
          <ListItem.Title>{getMineralName(mineral)}</ListItem.Title>
          <ListItem.Subtitle>
            <FlatList
              data={Object.entries(mineral)}
              renderItem={item => renderMineralField(item.item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderMineralField = ([key, value]) => {
    return (
      <React.Fragment>
        {key !== 'id' && <Text>{key}: {value}</Text>}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {!isMineralDetailVisible && (
        <View>
          <Button
            titleStyle={styles.buttonText}
            title={'+ Add Mineral'}
            type={'clear'}
            onPress={addMineral}
          />
          <Button
            titleStyle={styles.buttonText}
            title={'+ Add a Mineral By Rock Class'}
            type={'clear'}
            onPress={() => Alert.alert('Not implemented yet.')}
          />
          <Button
            titleStyle={styles.buttonText}
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
