import React, {useState} from 'react';
import {FlatList, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import OtherFeatureDetail from './OtherFeatureDetail';

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
      {!isFeatureDetailVisible && (
        <ReturnToOverviewButton
          onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
        />
      )}
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
