import React from 'react';
import {View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';

import usePageHoook from '../../modules/page/usePage';
import {useTagsHook} from '../../modules/tags';
import {isEmpty} from '../Helpers';

function FeatureTagsList(props) {
  const usePage = usePageHoook();
  const useTags = useTagsHook();

  const tags = useTags.getTagsAtFeature(props.spotId, props.featureId);
  const tagsString = tags.map(tag => tag.name).sort().join(', ');

  return (
    <View>
      {!isEmpty(tagsString) && (
        <View style={{
          flexDirection: 'row',
          paddingTop: 5,
        }}>
          <Avatar
            source={usePage.getSpotDataIconSource('tags')}
            placeholderStyle={{backgroundColor: 'transparent'}}
            size={20}
          />
          <ListItem.Subtitle>{tagsString}</ListItem.Subtitle>
        </View>
      )}
    </View>
  );
}

export default FeatureTagsList;
