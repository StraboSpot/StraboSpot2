import React from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ThreeDStructureItem from './ThreeDStructureItem';

function ThreeDStructuresOverview(props) {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const render3dStructure = (threeDStructure) => {
    return (
      <ThreeDStructureItem item={threeDStructure} edit3dStructure={() =>
        dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.THREE_D_STRUCTURES))}
      />
    );
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={spot?.properties?._3d_structures || []}
        renderItem={({item}) => render3dStructure(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Three D Structures yet'}/>}
      />
    </React.Fragment>
  );
}

export default ThreeDStructuresOverview;
