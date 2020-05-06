import React, {Component} from 'react';
import {Alert, Text, View} from 'react-native';
import styles from './manageOfflineMaps.styles';
import {ListItem} from 'react-native-elements';
import {connect} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';
import {mapReducers} from '../maps.constants';
import {isEmpty} from '../../../shared/Helpers';

var RNFS = require('react-native-fs');

class ManageOfflineMapsMenu extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    console.log('Props: ', props);

    let dirs = RNFetchBlob.fs.dirs;
    this.devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
    this.tilesDirectory = '/StraboSpotTiles';
    this.tileCacheDirectory = this.devicePath + this.tilesDirectory + '/TileCache';
    this.zipsDirectory = this.devicePath + this.tilesDirectory + '/TileZips';
    this.tileTempDirectory = this.devicePath + this.tilesDirectory + '/TileTemp';

    console.log('tileCacheDirectory: ', this.tileCacheDirectory);

  }

  async componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() { //return whole modal here
    return (
      <React.Fragment>
        {!isEmpty(this.props.offlineMaps) ? (Object.values(this.props.offlineMaps).map((item, i) =>
            <ListItem
              containerStyle={{backgroundColor: 'transparent', padding: 0, borderBottomWidth: 1}}
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
            />)) :
          <View style={{alignItems: 'center', paddingTop: 20}}>
            <Text>No Offline Maps</Text>
          </View>}
      </React.Fragment>
    );
  }

  viewOfflineMap = async (map) => {
    let tempCurrentBasemap;
    console.log('viewOfflineMap: ', map);
    let tileJSON = 'file://' + this.tileCacheDirectory + '/' + map.saveId + '/tiles/{z}_{x}_{y}.png';
    console.log('tileJSON: ', tileJSON);
    //change id to force layer reload
    tempCurrentBasemap =
      {
        id: 'null',
        layerId: map.saveId,
        layerLabel: map.name,
        layerSaveId: map.saveId,
        url: tileJSON,
        maxZoom: 19,
      };
    await this.props.onCurrentBasemap(tempCurrentBasemap);
    tempCurrentBasemap =
      {
        id: map.appId,
        layerId: map.saveId,
        layerLabel: map.name,
        layerSaveId: map.saveId,
        url: tileJSON,
        maxZoom: 19,
      };

    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    await this.props.onCurrentBasemap(tempCurrentBasemap);
    // this.props.closeSettingsDrawer();
  };

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
          onPress: () => this.deleteMap(map),
        },
      ],
      {cancelable: false},
    );
  };

  deleteMap = async (map) => {
    console.log('Deleting Map Here');
    console.log('map: ', map.saveId);
    console.log('directory: ', this.tileCacheDirectory + '/' + map.saveId);
    let folderExists = await RNFS.exists(this.tileCacheDirectory + '/' + map.saveId);
    const zipFileExists = await RNFS.exists(this.zipsDirectory + '/' + map.mapId + '.zip');
    const tileTempFileExists = await RNFS.exists(this.tileTempDirectory + '/' + map.mapId);
    console.log(folderExists, zipFileExists, tileTempFileExists);
    //first, delete folder with tiles
    if (folderExists || zipFileExists || tileTempFileExists) {
      await RNFS.unlink(this.tileCacheDirectory + '/' + map.saveId);
      if (zipFileExists) await RNFS.unlink(this.zipsDirectory + '/' + map.mapId + '.zip');
      if (tileTempFileExists) await RNFS.unlink(this.tileTempDirectory + '/' + map.mapId);
    }

    //now, delete map from Redux
    let keyToDelete;
    let currentOfflineMaps = this.props.offlineMaps;
    Object.entries(currentOfflineMaps).forEach(([key, value]) => {
      if (value.mapId === map.mapId) keyToDelete = key;
    });

    console.log(keyToDelete);
    delete currentOfflineMaps[keyToDelete];
    console.log(currentOfflineMaps);

    await this.props.onOfflineMaps(currentOfflineMaps);
    console.log('Saved offlineMaps to Redux.');
  };
}

const mapStateToProps = (state) => {
  return {
    offlineMaps: state.map.offlineMaps,
    currentBasemap: state.map.currentBasemap,
  };
};

const mapDispatchToProps = {
  onOfflineMaps: (offlineMaps) => ({type: mapReducers.OFFLINE_MAPS, offlineMaps: offlineMaps}),
  onCurrentBasemap: (basemap) => ({type: mapReducers.CURRENT_BASEMAP, basemap: basemap}),
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageOfflineMapsMenu);
