import React, {useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import FeatureDetail from './FeatureDetail';

const OtherFeaturesPage = () => {
  const dispatch = useDispatch();
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
    const featureTitle = feature.name;
    const featureText = Object.entries(feature).reduce((acc, [key, value]) => {
      return key === 'id' ? acc : (acc === '' ? '' : acc + '\n') + toTitleCase(key) + ': ' + toTitleCase(value);
    }, '');
    return (
      <ListItem key={feature.id}
                onPress={() => editFeature(feature)}
      >
        <ListItem.Content style={{overflow: 'hidden'}}>
          <ListItem.Title>{featureTitle}</ListItem.Title>
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
      {!isFeatureDetailVisible && <ReturnToOverviewButton
        onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
      />}
      {!isFeatureDetailVisible && (
        <View>
          <Button
            title={'+ Add Feature'}
            type={'clear'}
            onPress={addFeature}
          />
          {(!spot.properties.other_features || !spot.properties.other_features.length > 0) && (
            <View style={{padding: 10}}>
              <Text>There are no other features to this Spot.</Text>
            </View>
          )}
          {spot.properties.other_features && spot.properties.other_features.length > 0 && (
            <FlatList
              data={spot.properties.other_features}
              renderItem={item => renderFeature(item.item)}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => <View style={{borderTopWidth: 1, paddingTop: 10}}/>}
            />
          )}
        </View>
      )}
      {isFeatureDetailVisible && (
        <FeatureDetail
          featureTypes={otherFeatures}
          hideFeatureDetail={() => setIsFeatureDetailVisible(false)}
          selectedFeature={selectedFeature}
          renderFeature={(feature) => renderFeature(feature)}
        />)}
    </React.Fragment>
  );
};

export default OtherFeaturesPage;
