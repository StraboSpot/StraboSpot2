import React, {useState} from 'react';
import { FlatList, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {DEFAULT_GEOLOGIC_TYPES} from './project.constants';
import {addedCustomFeatureTypes} from './projects.slice';
import commonStyles from '../../shared/common.styles';
import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import alert from '../../shared/ui/alert';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {useSpotsHook} from '../spots';


const CustomFeatureTypes = () => {
  const [refresh] = useState();
  const useSpots = useSpotsHook();
  const dispatch = useDispatch();
  const projectFeatures = useSelector(state => state.project.project.other_features);
  const customFeatureTypes = projectFeatures
    && projectFeatures.filter(feature => !DEFAULT_GEOLOGIC_TYPES.includes(feature));

  const deleteCustomFeature = (feature) => {
    let projectFeaturesCopy = projectFeatures.filter(projectFeature => feature !== projectFeature);
    dispatch(addedCustomFeatureTypes(projectFeaturesCopy));
    return true;
  };

  const deleteFeatureConfirm = (feature) => {
    alert('Delete Feature ' + toTitleCase(feature),
      'Are you sure you would like to delete ' + feature + '?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteCustomFeature(feature),
        },
      ],
      {cancelable: false},
    );
  };

  const deleteCustomFeatureValidation = (feature) => {
    let allSpots = Object.values(useSpots.getActiveSpotsObj());
    let isValidDelete = true;
    let spotsWithOtherFeatures = allSpots.filter(
      spot => spot.properties.other_features && spot.properties.other_features.length > 0);
    if (!isEmpty(spotsWithOtherFeatures)) {
      spotsWithOtherFeatures.map((spot) => {
        let otherFeatures = spot.properties.other_features;
        let featuresWithFeatureType = otherFeatures.filter(spotFeature => feature === spotFeature.type);
        if (!isEmpty(featuresWithFeatureType)) {
          alert('Type in Use',
            'This type is being used in spots, please remove this type from spots before deleting this type');
          isValidDelete = false;
        }
      });
      if (!isValidDelete) return false;
    }
    deleteFeatureConfirm(feature);
  };

  const renderFeature = (feature) => {
    return (
      <View>
        <ListItem key={feature.name} containerStyle={commonStyles.listItem}>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>{feature}</ListItem.Title>
          </ListItem.Content>
          <Button
            titleStyle={{color: themes.RED}}
            title={'Delete Feature'}
            type={'clear'}
            onPress={() => deleteCustomFeatureValidation(feature)}
          />
        </ListItem>
      </View>
    );
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={item => item.toString()}
        extraData={refresh}
        data={customFeatureTypes}
        renderItem={item => renderFeature(item.item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No custom feature types added yet. '
          + 'Add a custom feature type in Other Features tab of a spot by selecting'
          + ' the type \'other\' when adding a feature.'}/>}
      />
    </React.Fragment>
  );
};

export default CustomFeatureTypes;
