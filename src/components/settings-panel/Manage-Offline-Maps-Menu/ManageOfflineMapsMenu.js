import React, {Component} from 'react';
import {Alert, Image, Text, View} from 'react-native';
import styles from './ManageOfflineStyles';
import {ListItem} from 'react-native-elements';
import ButtonNoBackground from '../../../shared/ui/ButtonNoBackround';
import {ShortcutToggleButtons as Buttons} from '../SettingsMenu.constants';
import {Switch} from 'react-native-switch';
import {connect} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';
import {mapReducers} from "../../maps/Map.constants";
import {isEmpty} from "../../../shared/Helpers";

var RNFS = require('react-native-fs');

class ManageOfflineMapsMenu extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    console.log("Props: ", props);

    let dirs = RNFetchBlob.fs.dirs;
    this.devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
    this.tilesDirectory = '/StraboSpotTiles';
    this.tileCacheDirectory = this.devicePath + this.tilesDirectory + '/TileCache';

    console.log("tileCacheDirectory: ", this.tileCacheDirectory);

  }

  async componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() { //return whole modal here
    return (

      <View style={styles.container}>
        <View>
          <ButtonNoBackground
            style={styles.button}
            onPress={this.props.onPress}
            name={'ios-arrow-back'}
            size={20}
            color={'#407ad9'}
          >
            <Text style={styles.textStyle}>Settings</Text>
          </ButtonNoBackground>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.headingText}>Manage Offline Maps</Text>
        </View>
        <View>
          {!isEmpty(this.props.offlineMaps) ? (this.props.offlineMaps.map((item,i) => <ListItem
              containerStyle={{backgroundColor: 'transparent', padding: 0}}
              key={item.saveId}
              title={
                <View style={styles.itemContainer}>
                  <Text style={styles.itemTextStyle}>{item.name}</Text>
                </View>
              }
              subtitle={
                <View style={styles.itemSubContainer}>
                  <Text style={styles.itemSubTextStyle}>
                    <Text>
                      ({item.count} tiles)
                    </Text>
                    <Text onPress={() => this.viewOfflineMap(item)} style={styles.buttonPadding}>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;View
                    </Text>
                    <Text onPress={() => this.confirmDeleteMap(item)} style={styles.buttonPadding}>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Delete
                    </Text>
                  </Text>
                </View>
              }
            />)) : null}
        </View>
      </View>
    );
  }

  viewOfflineMap = async (map) => {

    console.log('viewOfflineMap: ', map);

    tileJSON = 'file://' + this.tileCacheDirectory + '/' + map.saveId + '/tiles/{z}_{x}_{y}.png';

    console.log("tileJSON: ", tileJSON);

    //change id to force layer reload
    tempCurrentBasemap =
    {
      id: 'null',
      layerId: map.saveId,
      layerLabel: map.name,
      layerSaveId: map.saveId,
      url: tileJSON,
      maxZoom: 19
    };
    await this.props.onCurrentBasemap(tempCurrentBasemap);


    tempCurrentBasemap =
    {
      id: map.appId,
      layerId: map.saveId,
      layerLabel: map.name,
      layerSaveId: map.saveId,
      url: tileJSON,
      maxZoom: 19
    };

    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    await this.props.onCurrentBasemap(tempCurrentBasemap);
    this.props.closeSettingsDrawer();
  }

  confirmDeleteMap = async (map) => {
    console.log(map);
    Alert.alert(
      'Delete Offline Map',
      'Are your sure you want to delete ' + map.name + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => this.deleteMap(map.saveId)
        },
      ],
      {cancelable: false},
    );
  };

  deleteMap = async (map) => {
    console.log('Deleting Map Here');
    console.log("map: ",map);
    console.log("directory: ", this.tileCacheDirectory + '/' + map);
    let folderExists = await RNFS.exists(this.tileCacheDirectory + '/' + map);

    //first, delete folder with tiles
    if(folderExists){
      await RNFS.unlink(this.tileCacheDirectory + '/' + map);
    }

    //now, delete map from Redux
    currentOfflineMaps = this.props.offlineMaps;

    //now check for existence of AsyncStorage offlineMapsData and store new count
    if(!currentOfflineMaps){
      currentOfflineMaps=[];
    }

    let newOfflineMapsData = [];

    //loop over offlineMapsData and add any other maps (not current)
    for(let i = 0; i < currentOfflineMaps.length; i++){
      if(currentOfflineMaps[i].saveId){
        if(currentOfflineMaps[i].saveId != map){
          //Add it to new array for Redux Storage
          newOfflineMapsData.push(currentOfflineMaps[i]);
        }
      }
    }

    await this.props.onOfflineMaps(newOfflineMapsData);
    console.log("Saved offlineMaps to Redux.");

  }
}

const mapStateToProps = (state) => {
  return {
    offlineMaps: state.map.offlineMaps,
    currentBasemap: state.map.currentBasemap
  }
};

const mapDispatchToProps = {
  onOfflineMaps: (offlineMaps) => ({type: mapReducers.OFFLINE_MAPS, offlineMaps: offlineMaps}),
  onCurrentBasemap: (basemap) => ({type: mapReducers.CURRENT_BASEMAP, basemap: basemap})
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageOfflineMapsMenu);
