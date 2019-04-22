import React from 'react'
import classes from './SpotPageStyles';
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Text,
  View,
  StyleSheet
} from 'react-native'
import * as actions from "../../store/actions";
import {
  CURRENT_BASEMAP,
  FEATURES_UPDATED,
  FEATURE_ADD,
  FEATURE_DELETE,
  FEATURE_SELECTED,
  EDIT_SPOT
} from '../../store/Constants';
import {Header, Divider, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import {Navigation} from 'react-native-navigation/lib/dist/index';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import Loading from '../../ui/Loading';

const width = Dimensions.get('window').width

class SpotPage extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      text: null
    }
  }

  async componentDidMount() {
    console.log('SpotPage mounted', actions);
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
    }

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
              {/*{this.state.text}*/}
              {this.props.selectedSpot.properties.name}
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
          <Text>Spot Name:</Text>
          <Input
            placeholder={this.props.selectedSpot.properties.name}
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
        {/*<Divider style={{width: width, height: 15, backgroundColor: 'lightgrey'}}/>*/}
      </View>
    )
  }
}


function mapStateToProps(state) {
  return {
    selectedSpot: state.home.selectedSpot,
    featureCollectionSelected: state.home.featureCollectionSelected
  }
}

const mapDispatchToProps = {
    onFeatureAdd: (feature) => ({type: FEATURE_ADD, feature: feature}),
    onSpotEdit: (field, value) => ({type: EDIT_SPOT, field: field, value: value})
}

export default connect(mapStateToProps, mapDispatchToProps)(SpotPage);
