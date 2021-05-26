import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';

const OtherFeatureItem = (props) => {

  const getTitle = (feature) => {
    const firstClassTitle = feature.name || 'Unnamed Feature';
    const secondClassTitle = feature.type?.toUpperCase() || 'UNKNOWN';
    return firstClassTitle + ' - ' + secondClassTitle;
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      key={props.feature.id}
      onPress={() => props.editFeature(props.feature)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{getTitle(props.feature)}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
};
export default OtherFeatureItem;
