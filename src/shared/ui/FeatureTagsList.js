import React from 'react';
import {View} from 'react-native';

import {ListItem} from '@rn-vui/base';

import {useTags} from '../../modules/tags';
import {isEmpty} from '../Helpers';
import {NotebookPageAvatar} from './avatars';

function FeatureTagsList({
                           featureId,
                           spotId,
                         }) {
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
          <NotebookPageAvatar pageKey={'tags'}/>
          <ListItem.Subtitle>{tagsString}</ListItem.Subtitle>
        </View>
      )}
    </View>
  );
}

export default FeatureTagsList;
