import React, {useEffect, useState} from 'react';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';
import FeatureTagsList from '../../shared/ui/FeatureTagsList';
import {useTagsHook} from '../tags';
import ThreeDStructureLabel from './ThreeDStructureLabel';

function ThreeDStructureItem(props) {
  const [useTags] = useTagsHook();
  const spot = useSelector(state => state.spot.selectedSpot);
  const isMultipleFeaturesTaggingEnabled = useSelector(state => state.project.isMultipleFeaturesTaggingEnabled);
  const [featureSelectedForTagging, setFeatureSelectedForTagging] = useState(false);

  useEffect(() => {
    console.log('UE ThreeDStructureItem [isMultipleFeaturesTaggingEnabled]', isMultipleFeaturesTaggingEnabled);
    if (!isMultipleFeaturesTaggingEnabled) setFeatureSelectedForTagging(false);
  }, [isMultipleFeaturesTaggingEnabled]);

  const editFeature = (feature) => {
    if (isMultipleFeaturesTaggingEnabled) {
      setFeatureSelectedForTagging(useTags.setFeaturesSelectedForMultiTagging(feature));
    }
    else props.edit3dStructure(feature);
  };

  return (
    <ListItem
      containerStyle={[commonStyles.listItem,
        {backgroundColor: featureSelectedForTagging ? themes.PRIMARY_ACCENT_COLOR : themes.SECONDARY_BACKGROUND_COLOR}]}
      key={props.item.id}
      onPress={() => editFeature(props.item)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>
          <ThreeDStructureLabel item={props.item}/>
        </ListItem.Title>
        <FeatureTagsList spotId={spot.properties.id} featureId={props.item.id}/>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
}

export default ThreeDStructureItem;
