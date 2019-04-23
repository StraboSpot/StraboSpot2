import React from 'react'
import classes from './SpotPageStyles';
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Text,
  TextInput,
  View,
  StyleSheet
} from 'react-native'
import {
  CURRENT_BASEMAP,
  FEATURES_UPDATED,
  FEATURE_ADD,
  FEATURE_DELETE,
  FEATURE_SELECTED,
  EDIT_SPOT,
  EDIT_SPOT_PROPERTIES
} from '../../store/Constants';
import {Card, Header, Divider, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import {Navigation} from 'react-native-navigation/lib/dist/index';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import * as helper from '../../shared/HelperFunctions/SpotHelperFunctions';
import Loading from '../../ui/Loading';

const width = Dimensions.get('window').width;

class SpotPage extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    // console.log('PROPS', this.props)
    this.state = {
      text: null
    }
  }

  async componentDidMount() {
    // console.log('SpotPage mounted', actions);
    this._isMounted = true;
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
    console.log('SpotPage Unmounted');
    this._isMounted = false;
  }

  render() {
    const spot = this.props.selectedSpot;
    let selectedSpotName = null
    let getSpotCoords = this.getSpotConvertedCoords(spot);
    // console.log("AAAA", spot)
    if (spot.properties.name) {
      selectedSpotName = spot.properties.name
    }
    else {
      selectedSpotName = "Name Not Found"
    }

    const images = {
      component: {
        name: 'Images',
        passProps: {
          text: 'Pushed screen'
        },
      }
    };

    const home = {
      component: {
        name: 'Home',
        passProps: {
          text: 'Pushed screen'
        },
      }
    };

    return (
      <View>
        <View>
          <Header
            style={classes.container}
            backgroundColor={'lightgrey'}>
            <ButtonNoBackground
              iconName={'ios-arrow-back'}
              iconType={'ionicon'}
              iconStyle={{color: 'black'}}
              style={{flexDirection: 'row'}}
              textStyle={{marginLeft: 10, paddingTop: 1, fontSize: 18}}
              onPress={() => Navigation.pop(this.props.componentId)}>
              Back
            </ButtonNoBackground>
            <Text
              style={{marginBottom: 15, fontSize: 24}}
            >
              {selectedSpotName}
            </Text>
            <View style={{flexDirection: 'row'}}>
              <ButtonNoBackground
                onPress={() => Navigation.push(this.props.componentId, images)}
                style={{justifyContent: 'center',}}
                iconName={'ios-camera'}
                iconType={'ionicon'}
                size={40}
                iconStyle={{color: 'black', marginTop: 10}}/>
              <ButtonNoBackground
                onPress={() => Navigation.push(this.props.componentId, home)}
                style={{justifyContent: 'center', marginRight: 20}}
                iconName={'map-o'}
                iconType={'font-awesome'}
                size={25}
                iconStyle={{color: 'black', marginTop: 10}}/>
            </View>
          </Header>
        </View>
        <View style={classes.spotContainer}>
          <View>
            {/*<Button*/}
            {/*  title={'Save'}*/}
            {/*  onPress={(value) => this.props.onSpotEdit('[0]', value)}*/}
            {/*/>*/}
          </View>
          <Card
            containerStyle={classes.cardContainer}
            title={'Spot Info'}>
            <Text style={classes.spotFieldTitles}>Name:</Text>
            <Input
              placeholder={selectedSpotName}
              // style={{height: 40, borderColor: 'gray', borderWidth: 10}}
              onChangeText={(text) => this.props.onSpotEdit('name', text)}
              // onChangeText={(text) => this.setState({text})}
              // value={this.props.selectedSpot.properties.name}
            />
          <Button
            title={'Save'}
            onPress={() => this.setState(this.state.text)}
          />
        </View>

      </View>
    )
  }
}


function mapStateToProps(state) {
  return {
    selectedSpot: state.home.selectedSpot,
    featuresSelected: state.home.featuresSelected
  }
}

const mapDispatchToProps = {
  onFeatureAdd: (feature) => ({type: FEATURE_ADD, feature: feature}),
  onSpotEdit: (field, value) => ({type: EDIT_SPOT_PROPERTIES, field: field, value: value})
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotPage);
