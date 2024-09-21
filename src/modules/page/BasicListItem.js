import React from 'react';

import {Icon, ListItem} from 'react-native-elements';

import {PAGE_KEYS} from './page.constants';
import commonStyles from '../../shared/common.styles';
import {MEDIUMGREY} from '../../shared/styles.constants';
import {useForm} from '../form';
import usePetrologyHook from '../petrology/usePetrology';
import useSed from '../sed/useSed';

const BasicListItem = ({
                         drag,
                         editItem,
                         index,
                         isReorderingActive,
                         item,
                         page,
                       }) => {
  const usePetrology = usePetrologyHook();
  const {getBeddingTitle, getRockTitle, getStratSectionTitle} = useSed();
  const {getLabel} = useForm();

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
        return getRockTitle(item);
      case PAGE_KEYS.LITHOLOGIES:
        return 'Lithology ' + (index + 1) + ': ' + getRockTitle(item);
      case PAGE_KEYS.STRAT_SECTION:
        return getStratSectionTitle(item);
      case PAGE_KEYS.BEDDING:
        return 'Lithology ' + (index + 1) + ': ' + getBeddingTitle(item);
      case PAGE_KEYS.STRUCTURES:
      case PAGE_KEYS.DIAGENESIS:
      case PAGE_KEYS.FOSSILS:
      case PAGE_KEYS.INTERPRETATIONS:
        return 'Lithology ' + (index + 1);
      case PAGE_KEYS.TEPHRA:
        return (index + 1) + '. ' + getLabel(item?.layer_type, [PAGE_KEYS.TEPHRA, 'interval_description']);
      case PAGE_KEYS.EARTHQUAKES:
        return getLabel(item?.earthquake_feature, ['general', PAGE_KEYS.EARTHQUAKES]);
      default:
        return 'Unknown';
    }
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={item.id}
      onPress={() => !isReorderingActive && editItem(item)}
      onLongPress={drag}
      delayLongPress={500}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{getTitle()}</ListItem.Title>
      </ListItem.Content>
      {isReorderingActive ? (
        <Icon
          color={MEDIUMGREY}
          name={'chevron-expand'}
          size={20}
          type={'ionicon'}
        />
      ) : <ListItem.Chevron color={MEDIUMGREY}/>}
    </ListItem>
  );
};

export default BasicListItem;
