import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {PAGE_KEYS} from '../page/page.constants';
import usePetrologyHook from './usePetrology';

const BasicPetListItem = (props) => {
  const usePetrology = usePetrologyHook();

  const title = props.page.key === PAGE_KEYS.MINERALS ? usePetrology.getMineralTitle(props.item)
    : PAGE_KEYS.REACTIONS ? usePetrology.getReactionTextureTitle(props.item)
      : 'Unknown';

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={props.item.id}
      onPress={() => props.editItem(props.item)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{title}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
};

export default BasicPetListItem;
