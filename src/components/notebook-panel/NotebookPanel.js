import React, {useState} from 'react'
import {Text, View} from 'react-native'
import {connect} from 'react-redux';
import styles from "./NotebookPanel.styles";
import NotebookHeader from './NotebookHeader';
import NotebookFooter from './NotebookFooter';
import SpotOverview from '../../spots/SpotOverview';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import SpotBasics from '../../spots/spot-page/SpotBasics';
import MeasurementPage from '../../spots/spot-measurements/Measurements';
import {SpotPages} from "./Notebook.constants";
import {SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";

const NotebookPanel = props => {
  console.log('Spot', props.selectedSpot);

  if (props.spotName) {
    const pageDisplay = async (page) => {
      props.setPageVisible(page)
    };

    return (
      <View style={styles.container}>
        <NotebookHeader
          spot={props.spotName.props.name}
          spotCoords={props.spotCoords}
          onPress={props.onPress}
          spotPageOpen={() => props.setPageVisible(SpotPages.BASIC)}
        />
        <View style={styles.subContainer}>
          {props.spotPageVisible === SpotPages.OVERVIEW ? <SpotOverview/> : null}
          {props.spotPageVisible === SpotPages.BASIC ? <SpotBasics/> : null}
          {props.spotPageVisible === SpotPages.MEASUREMENT ? <MeasurementPage spot={props.selectedSpot}/> : null}
          {props.spotPageVisible === undefined ? <SpotOverview/> : null}
        </View>
        <NotebookFooter
          openPage={(page) => pageDisplay(page)}
          onPress={(camera) => props.onPress(camera)}
        />
      </View>
    )
  }
  else {
    return (
      <View style={[styles.container, {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{fontSize: 30}}>No Spot Selected</Text>
        <ButtonNoBackground
          style={{marginTop: 40}}
          textStyle={{color: 'blue'}}
          onPress={props.closeNotebook}>Close Notebook</ButtonNoBackground>
      </View>
    )
  }
};

function mapStateToProps(state) {
  return {
    selectedSpot: state.home.selectedSpot,
    featuresSelected: state.home.featuresSelected,
    spotPageVisible: state.notebook.visiblePage
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookPanel);
