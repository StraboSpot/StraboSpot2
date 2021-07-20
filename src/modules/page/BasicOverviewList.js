import React from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {setSelectedAttributes} from '../spots/spots.slice';
import BasicListItem from './BasicListItem';
import {PET_PAGES} from './page.constants';

const BasicOverviewList = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const isPet = PET_PAGES.find(p => p.key === props.page.key);

  const getData = () => {
    if (isPet && spot.properties.pet) return spot.properties.pet[props.page.key];
    else return spot.properties[props.page.key];
  };

  const onItemPressed = (item) => {
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(props.page.key));
  };

  return (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      data={getData() || []}
      renderItem={({item}) => <BasicListItem page={props.page} item={item} editItem={onItemPressed}/>}
      ItemSeparatorComponent={FlatListItemSeparator}
      ListEmptyComponent={<ListEmptyText text={'No ' + props.page.label}/>}
    />
  );
};

export default BasicOverviewList;
