import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {toTitleCase} from '../../shared/Helpers';
import {useFormHook} from '../form';

function ThreeDStructureItem(props) {
  const [useForm] = useFormHook();

  const get3dStructureTitle = (threeDStructure) => {
    const firstClassTitle = toTitleCase(threeDStructure.type);
    const secondClassTitle = toTitleCase(useForm.getLabel(threeDStructure.feature_type, ['_3d_structures', threeDStructure.type]))
      || toTitleCase(useForm.getLabel(threeDStructure.type, ['_3d_structures', threeDStructure.type]))
      || '';
    return toTitleCase(firstClassTitle) + ' - ' + secondClassTitle.toUpperCase();
  };

  const render3dStructure = (threeDStructure) => {
    const threeDStructureTitle = get3dStructureTitle(threeDStructure);
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={threeDStructure.id}
        onPress={() => props.edit3dStructure(threeDStructure)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{threeDStructureTitle}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {render3dStructure(props.item)}
    </React.Fragment>
  );
}

export default ThreeDStructureItem;
