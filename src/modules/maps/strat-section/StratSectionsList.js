import React from 'react';
import {FlatList, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {ListItem} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {SMALL_SCREEN} from '../../../shared/styles.constants';
import alert from '../../../shared/ui/alert';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../../shared/ui/ListEmptyText';
import {setLoadingStatus} from '../../home/home.slice';
import useSpotsHook from '../../spots/useSpots';
import {setStratSection} from '../maps.slice';

const StratSectionsList = ({closeManMenuPanel}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [useSpots] = useSpotsHook();

  const spotsWithStratSection = useSpots.getSpotsWithStratSection();
  console.log('Spots with Strat Section:', spotsWithStratSection);

  const handleStratSectionPressed = (spot) => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    const stratSectionSettings = spot?.properties?.sed?.strat_section;
    if (stratSectionSettings) {
      closeManMenuPanel();
      if (SMALL_SCREEN) navigation.navigate('HomeScreen', {screen: 'Map'});
      setTimeout(() => {
        dispatch(setStratSection(stratSectionSettings));
        dispatch(setLoadingStatus({view: 'home', bool: false}));
      }, 500);
    }
    else {
      alert('Strat Section not found!');
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
  };

  const renderStratSectionItem = (spot) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        keyExtractor={(item, index) => item?.properties?.id?.toString() || index.toString()}
        onPress={() => handleStratSectionPressed(spot)}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {spot?.properties?.sed?.strat_section?.section_well_name || 'Unnamed'}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
    );
  };

  return (
    <View style={{flex: 1}}>
      <FlatList
        keyExtractor={spot => spot.properties.id.toString()}
        data={spotsWithStratSection}
        renderItem={({item}) => renderStratSectionItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Strat Sections in Active Datasets'}/>}
      />
    </View>
  );
};

export default StratSectionsList;
