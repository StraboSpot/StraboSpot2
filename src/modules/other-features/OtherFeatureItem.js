import React, {useState} from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';

const OtherFeatureItem = (props) => {

  const editFeature = (feature) => {
    props.editFeature(feature);
  };

  const renderFeature = (feature) => {
    const featureTitle = feature.name;
    const featureText = Object.entries(feature).reduce((acc, [key, value]) => {
      return key === 'id' ? acc : (acc === '' ? '' : acc + '\n') + toTitleCase(key) + ': ' + toTitleCase(value);
    }, '');
    return (
      <ListItem containerStyle={commonStyles.listItem} key={feature.id} onPress={() => editFeature(feature)}>
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>{featureTitle}</ListItem.Title>
          {featureText !== '' && (
            <ListItem.Subtitle style={{color: themes.PRIMARY_TEXT_COLOR}}>{featureText}</ListItem.Subtitle>
          )}
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {renderFeature(props.feature)}
    </React.Fragment>
  )
    ;
};
export default OtherFeatureItem;
