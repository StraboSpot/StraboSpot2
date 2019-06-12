import React from 'react'
import {Text, View} from 'react-native'
import {connect} from 'react-redux';

import NotebookHeader from './notebook-header/NotebookHeader';
import NotebookFooter from './notebook-footer/NotebookFooter';
import Overview from './Overview';
import ButtonNoBackground from '../../shared/ui/ButtonNoBackround';
import Basics from './Basics';
import MeasurementPage from './notebook-measurements/Measurements';
import MeasurementDetailPage from './notebook-measurements/MeasurementDetail';
import NotesPage from '../notes/Notes.view';
import SamplesPage from '../samples/Samples.view';
import {SpotPages} from "./Notebook.constants";
import * as actionCreators from '../../store/actions/index';
import {SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import {isEmpty} from "../../shared/Helpers";

// Styles
import notebookStyles from "./NotebookPanel.styles";

const NotebookPanel = props => {

  if (!isEmpty(props.spot)) {
    const setPageVisible = page => {
      const pageVisible = props.setPageVisible(page);
      if (pageVisible.page === SpotPages.MEASUREMENT || pageVisible === SpotPages.MEASUREMENTDETAIL) {
        props.showModal('isCompassModalVisible', true);
      }
      else props.showModal('isCompassModalVisible', false);
      if (pageVisible.page === SpotPages.SAMPLE) {
        props.showModal('isSamplesModalVisible' ,true);
      }
      else props.showModal('isSamplesModalVisible', false);
    };

    return (
      <View style={notebookStyles.panel}>
        <View style={notebookStyles.headerContainer}>
          <NotebookHeader
            onPress={props.onPress}
          />
        </View>
        <View style={notebookStyles.centerContainer}>
          {props.spotPageVisible === SpotPages.OVERVIEW ? <Overview/> : null}
          {props.spotPageVisible === SpotPages.BASIC ? <Basics/> : null}
          {props.spotPageVisible === SpotPages.MEASUREMENT ? <MeasurementPage showModal={props.showModal}/> : null}
          {props.spotPageVisible === SpotPages.MEASUREMENTDETAIL ? <MeasurementDetailPage/> : null}
          {props.spotPageVisible === SpotPages.NOTE ? <NotesPage/> : null}
          {props.spotPageVisible === SpotPages.SAMPLE ? <SamplesPage showModal={props.showModal}/> : null}
          {props.spotPageVisible === undefined ? <Overview/> : null}
        </View>
        <View style={notebookStyles.footerContainer}>
          <NotebookFooter
            openPage={(page) => setPageVisible(page)}
            onPress={(camera) => props.onPress(camera)}
            // showCompass={props.showCompass}
            showModal={props.showModal}
          />
        </View>
      </View>
    )
  }
  else {
    return (
      <View style={[notebookStyles.panel, notebookStyles.noSpotContent]}>
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
    spot: state.home.selectedSpot,
    featuresSelected: state.home.featuresSelected,
    spotPageVisible: state.notebook.visiblePage
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => (actionCreators.setSpotPageVisible(page))
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookPanel);
