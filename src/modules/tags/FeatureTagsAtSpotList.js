import React from 'react';
import {FlatList} from 'react-native';

import {useSelector} from 'react-redux';

import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';
import TagsList from './TagsList';

const FeatureTagsAtSpotList = (props) => {
  const [useTags] = useTagsHook();
  const [useSpots] = useSpotsHook();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const getFeatureTagsAtSpot = () => {
    let featuresAtSpot = useSpots.getAllFeaturesFromSpot(selectedSpot);
    return useTags.getFeatureTagsAtSpotGeologicUnitFirst(featuresAtSpot);
  };

  const renderTag = (tag) => {
    return (
      <TagsList tag={tag} openMainMenu={props.openMainMenu}/>
    );
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={getFeatureTagsAtSpot()}
        renderItem={({item}) => renderTag(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text='No Tags'/>}
      />
    </React.Fragment>
  );
};

export default FeatureTagsAtSpotList;
