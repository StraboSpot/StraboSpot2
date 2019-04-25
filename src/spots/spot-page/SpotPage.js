import React from 'react'
import Aux from '../../shared/AuxWrapper';
import styles from './SpotPageStyles';
import {
  Dimensions,
  Text,
  TextInput,
  View,
} from 'react-native'
import {
  FEATURE_ADD,
  EDIT_SPOT_PROPERTIES,
  SPOTPAGE_VISIBLE
} from '../../store/Constants';
import {Button, Divider, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import {Navigation} from 'react-native-navigation/lib/dist/index';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
//import * as helper from '../../shared/HelperFunctions/SpotHelperFunctions';

const width = Dimensions.get('window').width;

class SpotPage extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    // console.log('PROPS', this.props)
    this.state = {
      spotName: null,
      lat: this.props.selectedSpot.geometry.coordinates[0],
      lng: this.props.selectedSpot.geometry.coordinates[1]
    }
  }

  componentDidMount() {
    this._isMounted = true;
    console.log('SpotPage Mounted');

    // console.log('SpotPage Mounted', this.props.featureCollectionSelected)
    // const spotData = await this.props.featureCollectionSelected.features.map(spot => {
    //   return {
    //     name: spot.properties.name,
    //     id: spot.properties.id
    //   };
    // });
    // this.setState({selectedSpot: spotData}, () => console.log(this.state.selectedSpot))
  }

  componentWillUnmount() {
    this._isMounted = false;
    console.log('SpotPage Unmounted');
  }

  changeCoords = (field, value) => {
    console.log(field, value)
    if (field === 'lat') {
      this.setState({lat: value})
    }
    else if (field === 'lng') {
      this.setState({lng: value})
    }
  };

  spotNameEdit = (text) => {
    this.setState(prevState => {
      return {
        ...prevState,
        spotName: text
      }
    }, () => console.log('spotName state:', this.state.spotName))
    // this.props.onSpotEdit('name', text)
  };

  saveSpotName = () => {
    this.props.onSpotEdit('name', this.state.spotName);
    this.setState(prevState => {
      return {
        ...prevState,
        spotName: ''
      }
    })
  };

  render() {
    // let inputValueLat = this.state.lat;
    // let inputValueLng = this.state.lng;
    let spotCoords = null;
    const spot = this.props.selectedSpot;

    if (spot.geometry.type === 'Point') {
      spotCoords =
        <Aux>
          <View >
            <Text style={[styles.spotFieldTitles, {paddingTop:15, fontSize: 14}]}>Latitude:</Text>
            <TextInput
              style={{height: 25, width: 150, borderColor: 'gray', borderBottomWidth: 1}}
              keyboardType={'decimal-pad'}
              onChangeText={(text) => this.changeCoords('lat', text)}
              value={inputValueLat.toString()}
            />
          </View>
          <View >
            <Text style={[styles.spotFieldTitles, {paddingTop:15, fontSize: 14}]}>Longitude:</Text>
            <TextInput
              style={{height: 25, width: 150, borderColor: 'gray', borderBottomWidth: 1}}
              keyboardType={'decimal-pad'}
              onChangeText={(text) => this.changeCoords('lng', text)}
              value={inputValueLng.toString()}
            />
          </View>
        </Aux>
    }

    else if (spot.geometry.type === 'Linestring' || "Polygon") {
      console.log('SpotCoords type', spot.geometry.type);
      spotCoords =
        <Aux>
          <View style={{flexDirection: 'column'}}>
            <Text style={{marginRight: 15, paddingTop: 15, fontSize: 18, fontWeight: 'bold'}}>
              Feature type ({spot.geometry.type}) has multiple coordinates.
            </Text>
          </View>
        </Aux>
    }

    return (
        <View style={styles.spotContainer}>
            <View>
              <Divider style={styles.divider}>
                <Text style={styles.spotFieldTitles}>Name:</Text>
              </Divider>
              <Input
                inputContainerStyle={{borderColor: 'transparent'}}
                placeholder={'No Name'}
                // style={{height: 40, borderColor: 'gray', borderWidth: 10}}
                onChangeText={(text) => this.props.onSpotEdit('name', text)}
                // onChangeText={(text) => this.setState({text})}
                value={this.props.selectedSpot.properties.name}
              />
            </View>
            <Divider style={styles.divider}>
              <Text style={styles.spotFieldTitles}>Geometry:</Text>
            </Divider>
            <Text style={styles.spotFieldValues}>{spot.geometry.type}</Text>
            <View>
              <Divider style={styles.divider}>
                <Text style={styles.spotFieldTitles}>Location:</Text>
              </Divider>
              <View style={styles.locationContainer}>
                {spotCoords}
              </View>
            </View>
        </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    selectedSpot: state.home.selectedSpot,
    featuresSelected: state.home.featuresSelected,
    isSpotPageVisible: state.home.isSpotPageVisible
  }
}

const mapDispatchToProps = {
  onFeatureAdd: (feature) => ({type: FEATURE_ADD, feature: feature}),
  onSpotEdit: (field, value) => ({type: EDIT_SPOT_PROPERTIES, field: field, value: value}),
  isSpotPageVisible: (visible) => ({type: SPOTPAGE_VISIBLE, visible: visible})
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotPage);
