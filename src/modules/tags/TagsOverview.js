import React from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';

import {ListItem, Icon} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {useTagsHook} from '../tags';

const SpotTag = () => {
  const [useTags] = useTagsHook();
  const tags = useSelector(state => state.project.project.tags || []);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const filteredTags = tags.filter(tag => tag.spots.includes(selectedSpot.properties.id));
  console.log('FilteredTags', filteredTags);
  const renderTag = (tag) => {
    return (
      <ListItem
        key={tag.id}
        title={`${tag.name}`}
        titleStyle={commonStyles.listItemTitle}
        rightTitle={`${useTags.renderSpotCount(tag)}`}
        rightTitleStyle={{paddingRight: 20}}
        containerStyle={commonStyles.listItem}
        rightIcon={
          <View style={{paddingRight: 10}}>
            <Icon
              name='ios-information-circle-outline'
              type='ionicon'
              color={themes.PRIMARY_ACCENT_COLOR}
              onPress={() => console.log('Tag item pressed', tag.id, tag.name)}
            />
          </View>}
      />
    );
  };

  return (
    <React.Fragment>
      {!isEmpty(filteredTags) ? <ScrollView style={{maxHeight: 250}}>
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={filteredTags}
          renderItem={({item}) => renderTag(item)}/>
      </ScrollView> : <Text style={commonStyles.noValueText}>No Tags</Text>
      }
    </React.Fragment>
  );
};

export default SpotTag;
