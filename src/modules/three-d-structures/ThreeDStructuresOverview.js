import React from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import ThreeDStructureItem from './ThreeDStructureItem';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {setSelectedAttributes} from '../spots/spots.slice';

const ThreeDStructuresOverview = ({page}) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const threeDStructures = spot?.properties?._3d_structures?.filter(d => d.type !== 'fabric') || [];

  const on3DStructurePressed = (threeDStructure) => {
    dispatch(setSelectedAttributes([threeDStructure]));
    dispatch(setNotebookPageVisible(page.key));
  };

  return (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      data={threeDStructures}
      renderItem={({item}) => <ThreeDStructureItem item={item} edit3dStructure={() => on3DStructurePressed(item)}/>}
      ItemSeparatorComponent={FlatListItemSeparator}
      ListEmptyComponent={<ListEmptyText text={'No 3D Structures yet'}/>}
    />
  );
};

export default ThreeDStructuresOverview;
