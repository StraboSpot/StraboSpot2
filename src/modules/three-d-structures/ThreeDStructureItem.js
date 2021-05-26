import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {toTitleCase} from '../../shared/Helpers';
import {useFormHook} from '../form';

function ThreeDStructureItem(props) {
  const [useForm] = useFormHook();

  const getTitle = (threeDStructure) => {
    const firstClassTitle = toTitleCase(threeDStructure.type || '3D Structure');
    const secondClassTitle = useForm.getLabel(threeDStructure.feature_type,
      ['_3d_structures', threeDStructure.type]).toUpperCase();
    return firstClassTitle + ' - ' + secondClassTitle;
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={props.item.id}
      onPress={() => props.edit3dStructure(props.item)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{getTitle(props.item)}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
}

export default ThreeDStructureItem;
