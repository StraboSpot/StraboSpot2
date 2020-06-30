import React from 'react';
import {Animated, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {FlingGestureHandler, Directions, State} from 'react-native-gesture-handler';

// Components
import Geography from '../geography/Geography';
import MeasurementDetailPage from '../measurements/MeasurementDetail';
import MeasurementsPage from '../measurements/Measurements';
import NotebookFooter from './notebook-footer/NotebookFooter';
import NotebookHeader from './notebook-header/NotebookHeader';
import NotesPage from '../notes/Notes';
import Overview from './Overview';
import SamplesPage from '../samples/SamplesNotebook';
import Spacer from '../../shared/ui/Spacer';

// Constants
import {homeReducers, Modals} from '../home/home.constants';
import {notebookReducers, NotebookPages} from './notebook.constants';

// Utilities
import {isEmpty} from '../../shared/Helpers';

// Styles
import commonStyles from '../../shared/common.styles';
import notebookStyles from './notebookPanel.styles';

const NotebookPanel = props => {
  const setNotebookPageVisible = page => {
    const pageVisible = props.setNotebookPageVisible(page);
    if (pageVisible.page === NotebookPages.MEASUREMENT || pageVisible === NotebookPages.MEASUREMENTDETAIL) {
      props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS);
    }
    else if (pageVisible.page === NotebookPages.SAMPLE) props.setModalVisible(Modals.NOTEBOOK_MODALS.SAMPLE);
    else props.setModalVisible(null);
  };

  const _onRightFlingHandlerStateChange = ({nativeEvent}) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      props.setAllSpotsPanelVisible(false);
      // animatePanels(animation, 250)
    }
  };

  const _onLeftFlingHandlerStateChange = ({nativeEvent}) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      props.setAllSpotsPanelVisible(true);
      // animatePanels(animation, 125)
    }
  };

  if (!isEmpty(props.spot)) {
    console.log('Selected Spot:', props.spot);

    return (
      <FlingGestureHandler
        direction={Directions.RIGHT}
        numberOfPointers={2}
        onHandlerStateChange={(ev) => _onRightFlingHandlerStateChange(ev)}
      >
        <FlingGestureHandler
          direction={Directions.LEFT}
          numberOfPointers={1}
          onHandlerStateChange={(ev) => _onLeftFlingHandlerStateChange(ev)}
        >
          <Animated.View
            // style={props.isAllSpotsPanelVisible ? [notebookStyles.panel, {marginRight: 125}] : notebookStyles.panel}
            style={props.isAllSpotsPanelVisible ? [notebookStyles.panel, {right: 125}] : notebookStyles.panel}
          >
            <View
              style={notebookStyles.headerContainer}>
              <NotebookHeader
                onPress={props.onPress}
              />
            </View>
            <View
              style={notebookStyles.centerContainer}>
              {props.notebookPageVisible === NotebookPages.OVERVIEW ||
              props.notebookPageVisible === undefined ? <Overview/> : null}
              {props.notebookPageVisible === NotebookPages.GEOGRAPHY ? <Geography/> : null}
              {props.notebookPageVisible === NotebookPages.MEASUREMENT ? <MeasurementsPage/> : null}
              {props.notebookPageVisible === NotebookPages.MEASUREMENTDETAIL ? <MeasurementDetailPage/> : null}
              {props.notebookPageVisible === NotebookPages.NOTE ? <NotesPage/> : null}
              {props.notebookPageVisible === NotebookPages.SAMPLE ? <SamplesPage/> : null}
            </View>
            <View style={notebookStyles.footerContainer}>
              <NotebookFooter
                openPage={(page) => setNotebookPageVisible(page)}
                onPress={(camera) => props.onPress(camera)}
              />
            </View>
          </Animated.View>
        </FlingGestureHandler>
      </FlingGestureHandler>
    );
  }
  else {
    return (
      <View style={[notebookStyles.panel, commonStyles.noContentContainer]}>
        <Text style={commonStyles.noContentText}>No Spot Selected!</Text>
        <Spacer/>
        <Text style={commonStyles.noContentText}>Please select a spot.</Text>
        <Text style={commonStyles.noContentText}>To close swipe RIGHT</Text>
      </View>
    );
  }
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    selectedSpots: state.spot.selectedSpots,
    isAllSpotsPanelVisible: state.home.isAllSpotsPanelVisible,
    notebookPageVisible: isEmpty(state.notebook.visibleNotebookPagesStack) ?
      null : state.notebook.visibleNotebookPagesStack.slice(-1)[0],
  };
}

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setAllSpotsPanelVisible: (value) => ({type: homeReducers.SET_ALLSPOTS_PANEL_VISIBLE, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookPanel);
