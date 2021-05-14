import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {get3dStructureTitle, getLabel} from './ThreeDStructureUtil';

function ThreeDStructureItem(props) {

  const render3dStructure = (threeDStructure) => {
    const threeDStructureTitle = get3dStructureTitle(threeDStructure);
    const threeDStructureFieldsText = Object.entries(threeDStructure).reduce((acc, [key, value]) => {
      return key === 'id' ? acc : (acc === '' ? '' : acc + '\n') + getLabel(key) + ': ' + getLabel(value);
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
  )
    ;
}

export default ThreeDStructureItem;
