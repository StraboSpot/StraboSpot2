import React from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {setSelectedAttributes} from '../spots/spots.slice';
import BasicListItem from './BasicListItem';
import {PAGE_KEYS, PET_PAGES, SED_PAGES} from './page.constants';

const BasicOverviewList = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const isPet = PET_PAGES.find(p => p.key === props.page.key);
  const isSed = SED_PAGES.find(p => p.key === props.page.key);

  const getData = () => {
    let data = spot.properties[props.page.key] || [];
    if (isPet && spot.properties.pet) {
      data = spot.properties.pet[props.page.key] || [];
      const deprecatedRockData = (props.page.key === PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE
        || props.page.key === PAGE_KEYS.ROCK_TYPE_IGNEOUS || props.page.key === PAGE_KEYS.ROCK_TYPE_METAMORPHIC)
      && spot.properties.pet?.rock_type?.includes(props.page.key) ? spot.properties.pet : {};
      if (!isEmpty(deprecatedRockData)) data = [spot.properties.pet, ...data];
    }
    else if (isSed && spot.properties.sed) data = spot.properties.sed[props.page.key] || [];
    return data;
  };

  const onItemPressed = (item) => {
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(props.page.key));
  };

  return (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      data={getData()}
      renderItem={({item}) => <BasicListItem page={props.page} item={item} editItem={onItemPressed}/>}
      ItemSeparatorComponent={FlatListItemSeparator}
      ListEmptyComponent={<ListEmptyText text={'No ' + props.page.label}/>}
    />
  );
};

export default BasicOverviewList;
