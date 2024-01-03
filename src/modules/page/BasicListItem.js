import React from 'react';

import {ListItem} from 'react-native-elements';

import {PAGE_KEYS} from './page.constants';
import commonStyles from '../../shared/common.styles';
import {useFormHook} from '../form';
import usePetrologyHook from '../petrology/usePetrology';
import useSedHook from '../sed/useSed';

const BasicListItem = (props) => {
  const usePetrology = usePetrologyHook();
  const useSed = useSedHook();
  const useForm = useFormHook();

  const getTitle = () => {
    switch (props.page.key) {
      case PAGE_KEYS.MINERALS:
        return usePetrology.getMineralTitle(props.item);
      case PAGE_KEYS.REACTIONS:
        return usePetrology.getReactionTextureTitle(props.item);
      case PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE:
      case PAGE_KEYS.ROCK_TYPE_IGNEOUS:
      case PAGE_KEYS.ROCK_TYPE_METAMORPHIC:
      case PAGE_KEYS.ROCK_TYPE_FAULT:
        return usePetrology.getRockTitle(props.item, props.page.key);
      case PAGE_KEYS.ROCK_TYPE_SEDIMENTARY:
        return useSed.getRockTitle(props.item);
      case PAGE_KEYS.LITHOLOGIES:
        return 'Lithology ' + (props.index + 1) + ': ' + useSed.getRockTitle(props.item);
      case PAGE_KEYS.STRAT_SECTION:
        return useSed.getStratSectionTitle(props.item);
      case PAGE_KEYS.BEDDING:
        return 'Lithology ' + (props.index + 1) + ': ' + useSed.getBeddingTitle(props.item);
      case PAGE_KEYS.STRUCTURES:
      case PAGE_KEYS.DIAGENESIS:
      case PAGE_KEYS.FOSSILS:
      case PAGE_KEYS.INTERPRETATIONS:
        return 'Lithology ' + (props.index + 1);
      case PAGE_KEYS.TEPHRA:
        return props.item?.layer_type ? useForm.getLabel(props.item.layer_type, ['tephra', 'interval_description'])
          : 'Unknown';
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
