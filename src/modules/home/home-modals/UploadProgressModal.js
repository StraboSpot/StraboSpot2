import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import LottieView from 'lottie-react-native';
import ProgressBar from 'react-native-progress/Bar';
import {useDispatch, useSelector} from 'react-redux';

import useDownloadHook from '../../../services/useDownload';
import useUploadHook from '../../../services/useUpload';
import {isEmpty} from '../../../shared/Helpers';
import ProgressModal from '../../../shared/ui/modal/ProgressModal';
import useAnimationsHook from '../../../shared/ui/useAnimations';
import {setSelectedProject} from '../../project/projects.slice';
import {setProgressModalVisible} from '../home.slice';


const UploadProgressModal = (props) => {

  const dispatch = useDispatch();
  const isImageTransferring = useSelector(state => state.project.isImageTransferring);
  const isProgressModalVisible = useSelector(state => state.home.isProgressModalVisible);
  const projectTransferProgress = useSelector(state => state.project.projectTransferProgress);
  const selectedProject = useSelector(state => state.project.selectedProject);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const [uploadComplete, setUploadComplete] = useState(false);

  const useAnimations = useAnimationsHook();
  const useDownload = useDownloadHook();
  const useUpload = useUploadHook();

  useEffect(() => {
    if (isProgressModalVisible) renderUploadProgressModal().catch(err => console.error('Error in UploadProgressModal'));
  }, [isProgressModalVisible]);

  const handleCompletePress = async () => {
    const project = selectedProject.project;
    dispatch(setSelectedProject({project: '', source: ''}));
    dispatch(setProgressModalVisible(false));
    setUploadComplete(false);
    if (selectedProject.source === 'server' && !isEmpty(project)) {
      console.log('Downloading Project');
      await useDownload.initializeDownload(project);
      console.log('Download Complete!');
      setUploadComplete(false);
    }
  };

  const renderUploadProgressModal = async () => {
    const uploadStatus = await useUpload.initializeUpload();
    console.log('DATASET UPLOAD COMPLETE!', uploadStatus);
    setUploadComplete(uploadStatus);
  };

  const renderUploadingAnimation = (type) => {
    return (<>
      <LottieView
        source={useAnimations.getAnimationType(type)}
        autoPlay
        loop={type === 'uploading'}
      />
    </>);
  };

  return (
    <ProgressModal
      buttonText={selectedProject.source !== '' && 'Continue'}
      closeProgressModal={() => setProgressModalVisible(false)}
      dialogTitle={'UPLOADING...'}
      isProgressModalVisible={isProgressModalVisible}
      onPressComplete={() => handleCompletePress()}
      showButton={uploadComplete}
      animation={renderUploadingAnimation(!uploadComplete ? 'uploading' : 'complete')}
    >
      <View style={{flex: 1}}>
        <Text>{statusMessages}</Text>
        {isImageTransferring && <View style={{paddingTop: 10}}>
          <ProgressBar
            progress={projectTransferProgress}
            width={250}
            height={15}
            borderRadius={20}
          />
          <Text style={{textAlign: 'center'}}>{`${(projectTransferProgress * 100).toFixed(0)}%`}</Text>
        </View>}
      </View>
    </ProgressModal>
  );
};

export default UploadProgressModal;
