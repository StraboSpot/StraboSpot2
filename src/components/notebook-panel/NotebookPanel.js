import React from 'react'
import {Text, View} from 'react-native'
import {connect} from 'react-redux';

import NotebookHeader from './notebook-header/NotebookHeader';
import NotebookFooter from './notebook-footer/NotebookFooter';
import Overview from './Overview';
import ButtonNoBackground from '../../shared/ui/ButtonNoBackround';
import MeasurementsPage from '../measurements/Measurements';
import MeasurementDetailPage from '../measurements/MeasurementDetail';
import NotesPage from '../notes/Notes.view';
import SamplesPage from '../samples/SamplesNotebook.view';
import {notebookReducers, NotebookPages} from "./Notebook.constants";
import {homeReducers, Modals} from "../../views/home/Home.constants";
import {isEmpty} from "../../shared/Helpers";

// Styles
import notebookStyles from "./NotebookPanel.styles";
import * as themes from '../../shared/styles.constants';

const NotebookPanel = props => {

  const setNotebookPageVisible = page => {
    const pageVisible = props.setNotebookPageVisible(page);
    if (pageVisible.page === NotebookPages.MEASUREMENT || pageVisible === NotebookPages.MEASUREMENTDETAIL) {
      props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS)
    }
    else if (pageVisible.page === NotebookPages.SAMPLE) {
      props.setModalVisible(Modals.NOTEBOOK_MODALS.SAMPLE)
    }
    else props.setModalVisible(null);
  };

  if (!isEmpty(props.spot)) {
    console.log('Selected Spot:', props.spot);
    return (
      <View style={[notebookStyles.panel, props.style]}>
        <View style={notebookStyles.headerContainer}>
          <NotebookHeader
            onPress={props.onPress}
          />
        </View>
        <View style={notebookStyles.centerContainer}>
          {props.notebookPageVisible === NotebookPages.OVERVIEW ? <Overview/> : null}
          {props.notebookPageVisible === NotebookPages.MEASUREMENT ? <MeasurementsPage /> : null}
          {props.notebookPageVisible === NotebookPages.MEASUREMENTDETAIL ? <MeasurementDetailPage/> : null}
          {props.notebookPageVisible === NotebookPages.NOTE ? <NotesPage/> : null}
          {props.notebookPageVisible === NotebookPages.SAMPLE ? <SamplesPage/> : null}
          {props.notebookPageVisible === undefined ? <Overview/> : null}
        </View>
        <View style={notebookStyles.footerContainer}>
          <NotebookFooter
            openPage={(page) => setNotebookPageVisible(page)}
            onPress={(camera) => props.onPress(camera)}
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
          textStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
          onPress={props.closeNotebook}>Close Notebook</ButtonNoBackground>
      </View>
    )
  }
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    featuresSelected: state.spot.featuresSelected,
    notebookPageVisible: isEmpty(state.notebook.visibleNotebookPagesStack) ? null : state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  }
}

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page }),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookPanel);
