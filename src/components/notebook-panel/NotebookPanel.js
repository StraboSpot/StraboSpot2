import React from 'react'
import {Text, View} from 'react-native'
import {connect} from 'react-redux';
import styles from "./NotebookPanel.styles";
import headerStyle from './notebook-header/NotebookHeader.styles';
import footerStyle from './notebook-footer/NotebookFooter.styles';
import NotebookHeader from './notebook-header/NotebookHeader';
import NotebookFooter from './notebook-footer/NotebookFooter';
import Overview from './Overview';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import Basics from './Basics';
import MeasurementPage from './notebook-measurements/Measurements';
import MeasurementDetailPage from './notebook-measurements/MeasurementDetail';
import {SpotPages} from "./Notebook.constants";
import {SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";

const NotebookPanel = props => {

  if (Object.getOwnPropertyNames(props.spot).length !== 0) {
    const pageDisplay = async (page) => {
      const pageVisible = props.setPageVisible(page);
      if (pageVisible.page === SpotPages.MEASUREMENT) {
          props.showCompass(true)
      }
      if (pageVisible.page !== SpotPages.MEASUREMENT) props.showCompass(false);
    };

    return (
      <View style={styles.container}>
        <View style={headerStyle.headerContainer}>
          <NotebookHeader
            onPress={props.onPress}
          />
        </View>
        <View style={styles.viewContainer}>
          {props.spotPageVisible === SpotPages.OVERVIEW ? <Overview/> : null}
          {props.spotPageVisible === SpotPages.BASIC ? <Basics/> : null}
          {props.spotPageVisible === SpotPages.MEASUREMENT ? <MeasurementPage showCompass={props.showCompass}/> : null}
          {props.spotPageVisible === SpotPages.MEASUREMENTDETAIL ? <MeasurementDetailPage/> : null}
          {props.spotPageVisible === undefined ? <Overview/> : null}
        </View>
        <View style={footerStyle.footerContainer}>
          <NotebookFooter
            openPage={(page) => pageDisplay(page)}
            onPress={(camera) => props.onPress(camera)}
            showCompass={props.showCompass}
          />
        </View>
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
    spot: state.home.selectedSpot,
    featuresSelected: state.home.featuresSelected,
    spotPageVisible: state.notebook.visiblePage
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookPanel);
