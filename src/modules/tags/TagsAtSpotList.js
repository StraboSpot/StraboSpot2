import React from 'react';
import {FlatList} from 'react-native';

import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {PAGE_KEYS} from '../page/page.constants';
import {TagsListItem, useTagsHook} from '../tags';

const TagsAtSpotList = ({openMainMenu, page}) => {
  const useTags = useTagsHook();

  const data = page.key === PAGE_KEYS.GEOLOGIC_UNITS ? useTags.getGeologicUnitTagsAtSpot()
    : useTags.getNonGeologicUnitTagsAtSpot();
  const listEmptyText = page.key === PAGE_KEYS.GEOLOGIC_UNITS ? 'No Geologic Units' : 'No Tags';

  const renderTag = (tag) => {
    return <TagsListItem tag={tag} openMainMenu={openMainMenu}/>;
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={data}
        renderItem={({item}) => renderTag(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={listEmptyText}/>}
      />
    </React.Fragment>
  );
};

export default TagsAtSpotList;
