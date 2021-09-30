import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {deepFindFeatureTypeById, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {SpotsListItem, useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';

const TagDetail = (props) => {
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const spots = useSelector(state => state.spot.spots);
  const [refresh, setRefresh] = useState(false);

  // selectedTag.spots.map((x, index) => console.log(index, x, useSpots.getSpotById(x)));

  useEffect(() => {
    setRefresh(!refresh); // #TODO : Current hack to render two different FlatListComponents when selectedTag Changes.
                          //         To handle the navigation issue from 0 tagged features to non zero tagged features.
  }, [selectedTag]);

  const renderSpotFeatureItem = (feature) => {
    const spot = useSpots.getSpotById(feature.parentSpotId);
    const featureType = deepFindFeatureTypeById(spot.properties, feature.id);
    if (!isEmpty(spot)) {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          key={spot.properties.id}
          onPress={() => props.openFeatureDetail(spot, feature, featureType)}
        >
          <Avatar
            source={useSpots.getSpotDataIconSource(featureType)}
            placeholderStyle={{backgroundColor: 'transparent'}}
            size={20}
          />
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>
              {useTags.getFeatureDisplayComponent(featureType, feature)}
            </ListItem.Title>
            <ListItem.Subtitle>{spot.properties.name}</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      );
    }
  };

  const renderSpotItem = (id) => {
    const spot = useSpots.getSpotById(id);
    return (
      <SpotsListItem
        doShowTags={true}
        spot={spot}
        onPress={props.openSpot}
      />
    );
  };

  return (
    <FlatList
      ListHeaderComponent={
        <React.Fragment>
          <SectionDividerWithRightButton
            dividerText={'Tag Info'}
            buttonTitle={'View/Edit'}
            onPress={props.setIsDetailModalVisible}
          />
          {selectedTag && useTags.renderTagInfo()}
          <SectionDividerWithRightButton
            dividerText={'Tagged Spots'}
            buttonTitle={'Add/Remove'}
            onPress={props.addRemoveSpots}
          />
          <FlatList
            listKey={1}
            keyExtractor={(item) => item.toString()}
            data={selectedTag.spots && selectedTag.spots.filter(spotId => spots[spotId])}
            renderItem={({item}) => renderSpotItem(item)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'No Spots'}/>}
          />
          <SectionDividerWithRightButton
            dividerText={'Tagged Features'}
            buttonTitle={'Add/Remove'}
            onPress={props.addRemoveFeatures}
          />
          {!refresh && (
            <FlatList
              listKey={2}
              keyExtractor={(item) => item.toString()}
              data={useTags.getAllTaggedFeatures(selectedTag)}
              renderItem={({item}) => renderSpotFeatureItem(item)}
              ItemSeparatorComponent={FlatListItemSeparator}
              ListEmptyComponent={<ListEmptyText text={'No Features'}/>}
            />
          )}
          {refresh && (
            <FlatList
              listKey={2}
              keyExtractor={(item) => item.toString()}
              data={useTags.getAllTaggedFeatures(selectedTag)}
              renderItem={({item}) => renderSpotFeatureItem(item)}
              ItemSeparatorComponent={FlatListItemSeparator}
              ListEmptyComponent={<ListEmptyText text={'No Features'}/>}
            />
          )}
        </React.Fragment>
      }
    />
  );
};

export default TagDetail;
