import React from 'react';
import {FlatList} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';

const TagDetail = (props) => {
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();
  const selectedTag = useSelector(state => state.project.selectedTag);

  const renderSpotListItem = (spotId) => {
    const spot = useSpots.getSpotById(spotId);
    if (!isEmpty(spot)) {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          onPress={() => props.openSpot(spot)}
        >
          <Avatar
            source={useSpots.getSpotGemometryIconSource(spot)}
            placeholderStyle={{backgroundColor: 'transparent'}}
            size={20}
          />
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>{spot.properties.name}</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      );
    }
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
            keyExtractor={(item) => item.toString()}
            data={selectedTag.spots}
            renderItem={({item}) => renderSpotListItem(item)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'No Spots'}/>}
          />
        </React.Fragment>
      }
    />
  );
};

export default TagDetail;
