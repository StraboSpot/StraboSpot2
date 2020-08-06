import React from 'react';
import {Text, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {connect} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import AddButton from '../../../shared/ui/AddButton';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import {mapReducers} from '../maps.constants';
import useMapHook from '../useMaps';
import styles from './customMaps.styles';

const ManageCustomMaps = (props) => {
  const [useMaps] = useMapHook();
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
      />
      <Divider sectionText={'current custom maps'} style={styles.header}/>
      {!isEmpty(props.customMaps)
        ? (
          <View style={styles.sectionsContainer}>
            {Object.values(props.customMaps).map((item, i) => (
              <ListItem
                containerStyle={styles.list}
                bottomDivider={i < Object.values(props.customMaps).length - 1}
                key={item.id}
                onPress={() => useMaps.customMapDetails(item)}
                chevron
                title={
                  <View style={styles.itemContainer}>
                    <Text style={styles.itemTextStyle}>{item.title}</Text>
                  </View>
                }
                subtitle={
                  <View style={styles.itemSubContainer}>
                    <Text style={styles.itemSubTextStyle}>
                      <Text>({mapTypeName(item.source)})</Text>
                    </Text>
                  </View>
                }
              />))
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

const mapStateToProps = (state) => {
  return {
    customMaps: state.map.customMaps,
    currentBasemap: state.map.currentBasemap,
    user: state.user,
  };
};

const mapDispatchToProps = {
  onCurrentBasemap: (basemap) => ({type: mapReducers.CURRENT_BASEMAP, basemap: basemap}),
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageCustomMaps);
