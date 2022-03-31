import React, {useEffect, useState} from 'react';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';
import FeatureTagsList from '../../shared/ui/FeatureTagsList';
import {useTagsHook} from '../tags';
import OtherFeatureLabel from './OtherFeatureLabel';

const OtherFeatureItem = (props) => {
  const spot = useSelector(state => state.spot.selectedSpot);
  const [useTags] = useTagsHook();
  const isMultipleFeaturesTaggingEnabled = useSelector(state => state.project.isMultipleFeaturesTaggingEnabled);
  const [featureSelectedForTagging, setFeatureSelectedForTagging] = useState(false);

  useEffect(() => {
    console.log('UE OtherFeatureItem [isMultipleFeaturesTaggingEnabled]', isMultipleFeaturesTaggingEnabled);
    if (!isMultipleFeaturesTaggingEnabled) setFeatureSelectedForTagging(false);
  }, [isMultipleFeaturesTaggingEnabled]);

  const editFeature = (feature) => {
    if (isMultipleFeaturesTaggingEnabled) {
      setFeatureSelectedForTagging(useTags.setFeaturesSelectedForMultiTagging(feature));
    }
    else props.editFeature(feature);
  };

  return (
    <ListItem
      containerStyle={[commonStyles.listItem,
        {backgroundColor: featureSelectedForTagging ? themes.PRIMARY_ACCENT_COLOR : themes.SECONDARY_BACKGROUND_COLOR}]}
      key={props.feature.id}
      onPress={() => editFeature(props.feature)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>
          <OtherFeatureLabel item={props.feature}/>
        </ListItem.Title>
        <FeatureTagsList spotId={spot.properties.id} featureId={props.feature.id}/>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
};
export default OtherFeatureItem;
