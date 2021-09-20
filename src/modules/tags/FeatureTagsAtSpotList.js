import React from 'react';
import {FlatList} from 'react-native';

import {useSelector} from 'react-redux';

import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {PAGE_KEYS} from '../page/page.constants';
import {useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';
import TagsList from './TagsList';

const FeatureTagsAtSpotList = (props) => {
  const [useTags] = useTagsHook();
  const [useSpots] = useSpotsHook();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const listEmptyText = props.page.key === PAGE_KEYS.GEOLOGIC_UNITS ? 'No Geologic Units' : 'No Tags';

  const getFeatureTagsAtSpot = () => {
    let featuresAtSpot = useSpots.getAllFeaturesFromSpot(selectedSpot);
    return props.page.key === PAGE_KEYS.GEOLOGIC_UNITS ? useTags.getGeologicUnitFeatureTagsAtSpot(featuresAtSpot)
      : useTags.getNonGeologicUnitFeatureTagsAtSpot(featuresAtSpot);
  };

  const renderTag = (tag) => {
    return <TagsList tag={tag} openMainMenu={props.openMainMenu}/>;
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={getFeatureTagsAtSpot()}
        renderItem={({item}) => renderTag(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={listEmptyText}/>}
      />
    </React.Fragment>
  );
};

export default FeatureTagsAtSpotList;
