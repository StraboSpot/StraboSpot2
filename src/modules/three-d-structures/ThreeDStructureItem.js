import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {toTitleCase} from '../../shared/Helpers';
import {useFormHook} from '../form';

function ThreeDStructureItem(props) {
  const [useForm] = useFormHook();

  const get3dStructureTitle = (threeDStructure) => {
    return threeDStructure.label
      || toTitleCase(useForm.getLabel(threeDStructure.feature_type, ['_3d_structures', threeDStructure.feature_type]))
      || toTitleCase(useForm.getLabel(threeDStructure.type, ['_3d_structures', threeDStructure.feature_type]))
      || '';
  };

  const render3dStructure = (threeDStructure) => {
    const threeDStructureTitle = get3dStructureTitle(threeDStructure);
    const threeDStructureFieldsText = Object.entries(threeDStructure).reduce((acc, [key, value]) => {
      return key === 'id' ? acc
        : (acc === '' ? '' : acc + '\n')
        + toTitleCase(useForm.getLabel(key, ['_3d_structures', threeDStructure.feature_type])) + ': '
        + useForm.getLabels(value, ['_3d_structures', threeDStructure.feature_type]);
    }, '');

    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={threeDStructure.id}
        onPress={() => props.edit3dStructure(threeDStructure)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{threeDStructureTitle}</ListItem.Title>
          {threeDStructureFieldsText !== '' && (
            <ListItem.Subtitle>{threeDStructureFieldsText}</ListItem.Subtitle>
          )}
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
