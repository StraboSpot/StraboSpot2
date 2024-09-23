import React from 'react';
import {View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';

import usePage from '../../modules/page/usePage';
import {useTags} from '../../modules/tags';
import {isEmpty} from '../Helpers';

function FeatureTagsList({
                           featureId,
                           spotId,
                         }) {
  const {getSpotDataIconSource} = usePage();
  const {getTagsAtFeature} = useTags();

  const tags = getTagsAtFeature(spotId, featureId);
  const tagsString = tags.map(tag => tag.name).sort().join(', ');

  return (
    <View>
      {!isEmpty(tagsString) && (
        <View style={{
          flexDirection: 'row',
          paddingTop: 5,
        }}>
          <Avatar
            source={getSpotDataIconSource('tags')}
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
