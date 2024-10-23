import React from 'react';
import {Platform} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import Dialog from './Dialog';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setIsProjectLoadSelectionModalVisible,
  setLoadingStatus,
} from './home.slice';
import {ErrorModal, InitialProjectLoadModal, StatusModal, WarningModal} from './modals';
import useDevice from '../../services/useDevice.web';
import useExport from '../../services/useExport.web';
import LoadingSpinner from '../../shared/ui/Loading';
import SaveMapsModal from '../maps/offline-maps/SaveMapsModal';

const OverlaysContainer = ({
                             animatedValueTextInputs,
                             closeNotebookPanel,
                             getCurrentZoom,
                             getExtentString,
                             getTileCount,
                             openMainMenuPanel,
                             openNotebookPanel,
                             zoomToCurrentLocation,
                           }) => {

  const dispatch = useDispatch();
  const backupFileName = useSelector(state => state.project.backupFileName);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);

  const {openURL} = useDevice();
  const {zipAndExportProjectFolder} = useExport();

  const closeInitialProjectLoadModal = () => {
    // console.log('Starting Project...');
    dispatch(setIsProjectLoadSelectionModalVisible(false));
  };

  const exportProject = async () => {
    dispatch(clearedStatusMessages());
    // console.log('Exporting Project');
    dispatch(addedStatusMessage(`Exporting ${backupFileName}!`));
    await zipAndExportProjectFolder(true);
    const exportCompleteMessage = Platform.OS === 'ios' ? `\n\nProject (${backupFileName}) has been exported!`
      : `\n\nProject (${backupFileName}) has been exported to the Downloads folder!`;
    dispatch(addedStatusMessage(exportCompleteMessage));
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
    // console.log(`Project ${backupFileName} has been exported!`);
  };

  const openStraboSpotURL = () => openURL('https://www.strabospot.org/login');

  return (
    <>
      {isProjectLoadSelectionModalVisible && Platform.OS !== 'web' && (
        <InitialProjectLoadModal
          closeModal={closeInitialProjectLoadModal}
          openMainMenuPanel={openMainMenuPanel}
          visible={isProjectLoadSelectionModalVisible}
        />
      )}
      <ErrorModal/>
      <StatusModal
        exportProject={exportProject}
        openMainMenuPanel={openMainMenuPanel}
        openUrl={openStraboSpotURL}
      />
      <WarningModal/>
      {/*------------------------*/}
      <LoadingSpinner isLoading={isHomeLoading}/>
      {modalVisible && (
        <Dialog
          animatedValueTextInputs={animatedValueTextInputs}
          closeNotebookPanel={closeNotebookPanel}
          openNotebookPanel={openNotebookPanel}
          zoomToCurrentLocation={zoomToCurrentLocation}
        />
      )}
      {isOfflineMapModalVisible && (
        <SaveMapsModal
          getCurrentZoom={getCurrentZoom}
          getExtentString={getExtentString}
          getTileCount={getTileCount}
        />
      )}
    </>
  );
};

export default OverlaysContainer;
