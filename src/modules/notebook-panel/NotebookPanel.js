import React from 'react';
import {Animated, FlatList, Text, View} from 'react-native';

// import {FlingGestureHandler, Directions, State} from 'react-native-gesture-handler';
import {ListItem} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';
import Spacer from '../../shared/ui/Spacer';
import Geography from '../geography/Geography';
import {homeReducers, Modals} from '../home/home.constants';
import MeasurementDetailPage from '../measurements/MeasurementDetail';
import MeasurementsPage from '../measurements/Measurements';
import NotesPage from '../notes/Notes';
import SamplesPage from '../samples/SamplesNotebook';
import {useSpotsHook} from '../spots';
import {spotReducers} from '../spots/spot.constants';
import TagsPage from '../tags/TagsNotebook';
import NotebookFooter from './notebook-footer/NotebookFooter';
import NotebookHeader from './notebook-header/NotebookHeader';
import {notebookReducers, NotebookPages} from './notebook.constants';
import notebookStyles from './notebookPanel.styles';
import Overview from './Overview';

const NotebookPanel = props => {
  const [useSpots] = useSpotsHook();
  const dispatch = useDispatch();
  const recentlyViewedSpotIds = useSelector(state => state.spot.recentViews);
  const spots = useSelector(state => state.spot.spots);

  const setNotebookPageVisible = page => {
    const pageVisible = props.setNotebookPageVisible(page);
    if (pageVisible.page === NotebookPages.MEASUREMENT || pageVisible === NotebookPages.MEASUREMENTDETAIL) {
      props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS);
    }
    else if (pageVisible.page === NotebookPages.SAMPLE) props.setModalVisible(Modals.NOTEBOOK_MODALS.SAMPLE);
    else if (pageVisible.page === NotebookPages.TAG) props.setModalVisible(Modals.NOTEBOOK_MODALS.TAGS);
    else props.setModalVisible(null);
  };

  if (!isEmpty(props.spot)) {
    console.log('Selected Spot:', props.spot);

    return (
      <Animated.View
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
          {props.notebookPageVisible === NotebookPages.TAG ? <TagsPage/> : null}
        </View>
        <View style={notebookStyles.footerContainer}>
          <NotebookFooter
            openPage={(page) => setNotebookPageVisible(page)}
            onPress={(camera) => props.onPress(camera)}
          />
        </View>
      </Animated.View>
    );
  }
  else {
    const renderSpotName = (item) => {
      return (
        <ListItem
          key={item.properties.id}
          title={item.properties.name}
          chevron={true}
          onPress={() => dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: item})}
          leftAvatar={{source: useSpots.getSpotGemometryIconSource(item), size: 20}}
        />
      );
    };

    const recentlyViewedSpots = recentlyViewedSpotIds.reduce((obj, key) => {
      if (spots && spots.hasOwnProperty(key)) obj.push(spots[key]);
      return obj;
    }, []);
    return (
      <View style={notebookStyles.panel}>
        <Text style={{...commonStyles.noContentText, textAlign: 'center', paddingTop: 40}}>No Spot Currently
          Selected!</Text>
        {!isEmpty(recentlyViewedSpots) &&
        <View>
          <Spacer/>
          <Spacer/>
          <SectionDivider dividerText='Recent Spots'/>
          <FlatList
            keyExtractor={(item) => item.properties.id.toString()}
            data={recentlyViewedSpots}
            renderItem={({item}) => renderSpotName(item)}/>
        </View>
        }
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
