import React, {useEffect} from 'react';
import {FlatList, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import NotebookFooter from './notebook-footer/NotebookFooter';
import NotebookHeader from './notebook-header/NotebookHeader';
import {setNotebookPageVisible} from './notebook.slice';
import notebookStyles from './notebookPanel.styles';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {setModalVisible} from '../home/home.slice';
import Overview from '../page/Overview';
import {NOTEBOOK_PAGES, PAGE_KEYS, SUBPAGES} from '../page/page.constants';
import usePageHoook from '../page/usePage';
import {setMultipleFeaturesTaggingEnabled} from '../project/projects.slice';
import {SpotsListItem, useSpotsHook} from '../spots';
import {setSelectedSpot} from '../spots/spots.slice';

const NotebookPanel = ({closeNotebookPanel, createDefaultGeom, openMainMenu, zoomToSpot}) => {
  console.log('Rendering NotebookPanel...');

  const dispatch = useDispatch();
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);
  const recentlyViewedSpotIds = useSelector(state => state.spot.recentViews);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const spot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);

  const [useSpots] = useSpotsHook();
  const usePage = usePageHoook();

  useEffect(() => {
    console.log('UE NotebookPanel [pageVisible, spot]', pageVisible, spot);
    dispatch(setMultipleFeaturesTaggingEnabled(false));
  }, [pageVisible, spot]);

  const openPage = (key) => {
    dispatch(setNotebookPageVisible(key));
    const page = NOTEBOOK_PAGES.find(p => p.key === key);
    if (SMALL_SCREEN) dispatch(setModalVisible({modal: null}));
    else if (page.key === PAGE_KEYS.GEOLOGIC_UNITS) dispatch(setModalVisible({modal: PAGE_KEYS.TAGS}));
    else if (page.modal_component) dispatch(setModalVisible({modal: page.key}));
    else dispatch(setModalVisible({modal: null}));
  };

  const renderNotebookContent = () => {
    const isRelevantPage = pageVisible === PAGE_KEYS.OVERVIEW
      || usePage.getRelevantGeneralPages().map(p => p.key).includes(pageVisible)
      || usePage.getRelevantPetPages().map(p => p.key).includes(pageVisible)
      || usePage.getRelevantSedPages().map(p => p.key).includes(pageVisible)
      || SUBPAGES.map(p => p.key).includes(pageVisible);
    if (!isRelevantPage) dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));

    let pageKey = isRelevantPage ? pageVisible : PAGE_KEYS.OVERVIEW;
    const page = NOTEBOOK_PAGES.find(p => p.key === pageKey);
    const Page = page?.page_component || Overview;
    let pageProps = {page: page, openMainMenu: openMainMenu};
    if (page.key === PAGE_KEYS.IMAGES) pageProps = {...pageProps};
    return (
      <React.Fragment>
        <View style={notebookStyles.headerContainer}>
          <NotebookHeader
            closeNotebookPanel={closeNotebookPanel}
            createDefaultGeom={createDefaultGeom}
            zoomToSpot={zoomToSpot}
          />
        </View>
        <View style={{...notebookStyles.centerContainer}}>
          <Page {...pageProps}/>
        </View>
        <View style={notebookStyles.footerContainer}>
          <NotebookFooter openPage={openPage}/>
        </View>
      </React.Fragment>
    );
  };

  const renderNotebookContentNoSpot = () => {
    return (
      <View style={notebookStyles.centerContainer}>
        {renderRecentSpotsList()}
      </View>
    );
  };

  const renderRecentSpotsList = () => {
    if (modalVisible !== null && !SMALL_SCREEN) dispatch(setModalVisible({modal: null}));
    let spotsList = recentlyViewedSpotIds.reduce((obj, key) => {
      if (spots?.[key]) obj.push(spots[key]);
      return obj;
    }, []);
    if (isEmpty(spotsList)) spotsList = useSpots.getSpotsSortedReverseChronologically();
    return (
      <View style={notebookStyles.centerContainer}>
        <SectionDivider dividerText={'Recent Spots'}/>
        <FlatList
          keyExtractor={item => item.properties.id.toString()}
          data={spotsList}
          renderItem={({item}) => (
            <SpotsListItem
              doShowTags={true}
              spot={item}
              onPress={() => dispatch(setSelectedSpot(item))}
            />)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={'No Spots in Active Datasets'}/>}
        />
        {!SMALL_SCREEN && (
          <Button
            title={'Close Notebook'}
            type={'clear'}
            titleStyle={commonStyles.standardButtonText}
            onPress={closeNotebookPanel}
          />
        )}
      </View>
    );
  };

  return (
    <View style={notebookStyles.notebookPanel}>
      {(SMALL_SCREEN || isNotebookPanelVisible) && (!isEmpty(spot) ? renderNotebookContent()
        : renderNotebookContentNoSpot())}
    </View>
  );
};

export default NotebookPanel;
