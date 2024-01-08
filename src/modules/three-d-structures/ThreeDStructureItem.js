import React, {useEffect, useState} from 'react';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import ThreeDStructureLabel from './ThreeDStructureLabel';
import commonStyles from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';
import FeatureTagsList from '../../shared/ui/FeatureTagsList';
import {useTagsHook} from '../tags';

function ThreeDStructureItem({
                               edit3dStructure,
                               item,
                             }) {
  const useTags = useTagsHook();
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
    else edit3dStructure(feature);
  };

  return (
    <ListItem
      containerStyle={[commonStyles.listItem,
        {backgroundColor: featureSelectedForTagging ? themes.PRIMARY_ACCENT_COLOR : themes.SECONDARY_BACKGROUND_COLOR}]}
      key={item.id}
      onPress={() => editFeature(item)}
    >
      <ListItem.Content style={{overflow: 'hidden'}}>
        <ListItem.Title style={commonStyles.listItemTitle}>
          <ThreeDStructureLabel item={item}/>
        </ListItem.Title>
        <FeatureTagsList spotId={spot.properties.id} featureId={item.id}/>
      </ListItem.Content>
      <ListItem.Chevron/>
    </ListItem>
  );
}

export default ThreeDStructureItem;
