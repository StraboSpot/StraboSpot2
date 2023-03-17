import React from 'react';
import {FlatList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../../shared/ui/ListEmptyText';
import useSpotsHook from '../../spots/useSpots';
import {setStratSection} from '../maps.slice';

const StratSectionsList = () => {
  const dispatch = useDispatch();

  const [useSpots] = useSpotsHook();

  const spotsWithStratSection = useSpots.getSpotsWithStratSection();
  console.log('Spots with Strat Section:', spotsWithStratSection);

  const handleStratSectionPressed = (spot) => {
    const stratSectionSettings = spot?.properties?.sed?.strat_section;
    dispatch(setStratSection(stratSectionSettings));
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
