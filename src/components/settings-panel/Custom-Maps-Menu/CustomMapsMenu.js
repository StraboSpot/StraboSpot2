import React, {Component} from 'react';
import {Alert, Image, Picker, Text, View} from 'react-native';
import styles from './CustomMapsStyles';
import {ListItem} from 'react-native-elements';
import ButtonNoBackground from '../../../ui/ButtonNoBackround';
import {ShortcutToggleButtons as Buttons} from '../SettingsMenu.constants';
import {Switch} from 'react-native-switch';
import {connect} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';
import {Button, Divider, Input} from 'react-native-elements';

import {
  CUSTOM_MAPS
} from '../../../store/Constants';


class CustomMapsMenu extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);
    console.log("Props: ", props);

    this.state = {
      showFrontPage: true,
      showNewMapSelect: false,
      showForm: false,
      showLoadingMenu: false,
      chosenForm: '',
      maptitle: '',
      mapIdLabel: '',
      mapId: '',
      accessToken: ''
    };

    this.mapTypes = [
      "Select...",
      "Mapbox Style",
      "Map Warper",
      "StraboSpot MyMaps"
    ]
  }

  async componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  showMapPicker = () => {
    this.setState({showFrontPage: false});
    this.setState({showNewMapSelect: true});
  }

  updateForm = (chosenForm) => {
    console.log("chosen form: ", chosenForm);
    this.setState({showNewMapSelect: false});
    this.setState({chosenForm: chosenForm});

    switch(chosenForm){
      case 'Mapbox Style':
        this.setState({mapIdLabel: 'Style URL'});
        break;
      case 'Map Warper':
        this.setState({mapIdLabel: '5 Digit Map ID'});
        break;
      case 'StraboSpot MyMaps':
        this.setState({mapIdLabel: 'Strabo Map ID'});
        break;
      default:
        this.setState({mapIdLabel: 'Error!'});
    }

    this.setState({showForm: true});
  }

  mapTitleEdit = (text) => {
    this.setState(prevState => {
      return {
        ...prevState,
        mapTitle: text
      }
    }, () => console.log('mapTitle state:', this.state.mapTitle))
  };

  mapIdEdit = (text) => {
    this.setState(prevState => {
      return {
        ...prevState,
        mapId: text
      }
    }, () => console.log('mapId state:', this.state.mapId))
  };

  accessTokenEdit = (text) => {
    this.setState(prevState => {
      return {
        ...prevState,
        accessToken: text
      }
    }, () => console.log('accessToken state:', this.state.accessToken))
  };

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


        { this.state.showFrontPage &&
        <View style={{alignItems: 'center'}}>
          <Text style={styles.headingText}>Custom Maps</Text>
        </View>
        }

        { this.state.showFrontPage && this.props.customMaps &&
          <View>
            <Text>
              custom maps exist.
            </Text>
          </View>
        }

        { this.state.showFrontPage && !this.props.customMaps &&
          <View style={styles.centertext}>
            <Text>
              No custom maps yet.
            </Text>
          </View>
        }

        { this.state.showNewMapSelect &&
        <View>

          <View style={{alignItems: 'center'}}>
            <Text style={styles.headingText}>Select Map Type:</Text>
          </View>

          <Picker
            selectedValue=""
            onValueChange={(mapSelectorType) => this.updateForm(mapSelectorType)}
            style={styles.picker}>
            {
          		this.mapTypes.map(function(i){
          		return     <Picker.Item
                                label={i}
                                value={i}
                                key={i}
                            />
          		})
        		}
          </Picker>

        </View>
        }



        { this.state.showForm &&
        <View>
          <View style={{alignItems: 'center', paddingBottom: 10}}>
            <Text style={styles.headingText}>New {this.state.chosenForm}:</Text>
          </View>

          <Divider style={styles.divider}>
            <Text style={styles.dividerText}>My Map Title</Text>
          </Divider>
          <Input
            placeholder='enter map title...'
            onChangeText={(text) => this.mapTitleEdit(text)}
            value={this.state.mapTitle}
          />

          <Divider style={styles.divider}>
            <Text style={styles.dividerText}>{this.state.mapIdLabel}</Text>
          </Divider>
          <Input
            placeholder={'enter ' + this.state.mapIdLabel + '...'}
            onChangeText={(text) => this.mapIdEdit(text)}
            value={this.state.mapId}
          />
        </View>
        }


        { this.state.chosenForm == 'Mapbox Style' &&
          <View>
          <Divider style={styles.divider}>
            <Text style={styles.dividerText}>Access Token</Text>
          </Divider>
          <Input
            placeholder={'enter Access Token...'}
            onChangeText={(text) => this.accessTokenEdit(text)}
            value={this.state.accessToken}
          />
          </View>
        }

        { this.state.mapTitle != '' && this.state.mapId != '' &&
          <View>
            <Text>
              Put Button Here
            </Text>
          </View>
        }

        { this.state.showFrontPage &&
          <View style={{flex: 1}}>
            <ButtonNoBackground
              onPress={this.showMapPicker}
              name={'ios-arrow-back'}
              size={20}
              color={'#407ad9'}
            >
            <Text style={styles.rightlink}>
              Add New Map
            </Text>
            </ButtonNoBackground>
          </View>
        }



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
