import React, {Component} from 'react';
import {Image, Text, View} from 'react-native';
import styles from './ManageOfflineStyles';
import {ListItem} from 'react-native-elements';
import ButtonNoBackground from '../../../ui/ButtonNoBackround';
import {ShortcutToggleButtons as Buttons} from '../SettingsMenu.constants';
import {Switch} from 'react-native-switch';
import {connect} from 'react-redux';

import {
  OFFLINE_MAPS
} from '../../../store/Constants';

class ManageOfflineMapsMenu extends Component {
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
          <Text style={styles.headingText}>Manage Offline BaseMaps</Text>
        </View>
        <View>
          {
            this.props.offlineMaps.map((item,i) => <ListItem
              containerStyle={{backgroundColor: 'transparent', padding: 0}}
              key="foo"
              title={
                <View style={styles.itemContainer}>
                  <Text style={styles.itemTextStyle}>{item.name} ({item.count} tiles)</Text>
                </View>}
            />)
          }
        </View>
      </View>
    );
  }
}



const mapStateToProps = (state) => {
  return {
    offlineMaps: state.home.offlineMaps
  }
};

const mapDispatchToProps = {
  onDeleteOfflineMap: (offlineMap) => ({type: DELETE_OFFLINE_MAP, offlineMaps: offlineMaps})
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageOfflineMapsMenu);




//export default ManageOfflineMapsMenu;
