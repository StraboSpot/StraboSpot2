import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import usePetrologyHook from '../petrology/usePetrology';
import useSedHook from '../sed/useSed';
import {PAGE_KEYS} from './page.constants';

const BasicListItem = (props) => {
  const usePetrology = usePetrologyHook();
  const useSed = useSedHook();

  const getTitle = () => {
    switch (props.page.key) {
      case PAGE_KEYS.MINERALS:
        return usePetrology.getMineralTitle(props.item);
      case PAGE_KEYS.REACTIONS:
        return usePetrology.getReactionTextureTitle(props.item);
      case PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE:
      case PAGE_KEYS.ROCK_TYPE_IGNEOUS:
      case PAGE_KEYS.ROCK_TYPE_METAMORPHIC:
        return usePetrology.getRockTitle(props.item, props.page.key);
      case PAGE_KEYS.ROCK_TYPE_SEDIMENTARY:
        return useSed.getRockTitle(props.item);
      default:
        return 'Unknown';
    }
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={props.item.id}
      onPress={() => props.editItem(props.item)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{getTitle()}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
};

export default BasicListItem;
