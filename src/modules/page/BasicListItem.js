import React from 'react';

import {ListItem} from 'react-native-elements';

import {PAGE_KEYS} from './page.constants';
import commonStyles from '../../shared/common.styles';
import {useFormHook} from '../form';
import usePetrologyHook from '../petrology/usePetrology';
import useSedHook from '../sed/useSed';

const BasicListItem = ({
                         editItem,
                         index,
                         item,
                         page,
                       }) => {
  const usePetrology = usePetrologyHook();
  const useSed = useSedHook();
  const useForm = useFormHook();

  const getTitle = () => {
    switch (page.key) {
      case PAGE_KEYS.MINERALS:
        return usePetrology.getMineralTitle(item);
      case PAGE_KEYS.REACTIONS:
        return usePetrology.getReactionTextureTitle(item);
      case PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE:
      case PAGE_KEYS.ROCK_TYPE_IGNEOUS:
      case PAGE_KEYS.ROCK_TYPE_METAMORPHIC:
      case PAGE_KEYS.ROCK_TYPE_FAULT:
        return usePetrology.getRockTitle(item, page.key);
      case PAGE_KEYS.ROCK_TYPE_SEDIMENTARY:
        return useSed.getRockTitle(item);
      case PAGE_KEYS.LITHOLOGIES:
        return 'Lithology ' + (index + 1) + ': ' + useSed.getRockTitle(item);
      case PAGE_KEYS.STRAT_SECTION:
        return useSed.getStratSectionTitle(item);
      case PAGE_KEYS.BEDDING:
        return 'Lithology ' + (index + 1) + ': ' + useSed.getBeddingTitle(item);
      case PAGE_KEYS.STRUCTURES:
      case PAGE_KEYS.DIAGENESIS:
      case PAGE_KEYS.FOSSILS:
      case PAGE_KEYS.INTERPRETATIONS:
        return 'Lithology ' + (index + 1);
      case PAGE_KEYS.TEPHRA:
        return useForm.getLabel(item?.layer_type, [PAGE_KEYS.TEPHRA, 'interval_description']);
      case PAGE_KEYS.EARTHQUAKES:
        return useForm.getLabel(item?.earthquake_feature, ['general', PAGE_KEYS.EARTHQUAKES]);
      default:
        return 'Unknown';
    }
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={item.id}
      onPress={() => editItem(item)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{getTitle()}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
};

export default BasicListItem;
