import React, {useEffect, useState} from 'react';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import MeasurementLabel from './MeasurementLabel';
import commonStyles from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';
import FeatureTagsList from '../../shared/ui/FeatureTagsList';
import {useTagsHook} from '../tags';

// Render a measurement item in a list
const MeasurementItem = ({
                           isDetail,
                           item,
                           onPress,
                           selectedIds,
                         }) => {

  const spot = useSelector(state => state.spot.selectedSpot);
  const useTags = useTagsHook();
  const isMultipleFeaturesTaggingEnabled = useSelector(state => state.project.isMultipleFeaturesTaggingEnabled);
  const [featureSelectedForTagging, setFeatureSelectedForTagging] = useState(false);

  useEffect(() => {
    console.log('UE MeasurementItem [isMultipleFeaturesTaggingEnabled]', isMultipleFeaturesTaggingEnabled);
    if (!isMultipleFeaturesTaggingEnabled) setFeatureSelectedForTagging(false);
  }, [isMultipleFeaturesTaggingEnabled]);

  const onMeasurementPress = () => {
    if (isMultipleFeaturesTaggingEnabled) {
      setFeatureSelectedForTagging(useTags.setFeaturesSelectedForMultiTagging(item));
    }
    else onPress();
  };

  return (
    <React.Fragment>
      {typeof (item) !== 'undefined' && (
        <ListItem
          containerStyle={selectedIds.includes(item.id) ? commonStyles.listItemInverse
            : [commonStyles.listItem, {
              backgroundColor: featureSelectedForTagging
                ? themes.PRIMARY_ACCENT_COLOR : themes.SECONDARY_BACKGROUND_COLOR,
            }]}
          key={item.id}
          onPress={() => onMeasurementPress()}
          pad={5}
        >
          <ListItem.Content>
            <ListItem.Title
              style={selectedIds.includes(item.id) ? commonStyles.listItemTitleInverse
                : commonStyles.listItemTitle}
            >
              <MeasurementLabel item={item} isDetail={isDetail}/>
            </ListItem.Title>
            <FeatureTagsList spotId={spot.properties.id} featureId={item.id}/>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      )}
    </React.Fragment>
  );
};

export default MeasurementItem;
