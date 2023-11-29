import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {SpotsList, SpotsListItem} from './index';
import {setSelectedSpot} from './spots.slice';

const SpotNavigator = ({closeSpotsNavigator, openNotebookPanel}) => {
  console.log('Rendering SpotsNavigator...');

  const dispatch = useDispatch();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const openSpotInNotebook = (spot) => {
    closeSpotsNavigator();
    dispatch(setSelectedSpot(spot));
    openNotebookPanel();
  };

  return (
    <>
      <SectionDivider dividerText={'Current Spot'}/>
      {isEmpty(selectedSpot) ? <ListEmptyText text={'No Selected Spot'}/>
        : <SpotsListItem onPress={openSpotInNotebook} spot={selectedSpot}/>}
      <SectionDivider dividerText={'Spots List'}/>
      <SpotsList onPress={openSpotInNotebook}/>
    </>
  );
};

export default SpotNavigator;
