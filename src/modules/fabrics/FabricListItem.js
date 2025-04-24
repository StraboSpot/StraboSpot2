import React from 'react';

import {ListItem} from 'react-native-elements';

import {FIRST_ORDER_FABRIC_FIELDS} from './fabric.constants';
import commonStyles from '../../shared/common.styles';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import {useForm} from '../form';

const FabricListItem = ({
                          editFabric,
                          fabric,
                        }) => {
  const {getLabel, getLabels} = useForm();

  const getTitle = (fabricObj) => {
    if (fabricObj.type === 'fabric') {
      if (fabricObj.feature_type) return toTitleCase(getLabel(fabricObj.feature_type, ['_3d_structures', 'fabric']));
      else return 'Fabric';
    }
    else {
      const labelsArr = FIRST_ORDER_FABRIC_FIELDS[fabricObj.type]
        && FIRST_ORDER_FABRIC_FIELDS[fabricObj.type].reduce((acc, fieldName) => {
          if (fabricObj[fieldName]) {
            const mainLabel = getLabel(fieldName, ['fabrics', fabricObj.type]);
            const choiceLabels = getLabels(fabricObj[fieldName], ['fabrics', fabricObj.type]);
            return [...acc, toTitleCase(mainLabel) + ' - ' + choiceLabels.toUpperCase()];
          }
          else return acc;
        }, []);
      if (isEmpty(labelsArr) && fabricObj.type === 'fault_rock') return 'Structural Fabric';
      else if (isEmpty(labelsArr)) return toTitleCase(getLabel(fabricObj.type, ['fabrics', fabricObj.type]));
      else return labelsArr.join(', ');
    }
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={fabric.id}
      onPress={() => editFabric(fabric)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{getTitle(fabric)}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
};

export default FabricListItem;
