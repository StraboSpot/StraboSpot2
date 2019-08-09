import React from 'react';
import {Text, View, ScrollView} from 'react-native';
import {connect} from "react-redux";
import styles from './NotebookPanel.styles';
import ButtonNoBackground from "../../shared/ui/ButtonNoBackround";
import * as themes from "../../shared/styles.constants";
import {ListItem} from "react-native-elements";
import {spotReducers} from "../../spots/Spot.constants";

const allSpotsView = (props) => {

  const pressHandler = (id) => {
    console.log(id);
    const spot = props.allSpots.filter(selectedSpot => {
      return selectedSpot.properties.id === id;
    });
    console.log(spot[0]);
    props.onFeatureSelected(spot[0])
  };

  return (
    <React.Fragment>
      {/*<Text style={{textAlign: 'center'}}>All Spots</Text>*/}
      {/*<ButtonNoBackground*/}
      {/*  style={{marginTop: 10, marginBottom: 5}}*/}
      {/*  textStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 18}}*/}
      {/*  onPress={props.close}>Close</ButtonNoBackground>*/}
      <ScrollView>
      {props.allSpots.map(spot => {
        // console.log(spot);
        return (
            <ListItem
              key={spot.properties.id}
              title={spot.properties.name}
              titleStyle={{fontSize: 14}}
              subtitle={spot.geometry.type}
              subtitleStyle={{fontSize: 12}}
              containerStyle={{paddingTop: 5}}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: themes.LIGHTGREY,
                padding: 10,
                paddingTop: 20,
                paddingBottom: 20
              }}
              onPress={() => pressHandler(spot.properties.id)}
            />
        )
      })}
      </ScrollView>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    allSpots: state.spot.features
  }
};

const mapDispatchToProps = {
  onFeatureSelected: (featureSelected) => ({type: spotReducers.FEATURE_SELECTED, feature: featureSelected}),
};

export default connect(mapStateToProps, mapDispatchToProps)(allSpotsView);
