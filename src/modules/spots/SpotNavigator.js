import React from 'react';
import {View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {PAGE_KEYS} from '../page/page.constants';
import {SpotsList, SpotsListItem} from './index';
import {setSelectedAttributes, setSelectedSpot} from './spots.slice';

const SpotNavigator = (props) => {
  console.log('Rendering SpotsNavigator...');

  const dispatch = useDispatch();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const openSpotInNotebook = (spot, notebookPage, attributes) => {
    props.closeSpotsNavigator();
    dispatch(setSelectedSpot(spot));
    if (attributes) dispatch(setSelectedAttributes(attributes));
    if (notebookPage) props.openNotebookPanel(notebookPage);
    else props.openNotebookPanel(PAGE_KEYS.OVERVIEW);
  };

  return (
    <View style={{flex: 1}}>
      <SectionDivider dividerText={'Current Spot'}/>
      {isEmpty(selectedSpot) ? <ListEmptyText text={'No Selected Spot'}/>
        : <SpotsListItem onPress={openSpotInNotebook} spot={selectedSpot}/>}
      <SectionDivider dividerText={'Spots List'}/>
      <SpotsList onPress={openSpotInNotebook}/>
    </View>
  );
};

export default SpotNavigator;
