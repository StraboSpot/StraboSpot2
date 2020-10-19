import React from 'react';
import {Animated, FlatList, Text, View} from 'react-native';

// import {FlingGestureHandler, Directions, State} from 'react-native-gesture-handler';
import {Avatar, Button, ListItem} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';
import Spacer from '../../shared/ui/Spacer';
import Geography from '../geography/Geography';
import {Modals} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {ImagesPage} from '../images';
import MeasurementDetailPage from '../measurements/MeasurementDetail';
import MeasurementsPage from '../measurements/Measurements';
import Nesting from '../nesting/Nesting';
import NotesPage from '../notes/Notes';
import SamplesPage from '../samples/SamplesNotebook';
import {useSpotsHook} from '../spots';
import {spotReducers} from '../spots/spot.constants';
import TagsPage from '../tags/TagsNotebook';
import NotebookFooter from './notebook-footer/NotebookFooter';
import NotebookHeader from './notebook-header/NotebookHeader';
import {NotebookPages, SECONDARY_NOTEBOOK_PAGES, SED_NOTEBOOK_PAGES} from './notebook.constants';
import {setNotebookPageVisible} from './notebook.slice';
import notebookStyles from './notebookPanel.styles';
import Overview from './Overview';
import PlaceholderPage from './PlaceholderPage';

const NotebookPanel = props => {
  const [useSpots] = useSpotsHook();
  const dispatch = useDispatch();
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);
  const recentlyViewedSpotIds = useSelector(state => state.spot.recentViews);
  const isAllSpotsPanelVisible = useSelector(state => state.home.isAllSpotsPanelVisible);
  const spots = useSelector(state => state.spot.spots);

  const notebookPageVisible = page => {
    dispatch(setNotebookPageVisible(page));
    if (page === NotebookPages.MEASUREMENT || page === NotebookPages.MEASUREMENTDETAIL) {
      dispatch(setModalVisible({modal: Modals.NOTEBOOK_MODALS.COMPASS}));
    }
    else if (page === NotebookPages.SAMPLE) dispatch(setModalVisible({modal: Modals.NOTEBOOK_MODALS.SAMPLE}));
    else if (page === NotebookPages.TAG) dispatch(setModalVisible({modal: Modals.NOTEBOOK_MODALS.TAGS}));
    else dispatch(setModalVisible({modal: null}));
  };

  if (!isEmpty(props.spot)) {
    console.log('Selected Spot:', props.spot);
    return (
      <Animated.View
        style={isAllSpotsPanelVisible ? [notebookStyles.panel, {right: 125}] : notebookStyles.panel}
      >
        <View
          style={notebookStyles.headerContainer}>
          <NotebookHeader
            onPress={props.onPress}
          />
        </View>
        <View
          style={notebookStyles.centerContainer}>

          {/*Main Overview Page*/}
          {(pageVisible === NotebookPages.OVERVIEW || pageVisible === undefined)
          && <Overview openMainMenu={props.openMainMenu}/>}

          {/*Primary Pages*/}
          {pageVisible === NotebookPages.MEASUREMENT && <MeasurementsPage/>}
          {pageVisible === NotebookPages.NOTE && <NotesPage/>}
          {pageVisible === NotebookPages.SAMPLE && <SamplesPage/>}
          {pageVisible === NotebookPages.TAG && <TagsPage openMainMenu={props.openMainMenu}/>}
          {pageVisible === NotebookPages.PHOTO && <ImagesPage onPress={props.onPress}/>}

          {/*Additional Notebook Pages*/}
          {pageVisible === NotebookPages.GEOGRAPHY && <Geography/>}
          {pageVisible === NotebookPages.MEASUREMENTDETAIL && <MeasurementDetailPage/>}
          {pageVisible === NotebookPages.NESTING && <Nesting/>}

          {/*Secondary Notebook Pages*/}
          {pageVisible === SECONDARY_NOTEBOOK_PAGES.THREE_D_STRUCTURES && <PlaceholderPage/>}
          {pageVisible === SECONDARY_NOTEBOOK_PAGES.IG_MET && <PlaceholderPage/>}
          {pageVisible === SECONDARY_NOTEBOOK_PAGES.FABRICS && <PlaceholderPage/>}
          {pageVisible === SECONDARY_NOTEBOOK_PAGES.OTHER_FEATURES && <PlaceholderPage/>}
          {pageVisible === SECONDARY_NOTEBOOK_PAGES.RELATIONSHIPS && <PlaceholderPage/>}
          {pageVisible === SECONDARY_NOTEBOOK_PAGES.DATA && <PlaceholderPage/>}

          {/*Sed Notebook Pages*/}
          {pageVisible === SED_NOTEBOOK_PAGES.LITHOLOGIES && <PlaceholderPage/>}
          {pageVisible === SED_NOTEBOOK_PAGES.BEDDING && <PlaceholderPage/>}
          {pageVisible === SED_NOTEBOOK_PAGES.STRUCTURES && <PlaceholderPage/>}
          {pageVisible === SED_NOTEBOOK_PAGES.DIAGENESIS && <PlaceholderPage/>}
          {pageVisible === SED_NOTEBOOK_PAGES.FOSSILS && <PlaceholderPage/>}
          {pageVisible === SED_NOTEBOOK_PAGES.INTERPRETATIONS && <PlaceholderPage/>}

        </View>
        <View style={notebookStyles.footerContainer}>
          <NotebookFooter
            openPage={(page) => notebookPageVisible(page)}
            onPress={(camera) => props.onPress(camera)}
          />
        </View>
      </Animated.View>
    );
  }
  else {
    const renderSpotsList = () => {
      let spotsList = recentlyViewedSpotIds.reduce((obj, key) => {
        if (spots && spots.hasOwnProperty(key)) obj.push(spots[key]);
        return obj;
      }, []);
      if (isEmpty(spotsList)) spotsList = useSpots.getSpotsSortedReverseChronologically();
      return (
        <View>
          <Spacer/>
          <Spacer/>
          <SectionDivider dividerText='Recent Spots'/>
          {isEmpty(spotsList) ? (
            <Text style={{paddingLeft: 10}}>No Spots in Active Datasets</Text>
          ) : (
            <FlatList
              keyExtractor={(item) => item.properties.id.toString()}
              data={spotsList}
              renderItem={({item}) => renderSpotName(item)}/>
          )}
          <Spacer/>
          <Spacer/>
          <Button
            title={'Close Notebook'}
            type={'clear'}
            titleStyle={commonStyles.standardButtonText}
            onPress={() => props.closeNotebook()}/>
        </View>
      );
    };

    const renderSpotName = (item) => {
      return (
        <ListItem key={item.properties.id} onPress={() => dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: item})}>
          <Avatar source={useSpots.getSpotGemometryIconSource(item)} size={20}/>
          <ListItem.Content>
            <ListItem.Title>{item.properties.name}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      );
    };

    return (
      <View style={notebookStyles.panel}>
        <Text style={{...commonStyles.noContentText, textAlign: 'center', paddingTop: 40}}>No Spot Currently
          Selected!</Text>
        {renderSpotsList()}
      </View>
    );
  }
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    selectedSpots: state.spot.selectedSpots,
  };
}

export default connect(mapStateToProps)(NotebookPanel);
