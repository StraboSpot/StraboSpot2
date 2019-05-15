import React from 'react'
import {Text, View} from 'react-native'
import {connect} from 'react-redux';
import styles from "./NotebookPanel.styles";
import headerStyle from './notebook-header/NotebookHeader.styles';
import footerStyle from './notebook-footer/NotebookFooter.styles';
import NotebookHeader from './notebook-header/NotebookHeader';
import NotebookFooter from './notebook-footer/NotebookFooter';
import SpotOverview from '../../spots/SpotOverview';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import SpotBasics from '../../spots/spot-page/SpotBasics';
import MeasurementPage from '../../spots/spot-measurements/Measurements';
import {SpotPages} from "./Notebook.constants";
import {SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";

const NotebookPanel = props => {

  if (props.spotName) {
    const pageDisplay = async (page) => {
      props.setPageVisible(page)
    };

    return (
      <View style={styles.container}>
        <View style={headerStyle.headerContainer}>
          <NotebookHeader
            onPress={props.onPress}
          />
        </View>
        <View style={styles.viewContainer}>
          {props.spotPageVisible === SpotPages.OVERVIEW ? <SpotOverview/> : null}
          {props.spotPageVisible === SpotPages.BASIC ? <SpotBasics/> : null}
          {props.spotPageVisible === SpotPages.MEASUREMENT ? <MeasurementPage/> : null}
          {props.spotPageVisible === undefined ? <SpotOverview/> : null}
        </View>
        <View style={footerStyle.footerContainer}>
          <NotebookFooter
            openPage={(page) => pageDisplay(page)}
            onPress={(camera) => props.onPress(camera)}
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
    selectedSpot: state.home.selectedSpot,
    featuresSelected: state.home.featuresSelected,
    spotPageVisible: state.notebook.visiblePage
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookPanel);
