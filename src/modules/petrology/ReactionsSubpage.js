import React, {useState} from 'react';
import {FlatList, View, Text} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {LABEL_DICTIONARY} from '../form';
import MineralReactionDetail from './MineralReactionDetail';
import {REACTION_VIEW} from './petrology.constants';

const ReactionsSubpage = (props) => {
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedReaction, setSelectedReaction] = useState({});
  const [reactionView, setReactionView] = useState(REACTION_VIEW.OVERVIEW);

  const petDictionary = Object.values(LABEL_DICTIONARY.pet).reduce((acc, form) => ({...acc, ...form}), {});

  const addReaction = (reaction) => {
    const newReaction = {id: getNewId()};
    if (reaction && reaction.Label) newReaction.full_reaction_name = reaction.Label;
    if (reaction && !isEmpty(reaction.Abbreviation)) newReaction.reaction_abbrev = reaction.Abbreviation.split(',')[0];
    setSelectedReaction(newReaction);
    setReactionView(REACTION_VIEW.DETAIL);
  };

  const editReaction = (reaction) => {
    setSelectedReaction(reaction);
    setReactionView(REACTION_VIEW.DETAIL);
  };

  const getLabel = (key) => {
    if (Array.isArray(key)) {
      const labelsArr = key.map(val => petDictionary[val] || val);
      return labelsArr.join(', ');
    }
    return petDictionary[key] || key;
  };

  const renderReaction = (reaction) => {
    const reactionFieldsText = Object.entries(reaction).reduce((acc, [key, value]) => {
      return (key === 'id' || key === 'reactions')
        ? acc
        : (acc === '' ? '' : acc + '\n') + getLabel(key) + ': ' + getLabel(value);
    }, '');
    return (
      <ListItem key={reaction.id}
                onPress={() => editReaction(reaction)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title>{reaction.reactions}</ListItem.Title>
          <ListItem.Subtitle style={{color: themes.PRIMARY_ITEM_TEXT_COLOR}}>{reactionFieldsText}</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {reactionView === REACTION_VIEW.OVERVIEW && (
        <View>
          <Button
            title={'+ Add a Reaction'}
            type={'clear'}
            onPress={addReaction}
          />
          {(!spot.properties.pet || !spot.properties.pet.reactions) && (
            <View style={{padding: 10}}>
              <Text>There are no reactions at this Spot.</Text>
            </View>
          )}
          {spot.properties.pet && spot.properties.pet.reactions && (
            <FlatList
              data={spot.properties.pet.reactions.slice().sort((a, b) => a.reactions.localeCompare(b.reactions))}
              renderItem={item => renderReaction(item.item)}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => <View style={{borderTopWidth: 1}}/>}
            />
          )}
        </View>
      )}
      {reactionView === REACTION_VIEW.DETAIL && (
        <MineralReactionDetail
          type={'reactions'}
          showMineralsReactionsOverview={() => setReactionView(REACTION_VIEW.OVERVIEW)}
          selectedMineralReaction={selectedReaction}
        />)}
    </React.Fragment>
  );
};

export default ReactionsSubpage;
