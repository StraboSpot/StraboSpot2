import React from 'react'
import Aux from '../../shared/AuxWrapper';
import styles from './SpotPageStyles';
import {
  Platform,
  Dimensions,
  Text,
  TextInput,
  View,
} from 'react-native'
import {
  FEATURE_ADD,
  EDIT_SPOT_PROPERTIES,
  SET_SPOT_PAGE_VISIBLE
} from '../../store/Constants';
import {spotReducers} from "../../spots/Spot.constants";
import * as actionCreators from '../../store/actions/index';
import {SpotPages} from "./Notebook.constants";
import {Button, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import SectionDivider from '../../shared/ui/SectionDivider';

const width = Dimensions.get('window').width;

class Basics extends React.Component {
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
    console.log('Basics Mounted', Platform);

    // console.log('Basics Mounted', this.props.featureCollectionSelected)
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
    console.log('Basics Unmounted');
  }

  changeCoords = (field, value) => {
    console.log(field, value);
    if (field === 'lat') {
      this.setState(prevState => {
        return {
          ...prevState,
          lat: value
        }
      })
    }
    else if (field === 'lng') {
      this.setState(prevState => {
        return {
          ...prevState,
          lng: value
        }
      })
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
    let spotCoords = null;
    const spot = this.props.selectedSpot;

    if (spot.geometry.type === 'Point') {
      spotCoords =
        <Aux>
          <View>
            <Text style={styles.spotFieldValues}>Latitude:</Text>
            <TextInput
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'decimal-pad'}
              onChangeText={(text) => this.changeCoords('lat', text)}
              value={JSON.stringify(this.state.lat)}
            />
          </View>
          <View>
            <Text style={styles.spotFieldValues}>Longitude:</Text>
            <TextInput
              keyboardType={'numbers-and-punctuation'}
              onChangeText={(text) => this.changeCoords('lng', text)}
              value={JSON.stringify(this.state.lng)}
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
        <View style={{flexDirection: 'row', alignContent: 'space-between'}}>
          <Button
            icon={{
              name: 'arrow-back',
              size: 20,
              color: 'black'
            }}
            containerStyle={{marginTop: 10}}
            titleStyle={{color: 'blue'}}
            title={'Return to Overview'}
            type={'clear'}
            onPress={() => this.props.setPageVisible(SpotPages.OVERVIEW)}
          />
          <Button
            containerStyle={{marginTop: 10, marginLeft: 125}}
            iconRight
            titleStyle={{color: 'blue'}}
            title={'Save Changes'}
            type={'clear'}
            onPress={() => this.saveSpotName()}
          />
        </View>
        <SectionDivider dividerText={this.props.spotPageVisible}/>
        <Input
          inputStyle={styles.spotFieldValues}
          inputContainerStyle={{borderColor: 'transparent'}}
          placeholder={this.props.selectedSpot.properties.name}
          // style={{height: 40, borderColor: 'gray', borderWidth: 10}}
          onChangeText={(text) => this.spotNameEdit(text)}
          // onChangeText={(text) => this.setState({text})}
          value={this.state.spotName}
        />
        <SectionDivider dividerText='Geography'/>
        <View style={{borderBottomWidth: 1, borderBottomColor: 'black'}}>
          <Text style={styles.spotFieldTitles}>Geometry:</Text>
          <Text style={[styles.spotFieldValues]}> {spot.geometry.type}</Text>
        </View>
        <View>
          <Text style={styles.spotFieldTitles}>Location:</Text>
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
    selectedSpot: state.spot.selectedSpot,
    featuresSelected: state.spot.featuresSelected,
    spotPageVisible: state.notebook.visiblePage

  }
}

const mapDispatchToProps = {
  onFeatureAdd: (feature) => ({type: spotReducers.FEATURE_ADD, feature: feature}),
  onSpotEdit: (field, value) => (actionCreators.addFeature(field, value)),
  // onSpotEdit: (field, value) => ({type: EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setPageVisible: (page) => ({type: spotReducers.SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(Basics);
