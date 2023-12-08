import React from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import BasicListItem from './BasicListItem';
import {PAGE_KEYS, PET_PAGES, SED_PAGES} from './page.constants';
import {getNewUUID, isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';

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
    if (props.page.key === PAGE_KEYS.STRAT_SECTION) data = [data];
    else if (props.page.key === PAGE_KEYS.ROCK_TYPE_SEDIMENTARY) data = spot.properties.sed[PAGE_KEYS.LITHOLOGIES] || [];
    else if (props.page.key === PAGE_KEYS.BEDDING && spot.properties?.sed[props.page.key]
      && spot.properties?.sed[props.page.key].beds) data = spot.properties.sed[props.page.key].beds || [];

    if (!Array.isArray(data)) data = [];
    return data;
  };

  const addIdForSS1ImportedSedData = (item, i) => {
    let editedSedData = JSON.parse(JSON.stringify(spot.properties.sed));
    item = {...item, id: getNewUUID()};
    if (props.page.key === PAGE_KEYS.ROCK_TYPE_SEDIMENTARY) editedSedData[PAGE_KEYS.LITHOLOGIES].splice(i, 1, item);
    else if (props.page.key === PAGE_KEYS.BEDDING) editedSedData[props.page.key].beds.splice(i, 1, item);
    else editedSedData[props.page.key].splice(i, 1, item);
    dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
    dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
    dispatch(setSelectedAttributes([item]));
  };

  const onItemPressed = (item, i) => {
    if (isSed && !item.id && props.page.key !== PAGE_KEYS.STRAT_SECTION && props.page.key !== PAGE_KEYS.INTERVAL) {
      addIdForSS1ImportedSedData(item, i);
    }
    else dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(props.page.key));
  };

  return (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      data={getData()}
      renderItem={({item, index}) => (
        <BasicListItem
          page={props.page}
          item={item}
          index={index}
          editItem={itemToEdit => onItemPressed(itemToEdit, index)}
        />
      )}
      ItemSeparatorComponent={FlatListItemSeparator}
      ListEmptyComponent={<ListEmptyText text={'No ' + props.page.label}/>}
    />
  );
};

export default BasicOverviewList;
