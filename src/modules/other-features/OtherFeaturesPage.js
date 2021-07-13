import React, {useState} from 'react';
import {FlatList, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {getNewId} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import OtherFeatureDetail from './OtherFeatureDetail';
import OtherFeatureItem from './OtherFeatureItem';

const OtherFeaturesPage = () => {
  const [isFeatureDetailVisible, setIsFeatureDetailVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState({});
  const spot = useSelector(state => state.spot.selectedSpot);
  const otherFeatures = useSelector(state => state.project.project.other_features);

  const addFeature = () => {
    setSelectedFeature({id: getNewId()});
    setIsFeatureDetailVisible(true);
  };

  const editFeature = (feature) => {
    setSelectedFeature(feature);
    setIsFeatureDetailVisible(true);
  };

  const renderFeature = (feature) => {
    return (
      <OtherFeatureItem feature={feature} editFeature={() => editFeature(feature)}/>
    );
  };

  return (
    <React.Fragment>
      {!isFeatureDetailVisible && <ReturnToOverviewButton/>}
      {!isFeatureDetailVisible && (
        <View>
          <Button
            title={'+ Add Feature'}
            type={'clear'}
            onPress={addFeature}
          />
          <FlatList
            data={spot.properties.other_features}
            renderItem={item => renderFeature(item.item)}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'There are no other features at this Spot.'}/>}
          />
        </View>
      )}
      {isFeatureDetailVisible && (
        <OtherFeatureDetail
          featureTypes={otherFeatures}
          hideFeatureDetail={() => setIsFeatureDetailVisible(false)}
          selectedFeature={selectedFeature}
          renderFeature={(feature) => renderFeature(feature)}
        />)}
    </React.Fragment>
  );
};

export default OtherFeaturesPage;
