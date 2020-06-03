import React, {useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {Button, ListItem} from 'react-native-elements';
import {connect, useDispatch} from 'react-redux';
import {mapReducers} from '../maps.constants';
import Icon from 'react-native-vector-icons/Ionicons';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import useMapHook from '../useMaps';

// Styles
import styles from './customMaps.styles';
import commonStyles from '../../../shared/common.styles';
import {settingPanelReducers} from '../../main-menu-panel/mainMenuPanel.constants';
import {isEmpty} from '../../../shared/Helpers';


const ManageCustomMaps = (props) => {
  console.log('Props: ', props);

  const [useMaps] = useMapHook();

  const dispatch = useDispatch();

  const mapTypeName = (source) => {
    let name;
    if (source === 'mapbox_styles') name = 'Mapbox Styles';
    if (source === 'map_warper') name = 'Map Warper';
    if (source === ' strabospot_mymaps') name = 'Strabospot My Maps';
    return name;
  };

  return (
    <React.Fragment>
      <View style={{}}>
        <Button
          onPress={() => useMaps.customMapDetails({})}
          containerStyle={styles.buttonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          icon={
            <Icon
              style={styles.icons}
              name={'ios-add'}
              size={35}
              color={styles.iconColor.color}/>
          }
          title={'Add new Custom Map'}
        />
      </View>
      <Divider sectionText={'current custom maps'} style={styles.header}/>
      {!isEmpty(props.customMaps) ?
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
                    <Text>
                      ({mapTypeName(item.source)})
                    </Text>
                  </Text>
                </View>
              }
            />))
          }
        </View>
        : <View style={[styles.sectionsContainer, {justifyContent: 'center', alignItems: 'center'}]}><Text>No custom
          maps</Text></View>}
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
