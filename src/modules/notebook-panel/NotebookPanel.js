import React from 'react';
import {Animated, FlatList, Text, View} from 'react-native';

// import {FlingGestureHandler, Directions, State} from 'react-native-gesture-handler';
import {Avatar, Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';
import Spacer from '../../shared/ui/Spacer';
import Geography from '../geography/Geography';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {ImagesPage} from '../images';
import MeasurementDetailPage from '../measurements/MeasurementDetail';
import MeasurementsPage from '../measurements/Measurements';
import Nesting from '../nesting/Nesting';
import NotesPage from '../notes/Notes';
import SampleDetailPage from '../samples/SampleDetail';
import SamplesPage from '../samples/SamplesNotebook';
import {useSpotsHook} from '../spots';
import {setSelectedSpot} from '../spots/spots.slice';
import TagsPage from '../tags/TagsNotebook';
import NotebookFooter from './notebook-footer/NotebookFooter';
import NotebookHeader from './notebook-header/NotebookHeader';
import {NOTEBOOK_PAGES, SECONDARY_NOTEBOOK_PAGES, SED_NOTEBOOK_PAGES} from './notebook.constants';
import {setNotebookPageVisible} from './notebook.slice';
import notebookStyles from './notebookPanel.styles';
import Overview from './Overview';
import PlaceholderPage from './PlaceholderPage';

const NotebookPanel = props => {
  const [useSpots] = useSpotsHook();
  const dispatch = useDispatch();
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);
  const recentlyViewedSpotIds = useSelector(state => state.spot.recentViews);
  const spot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);

  const notebookPageVisible = page => {
    dispatch(setNotebookPageVisible(page));
    if (page === NOTEBOOK_PAGES.MEASUREMENT || page === NOTEBOOK_PAGES.MEASUREMENTDETAIL) {
      dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.COMPASS}));
    }
    else if (page === NOTEBOOK_PAGES.SAMPLE) dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.SAMPLE}));
    else if (page === NOTEBOOK_PAGES.TAG) dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.TAGS}));
    else dispatch(setModalVisible({modal: null}));
  };

  if (!isEmpty(spot)) {
    console.log('Selected Spot:', spot);
    return (
      <Animated.View
        style={notebookStyles.panel}
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
          {(pageVisible === NOTEBOOK_PAGES.OVERVIEW || pageVisible === undefined)
          && <Overview openMainMenu={props.openMainMenu}/>}

          {/*Primary Pages*/}
          {pageVisible === NOTEBOOK_PAGES.MEASUREMENT && <MeasurementsPage/>}
          {pageVisible === NOTEBOOK_PAGES.NOTE && <NotesPage/>}
          {pageVisible === NOTEBOOK_PAGES.SAMPLE && <SamplesPage/>}
          {pageVisible === NOTEBOOK_PAGES.TAG && <TagsPage openMainMenu={props.openMainMenu}/>}
          {pageVisible === NOTEBOOK_PAGES.PHOTO && <ImagesPage onPress={props.onPress}/>}

          {/*Additional Notebook Pages*/}
          {pageVisible === NOTEBOOK_PAGES.GEOGRAPHY && <Geography/>}
          {pageVisible === NOTEBOOK_PAGES.MEASUREMENTDETAIL && <MeasurementDetailPage/>}
          {pageVisible === NOTEBOOK_PAGES.NESTING && <Nesting/>}
          {pageVisible === NOTEBOOK_PAGES.SAMPLEDETAIL && <SampleDetailPage/>}

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
        <ListItem key={item.properties.id} onPress={() => {
          dispatch(setSelectedSpot(item));
        }}>
          <Avatar source={useSpots.getSpotGemometryIconSource(item)}
                  placeholderStyle={{backgroundColor: 'transparent'}}
                  size={20}/>
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

export default NotebookPanel;
