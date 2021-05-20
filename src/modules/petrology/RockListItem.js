import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import {useFormHook} from '../form';

const RockListItem = (props) => {
  const [useForm] = useFormHook();

  const FIRST_ORDER_CLASS_FIELDS = {
    igneous: ['plutonic_rock_type', 'volcanic_rock_type'],
    metamorphic: ['metamorphic_rock_type'],
    alteration_or: ['ore_type'],
  };

  const getTitle = (rock) => {
    console.log('Rock', props.type, rock);
    // return toTitleCase(useForm.getLabel(props.type, ['pet']) + ' Rock');
    const formName = props.type === 'igneous' ? ['pet', rock.igneous_rock_class] : ['pet', props.type];
    const labelsArr = FIRST_ORDER_CLASS_FIELDS[props.type].reduce((acc, fieldName) => {
      if (rock[fieldName]) {
        const mainLabel = useForm.getLabel(fieldName, formName);
        const choiceLabels = useForm.getLabels(rock[fieldName], formName);
        return [...acc, toTitleCase(mainLabel) + ' - ' + choiceLabels.toUpperCase()];
      }
      else return acc;
    }, []);
    if (isEmpty(labelsArr)) {
      const defaultTitle = props.type === 'igneous' ? rock.igneous_rock_class
        : props.type === 'alteration_or' ? 'Alteration, Ore'
          : props.type;
      return toTitleCase(useForm.getLabel(defaultTitle + ' Rock', formName));
    }
    else return labelsArr.join(', ');
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={props.rock.id}
      onPress={() => props.editRock(props.rock)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{getTitle(props.rock)}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
};

export default RockListItem;
