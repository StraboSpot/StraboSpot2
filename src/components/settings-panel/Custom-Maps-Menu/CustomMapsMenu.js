import React, {Component} from 'react';
import {Alert, Image, Text, View} from 'react-native';
import styles from './CustomMapsStyles';
import {ListItem} from 'react-native-elements';
import ButtonNoBackground from '../../../ui/ButtonNoBackround';
import {ShortcutToggleButtons as Buttons} from '../SettingsMenu.constants';
import {Switch} from 'react-native-switch';
import {connect} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';

import {
  OFFLINE_MAPS,
  CURRENT_BASEMAP
} from '../../../store/Constants';


class CustomMapsMenu extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);
    console.log("Props: ", props);

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
          <Text style={styles.headingText}>Custom Maps</Text>
        </View>
        <View>
          <Text>
            
          </Text>
        </View>
      </View>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    offlineMaps: state.home.offlineMaps,
    currentBasemap: state.map.currentBasemap
  }
};

const mapDispatchToProps = {
  onOfflineMaps: (offlineMaps) => ({type: OFFLINE_MAPS, offlineMaps: offlineMaps}),
  onCurrentBasemap: (basemap) => ({type: CURRENT_BASEMAP, basemap: basemap})
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomMapsMenu);
