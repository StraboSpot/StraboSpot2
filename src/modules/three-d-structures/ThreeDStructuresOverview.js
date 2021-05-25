import React from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {setSelectedAttributes} from '../spots/spots.slice';
import ThreeDStructureItem from './ThreeDStructureItem';

const ThreeDStructuresOverview = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const on3DStructurePressed = (threeDStructure) => {
    dispatch(setSelectedAttributes([threeDStructure]));
    dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.THREE_D_STRUCTURES));
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={spot?.properties?._3d_structures?.filter(d => d.type !== 'fabric') || []}
        renderItem={({item}) => <ThreeDStructureItem item={item} edit3dStructure={() => on3DStructurePressed(item)}/>}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No 3D Structures yet'}/>}
      />
    </React.Fragment>
  );
};

export default ThreeDStructuresOverview;
