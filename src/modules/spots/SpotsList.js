import React, {useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Button, CheckBox, Icon, Overlay, SearchBar} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {SpotsListItem, useSpotsHook} from './index';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {
  PRIMARY_BACKGROUND_COLOR,
  PRIMARY_TEXT_COLOR,
  PRIMARY_TEXT_SIZE,
  SECONDARY_BACKGROUND_COLOR,
} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import UpdateSpotsInMapExtentButton from '../../shared/ui/UpdateSpotsInMapExtentButton';
import overlayStyles from '../home/overlays/overlay.styles';
import {SORT_ORDER, SORTED_VIEWS} from '../main-menu-panel/mainMenu.constants';
import SortingButtons from '../main-menu-panel/SortingButtons';

const SpotsList = ({isCheckedList, onPress, updateSpotsInMapExtent}) => {
  console.log('Rendering SpotsList...');

  const useSpots = useSpotsHook();

  const recentViews = useSelector(state => state.spot.recentViews);
  const sortedView = useSelector(state => state.mainMenu.sortedView);
  const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);

  const activeSpotsObj = useSpots.getActiveSpotsObj();
  const activeSpots = Object.values(activeSpotsObj);

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isReverseSort, setIsReverseSort] = useState(false);
  const [searchState, setSearchState] = useState('');
  const [sortOrder, setSortOrder] = useState('Date Created');
  const [spotsFiltered, setSpotsFiltered] = useState(activeSpots);
  const [spotsSearched, setSpotsSearched] = useState(activeSpots);
  const [spotsSorted, setSpotsSorted] = useState(activeSpots);
  const [textNoSpots, setTextNoSpots] = useState('No Spots in Active Datasets');

  useEffect(() => {
    let gotSpotsFiltered = activeSpots;
    if (isEmpty(activeSpots)) setTextNoSpots('No Spots in Active Datasets');
    else if (sortedView === SORTED_VIEWS.MAP_EXTENT) {
      gotSpotsFiltered = [...spotsInMapExtent];
      if (isEmpty(gotSpotsFiltered)) setTextNoSpots('No active Spots in current map extent');
    }
    else if (sortedView === SORTED_VIEWS.RECENT_VIEWS) {
      gotSpotsFiltered = useSpots.getRecentSpots();
      if (isEmpty(gotSpotsFiltered)) setTextNoSpots('No recently viewed active Spots');
    }
    setSpotsFiltered(gotSpotsFiltered);
    updateSearch(undefined, gotSpotsFiltered);
  }, [recentViews, sortedView, spotsInMapExtent]);

  const openPicker = () => {
    setIsPickerVisible(true);
  };

  const closePicker = () => {
    setIsPickerVisible(false);
  };

  const renderNoSpotsText = () => <ListEmptyText text={textNoSpots}/>;

  const renderSpotsList = () => {
    console.log('Rendering Spots List...');
    return (
      <View style={{flex: 1}}>
        <SortingButtons/>
        {sortedView === SORTED_VIEWS.MAP_EXTENT && (
          <UpdateSpotsInMapExtentButton
            title={'Update Spots in Map Extent'}
            updateSpotsInMapExtent={updateSpotsInMapExtent}
          />
        )}
        <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, marginVertical: -5}}>
          <SearchBar
            containerStyle={{
              backgroundColor: PRIMARY_BACKGROUND_COLOR,
              borderBottomColor: 'transparent',
              borderTopColor: 'transparent',
              flex: 1,
              padding: 0,
            }}
            inputContainerStyle={{backgroundColor: PRIMARY_BACKGROUND_COLOR}}
            inputStyle={{backgroundColor: PRIMARY_BACKGROUND_COLOR, outlineStyle: 'none'}}
            onChangeText={updateSearch}
            placeholder={'Search'}
            placeholderTextColor={PRIMARY_TEXT_COLOR}
            platform={'default'}
            value={searchState}
          />
          <Button
            icon={(
              <Icon
                color={themes.PRIMARY_TEXT_COLOR}
                name={'sort'}
                type={'material'}
              />
            )}
            onPress={openPicker}
            size={'sm'}
            type={'clear'}
          />
          <Button
            icon={(
              <Icon
                color={themes.PRIMARY_TEXT_COLOR}
                name={'swap-vert'}
                type={'material'}
              />
            )}
            onPress={toggleReverseSort}
            size={'sm'}
            type={'clear'}
          />
        </View>
        <SectionDivider
          dividerText={spotsSearched.length + ' Active ' + (spotsSearched.length === 1 ? 'Spot' : 'Spots')}
        />
        <View style={{flex: 1}}>
          <FlatList
            keyExtractor={spot => spot.properties.id.toString()}
            data={isReverseSort ? [...spotsSorted].reverse() : spotsSorted}
            renderItem={({item}) => (
              <SpotsListItem
                doShowTags={true}
                isCheckedList={isCheckedList}
                onPress={onPress}
                spot={item}
              />
            )}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={renderNoSpotsText()}
          />
        </View>
        <Overlay
          isVisible={isPickerVisible}
          onBackdropPress={closePicker}
          overlayStyle={overlayStyles.overlayContainer}
        >
          <SectionDivider dividerText={'Sort'}/>
          <FlatList
            data={Object.values(SORT_ORDER)}
            renderItem={({item}) => {
              return (
                <CheckBox
                  checked={item === sortOrder}
                  checkedIcon={'check'}
                  containerStyle={{backgroundColor: SECONDARY_BACKGROUND_COLOR, borderWidth: 0}}
                  iconType={'material'}
                  onPress={() => updateSort(item)}
                  title={item}
                  titleStyle={{color: PRIMARY_TEXT_COLOR, size: PRIMARY_TEXT_SIZE}}
                  uncheckedIcon={''}
                />
              );
            }}
          />
        </Overlay>
      </View>
    );
  };

  const toggleReverseSort = () => {
    setIsReverseSort(prevState => !prevState);
  };

  const updateSearch = (search = searchState, spotsToSearch = spotsFiltered) => {
    setSearchState(search);
    let gotSpotsSearched;
    if (isEmpty(search)) gotSpotsSearched = spotsToSearch;
    else {
      gotSpotsSearched = spotsToSearch.filter(
        spot => spot.properties?.name?.toLowerCase().includes(search.toLowerCase()));
    }
    setSpotsSearched(gotSpotsSearched);
    updateSort(undefined, gotSpotsSearched);
  };

  const updateSort = (sort = sortOrder, spotsToSort = spotsSearched) => {
    setSortOrder(sort);
    let gotSpotsSorted = [...spotsToSort];
    if (sort === SORT_ORDER.ALPHABETICAL) gotSpotsSorted = useSpots.sortSpotsAlphabetically(gotSpotsSorted);
    else if (sort === SORT_ORDER.DATE_CREATED) gotSpotsSorted = useSpots.sortSpotsByDateCreated(gotSpotsSorted);
    else if (sort === SORT_ORDER.DATE_LAST_MODIFIED) gotSpotsSorted = useSpots.sortSpotsByDateLastModified(
      gotSpotsSorted);
    else if (sort === SORT_ORDER.DATE_LAST_VIEWED) gotSpotsSorted = useSpots.sortSpotsByDateLastViewed(gotSpotsSorted);
    setSpotsSorted(gotSpotsSorted);
    closePicker();
  };

  return (
    <>
      {isEmpty(activeSpots) ? renderNoSpotsText() : renderSpotsList()}
    </>
  );
};

export default SpotsList;
