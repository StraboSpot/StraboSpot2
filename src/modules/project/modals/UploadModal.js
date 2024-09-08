import React, {useEffect, useState} from 'react';
import {Platform, Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import KeepAwake from 'react-native-keep-awake';
import ProgressBar from 'react-native-progress/Bar';
import {useDispatch, useSelector} from 'react-redux';

import {updatedProjectTransferProgress} from '../../../services/connections.slice';
import {STRABO_APIS} from '../../../services/urls.constants';
import useUpload from '../../../services/useUpload';
import useUploadImages from '../../../services/useUploadImages';
import {isEmpty} from '../../../shared/Helpers';
import alert from '../../../shared/ui/alert';
import Spacer from '../../../shared/ui/Spacer';
import LottieAnimations from '../../../utils/animations/LottieAnimations';
import {
  clearedStatusMessages,
  setIsProgressModalVisible,
} from '../../home/home.slice';
import overlayStyles from '../../home/overlays/overlay.styles';
import MenuModal from '../MenuModal';
import {setIsImageTransferring} from '../projects.slice';


const UploadModal = ({closeModal, visible}) => {

  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const endPoint = useSelector(state => state.connections.databaseEndpoint);
  const isImageTransferring = useSelector(state => state.project.isImageTransferring);
  const projectTransferProgress = useSelector(state => state.connections.projectTransferProgress);

  const [datasetUploadStatus, setDatasetUploadStatus] = useState('');
  const [errorMessage, setErrorMesssage] = useState('');
  const [imageUploadStatus, setImageUploadStatus] = useState({});
  const [modalTitle, setModalTitle] = useState('Overwrite Warning!');
  const [projectUploadStatus, setProjectUploadStatus] = useState('');
  const [uploadState, setUploadState] = useState('not started');

  const {uploadProject, uploadDatasets} = useUpload();
  const {currentImage, currentImageStatus, statusMessages, totalImages, initializeImageUpload, resetState} = useUploadImages();

  useEffect(() => {
    console.log('uploadState', uploadState);
    console.log('Current Image', currentImage);
    console.log('Is Image Transferring', isImageTransferring);
  }, [uploadState, currentImage]);

  const handleClosePress = () => {
    setModalTitle('Overwrite Warning!');
    setUploadState('not started');
    setProjectUploadStatus('');
    setDatasetUploadStatus('');
    resetState();
    closeModal();
  };

  const initiateUpload = async () => {
    try {
      dispatch(clearedStatusMessages());
      isImageTransferring && dispatch(setIsImageTransferring(false));
      dispatch(updatedProjectTransferProgress(0));
      Platform.OS !== 'web' && KeepAwake.activate();
      setModalTitle('Uploading');
      setUploadState('uploading');
      const projectStatus = await uploadProject();
      setProjectUploadStatus(projectStatus);
      const datasetStatus = await uploadDatasets();
      setDatasetUploadStatus(datasetStatus);
      const imageStatus = await initializeImageUpload();
      dispatch(setIsProgressModalVisible(false));
      dispatch(setIsImageTransferring(false));
      setImageUploadStatus(imageStatus);
      if (imageStatus.imagesNotFound) {
        setUploadState('error');
        setModalTitle('Uploaded With Errors!');
        setErrorMesssage(`There are ${imageStatus.imagesNotFound} images needed that were not found on this device.`);
      }
      else {
        setUploadState('complete');
        setModalTitle('All Uploaded!');
      }
    }
    catch (err) {
      console.error('Error uploading', err);
      setErrorMesssage(err.toString());
      setUploadState('error');
    }
  };

  const uploadImagesOnly = async () => {
    try {
      dispatch(clearedStatusMessages());
      Platform.OS !== 'web' && KeepAwake.activate();
      setModalTitle('Uploading');
      setUploadState('uploading');
      const imageStatus = await initializeImageUpload();
      setImageUploadStatus(imageStatus);
      if (imageStatus.imagesNotFound) {
        setUploadState('error');
        setModalTitle('Uploaded With Errors!');
        setErrorMesssage(
          `There are ${imageStatus.imagesNotFound} images needed that were not found on this device.`);
      }
      else {
        setUploadState('complete');
        setModalTitle('All Uploaded!');
      }
    }
    catch (err) {
      console.error('Error uploading', err);
      alert('Upload Failed!', err.toString());
      closeModal();
    }
  };

  const renderErrorView = () => {
    return (
      <View style={{padding: 10}}>
        <LottieAnimations
          type={'error'}
          show={uploadState === 'error'}
          doesLoop={false}
        />
        <Text style={{textAlign: 'center'}}>{errorMessage}</Text>
      </View>
    );
  };

  const renderInitialUploadView = () => (
    <View>
      <View>
        <Text style={overlayStyles.importantText}>Uploading to:</Text>
        <Text style={overlayStyles.importantText}>
          {endPoint.isSelected ? endPoint.url : STRABO_APIS.DB}
        </Text>
      </View>
      <Spacer/>
      <Text>
        <Text style={overlayStyles.importantText}>{!isEmpty(
          currentProject) && currentProject.description?.project_name} </Text>
        project properties and datasets will be uploaded and will
        <Text style={overlayStyles.importantText}> OVERWRITE</Text> any data already on the server
        for this project:
      </Text>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={'UPLOAD FULL'}
          type={'clear'}
          titleStyle={overlayStyles.buttonText}
          onPress={() => initiateUpload()}
        />
        <Button
          title={'CANCEL'}
          type={'clear'}
          titleStyle={overlayStyles.buttonText}
          onPress={handleClosePress}
        />
      </View>
      <Button
        title={'IMAGES ONLY'}
        type={'clear'}
        titleStyle={overlayStyles.buttonText}
        onPress={uploadImagesOnly}
      />
    </View>
  );

  const renderImageUploadStatusText = () => {
    if (uploadState === 'complete') {
      return (
        <View>
          <Text>Images uploaded successfully: {imageUploadStatus.success || 0}</Text>
        </View>
      );
    }
    else if (uploadState === 'error') {
      return (
        <View>
          <Text>Images uploaded successfully: {imageUploadStatus.success || 0}</Text>
          <Text>Images Failed: {imageUploadStatus.failed || 0}</Text>
        </View>
      );
    }
  };

  const renderUploadProgress = () => {
    return (
      <View style={{}}>
        <LottieAnimations
          type={uploadState === 'uploading' ? 'loadingFile' : 'complete'}
          show={uploadState === 'uploading'}
          doesLoop={uploadState === 'uploading'}
        />
        <View>
          <View style={{padding: 10}}>
            <Text style={{textAlign: 'center'}}>{statusMessages}</Text>
          </View>
          {isImageTransferring
            && (
              <View style={{paddingTop: 10}}>
                <View style={{padding: 10, height: 100, width: '100%'}}>
                  {currentImage !== '' && <Text style={{fontWeight: 'bold'}}>Uploading image {currentImage}</Text>}
                  <Text style={{textAlign: 'center', margin: 5}}>Success: {currentImageStatus.success} / {totalImages}</Text>
                  {currentImageStatus.failed > 0 && <Text style={{textAlign: 'center'}}>Failed {currentImageStatus.failed} \ {totalImages}</Text>}
                </View>
                <Text style={{textAlign: 'center', paddingBottom: 5}}>Uploading images</Text>
                <ProgressBar
                  progress={projectTransferProgress}
                  width={250}
                  height={15}
                  borderRadius={20}
                />
                <Text style={{textAlign: 'center'}}>{`${(projectTransferProgress * 100).toFixed(0)}%`}</Text>
              </View>
            )
          }
          {/*{uploadComplete && datasetsNotUploaded?.length > 0 && renderDatasetsNotUploaded()}*/}
          <View style={overlayStyles.overlayContent}>
            <Text>Project: {projectUploadStatus === 'success' ? 'Success!' : 'Uploading...'}</Text>
            <Text>Datasets: {datasetUploadStatus === 'success' ? 'Success!' : 'Uploading...'}</Text>
            {/*{renderImageUploadStatusText()}*/}
          </View>

        </View>
      </View>
    );
  };

  return (
    <MenuModal
      modalTitle={modalTitle}
      visible={visible}
    >
      {uploadState === 'not started'
        ? renderInitialUploadView()
        : uploadState !== 'error'
          ? renderUploadProgress()
          : renderErrorView()}
      <View style={overlayStyles.buttonContainer}>
        {(uploadState === 'complete' || uploadState === 'error')
          && (
            <Button
              title={'OK'}
              type={'clear'}
              titleStyle={overlayStyles.buttonText}
              // disabled={uploadState !== 'complete'}
              onPress={handleClosePress}
            />
          )
        }
      </View>
    </MenuModal>
  );
};

export default UploadModal;
