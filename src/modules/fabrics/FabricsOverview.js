import React from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import FabricListItem from './FabricListItem';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {setSelectedAttributes} from '../spots/spots.slice';

const FabricsOverview = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const fabrics = [...(spot?.properties?.fabrics || []),
    ...(spot?.properties?._3d_structures?.filter(struct => struct.type === 'fabric') || [])];

  const onFabricPressed = (fabric) => {
    dispatch(setSelectedAttributes([fabric]));
    dispatch(setNotebookPageVisible(props.page.key));
  };

  return (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      data={fabrics}
      renderItem={({item}) => <FabricListItem fabric={item} editFabric={() => onFabricPressed(item)}/>}
      ItemSeparatorComponent={FlatListItemSeparator}
      ListEmptyComponent={<ListEmptyText text={'No Fabrics'}/>}
    />
  );
};

export default FabricsOverview;
