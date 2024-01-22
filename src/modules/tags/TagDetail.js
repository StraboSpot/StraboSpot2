import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {deepFindFeatureTypeById, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {PAGE_KEYS} from '../page/page.constants';
import usePageHook from '../page/usePage';
import {SpotsListItem, useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';

const TagDetail = ({
                     addRemoveFeatures,
                     addRemoveSpots,
                     openFeatureDetail,
                     openSpot,
                     setIsDetailModalVisible,
                   }) => {
  const usePage = usePageHook();
  const useSpots = useSpotsHook();
  const useTags = useTagsHook();

  const selectedTag = useSelector(state => state.project.selectedTag);
  const spots = useSelector(state => state.spot.spots);
  const [refresh, setRefresh] = useState(false);

  // selectedTag.spots.map((x, index) => console.log(index, x, useSpots.getSpotById(x)));

  useEffect(() => {
    console.log('UE TagDetail [selectedTag]', selectedTag);
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
          onPress={() => openFeatureDetail(spot, feature, featureType)}
        >
          <Avatar
            source={usePage.getSpotDataIconSource(featureType)}
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
        onPress={openSpot}
      />
    );
  };

  const renderTaggedFeaturesList = () => {
    return (
      <FlatList
        listKey={2}
        keyExtractor={item => item.toString()}
        data={useTags.getAllTaggedFeatures(selectedTag)}
        renderItem={({item}) => renderSpotFeatureItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Features'}/>}
      />
    );
  };

  return (
    <FlatList
      ListHeaderComponent={
        <React.Fragment>
          <SectionDividerWithRightButton
            dividerText={selectedTag.type === PAGE_KEYS.GEOLOGIC_UNITS ? 'Info' : 'Tag Info'}
            buttonTitle={'View/Edit'}
            onPress={setIsDetailModalVisible}
          />
          {selectedTag && useTags.renderTagInfo()}
          <SectionDividerWithRightButton
            dividerText={selectedTag.type === PAGE_KEYS.GEOLOGIC_UNITS ? 'Spots' : 'Tagged Spots'}
            buttonTitle={'Add/Remove'}
            onPress={addRemoveSpots}
          />
          <FlatList
            listKey={1}
            keyExtractor={item => item.toString()}
            data={selectedTag.spots && selectedTag.spots.filter(spotId => spots[spotId])}
            renderItem={({item}) => renderSpotItem(item)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'No Spots'}/>}
          />
          {selectedTag.type !== PAGE_KEYS.GEOLOGIC_UNITS && (
            <React.Fragment>
              <SectionDividerWithRightButton
                dividerText={'Tagged Features'}
                buttonTitle={'Add/Remove'}
                onPress={addRemoveFeatures}
              />
              {refresh ? renderTaggedFeaturesList() : renderTaggedFeaturesList()}
            </React.Fragment>
          )}
        </React.Fragment>
      }
    />
  );
};

export default TagDetail;
