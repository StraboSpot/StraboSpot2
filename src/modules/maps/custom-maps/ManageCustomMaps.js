import React, {useEffect} from 'react';
import {Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import AddButton from '../../../shared/ui/AddButton';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import useMapHook from '../useMaps';
import styles from './customMaps.styles';

const ManageCustomMaps = (props) => {
  const customMaps = useSelector(state => state.map.customMaps);
  const isOnline = useSelector(state => state.home.isOnline);
  const [useMaps] = useMapHook();

  useEffect(() => {
    console.log('Is Online in ManageCustomMaps');
  }, [isOnline]);

  const mapTypeName = (source) => {
    let name;
    if (source === 'mapbox_styles') name = 'Mapbox Styles';
    if (source === 'map_warper') name = 'Map Warper';
    if (source === 'strabospot_mymaps') name = 'Strabospot My Maps';
    return name;
  };

  return (
    <React.Fragment>
      <AddButton
        onPress={() => useMaps.customMapDetails({})}
        title={'Add new Custom Map'}
        type={'outline'}
      />
      <Divider sectionText={'current custom maps'} style={styles.header}/>
      {!isEmpty(customMaps)
        ? (
          <View>
            {Object.values(customMaps).map((item, i) => (
              <ListItem
                containerStyle={styles.list}
                bottomDivider={i < Object.values(customMaps).length - 1}
                key={item.id}
                onPress={() => useMaps.customMapDetails(item)}>
                <ListItem.Content>
                  <View style={styles.itemContainer}>
                    <ListItem.Title style={styles.itemTextStyle}>{item.title}</ListItem.Title>
                  </View>
                  <View style={styles.itemSubContainer}>
                    <ListItem.Subtitle style={styles.itemSubTextStyle}>({mapTypeName(
                      item.source)} - {item.id})</ListItem.Subtitle>
                    <Button
                      disabled={!isOnline}
                      titleStyle={commonStyles.viewMapsButtonText}
                      type={'clear'}
                      containerStyle={{paddingLeft: 20}}
                      icon={{
                        name: isOnline ? 'map-outline' : 'cloud-offline',
                        type: 'ionicon',
                        color: 'blue',
                      }}
                      onPress={async () => {
                        const baseMap = await useMaps.setBasemap(item.id);
                        setTimeout(() => props.zoomToCustomMap(baseMap.bbox), 1000);
                      }}
                    />
                  </View>
                </ListItem.Content>
                <ListItem.Chevron/>
              </ListItem>
            ))
            }
          </View>
        ) : (
          <View style={[styles.sectionsContainer, {justifyContent: 'center', alignItems: 'center'}]}>
            <Text>No custom maps</Text>
          </View>
        )
      }
    </React.Fragment>
  );
};

export default ManageCustomMaps;
