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
  CUSTOM_MAPS
} from '../../../store/Constants';


class CustomMapsMenu extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);
    // console.log("Props: ", props);

  }

  async componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() { //return whole modal here
    console.log("PROPS: ",this.props);
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
    customMaps: state.home.customMaps
  }
};

const mapDispatchToProps = {
  onCustomMaps: (customMaps) => ({type: CUSTOM_MAPS, customMaps: customMaps})
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomMapsMenu);
