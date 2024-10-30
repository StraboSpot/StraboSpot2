import React from 'react';
import {FlatList, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {deepFindFeatureTypeById, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import usePage from '../page/usePage';
import {useSpots} from '../spots';
import {useTags} from '../tags';

const AddRemoveTagFeatures = () => {
  const {getSpotDataIconSource} = usePage();
  const {getAllFeaturesFromSpot} = useSpots();
  const {addRemoveSpotFeatureFromTag, getFeatureDisplayComponent} = useTags();

  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const spots = useSelector(state => state.spot.spots);

  const renderSpotFeatureItem = (feature) => {
    const spotId = feature.parentSpotId;
    const spot = spots[spotId];
    const selectedTagCopy = JSON.parse(JSON.stringify(selectedTag));
    const featureType = deepFindFeatureTypeById(spot.properties, feature.id);

    if (!isEmpty(spot) && !isEmpty(spot.properties)) {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          onPress={() => addRemoveSpotFeatureFromTag(selectedTagCopy, feature, spotId)}
        >
          <Avatar
            source={getSpotDataIconSource(featureType)}
            placeholderStyle={{backgroundColor: 'transparent'}}
            size={20}
          />
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>
              {getFeatureDisplayComponent(featureType, feature)}
            </ListItem.Title>
            <ListItem.Subtitle>{spot.properties.name || spotId}</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.CheckBox
            checked={!isEmpty(selectedTag) && !isEmpty(selectedTag.features)
              && !isEmpty(selectedTag.features[spotId])
              && selectedTag.features[spotId].includes(feature.id)}
            onPress={() => addRemoveSpotFeatureFromTag(selectedTagCopy, feature, spotId)}
          />
        </ListItem>
      );
    }
  };

  return (
    <>
      <SidePanelHeader
        backButton={() => dispatch(setSidePanelVisible({bool: true, view: SIDE_PANEL_VIEWS.TAG_DETAIL}))}
        title={`${selectedTag.name}`}
        headerTitle={!isEmpty(selectedTag) && `Add/Remove ${selectedTag.name}`}
      />
      <View style={{...commonStyles.buttonContainer, flex: 1}}>
        <FlatList
          data={getAllFeaturesFromSpot()}
          renderItem={({item}) => renderSpotFeatureItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={'No Features in Active Datasets'}/>}
        />
      </View>
    </>
  );
};

export default AddRemoveTagFeatures;
