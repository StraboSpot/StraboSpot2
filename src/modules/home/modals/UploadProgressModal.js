import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Icon} from 'react-native-elements';
import ProgressBar from 'react-native-progress/Bar';
import {useDispatch, useSelector} from 'react-redux';

import useDownloadHook from '../../../services/useDownload';
import useImportHook from '../../../services/useImport';
import useUploadHook from '../../../services/useUpload';
import {isEmpty} from '../../../shared/Helpers';
import ProgressModal from '../../../shared/ui/modal/ProgressModal';
// import useAnimationsHook from '../../../shared/ui/useAnimations';
import LottieAnimation from '../../../utils/animations/LottieAnimations';
import {setIsImageTransferring, setSelectedProject} from '../../project/projects.slice';
import {addedStatusMessage, setIsProgressModalVisible} from '../home.slice';

const UploadProgressModal = ({}) => {

  const dispatch = useDispatch();
  const isImageTransferring = useSelector(state => state.project.isImageTransferring);
  const isProgressModalVisible = useSelector(state => state.home.isProgressModalVisible);
  const projectTransferProgress = useSelector(state => state.connections.projectTransferProgress);
  const selectedProject = useSelector(state => state.project.selectedProject);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const [datasetsNotUploaded, setDatasetsNotUploaded] = useState([]);
  const [error, setError] = useState(false);
  // const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [uploadComplete, setUploadComplete] = useState('');

  const useDownload = useDownloadHook();
  const useImport = useImportHook();
  const useUpload = useUploadHook();

  useEffect(() => {
    // if (isProgressModalVisible) renderUploadProgressModal().catch(err => console.error('Error in UploadProgressModal', err));
  }, [isProgressModalVisible]);

  const handleCompletePress = async () => {
    try {
      const project = selectedProject.project;
      dispatch(setSelectedProject({project: '', source: ''}));
      dispatch(setIsProgressModalVisible(false));
      if (selectedProject.source === 'server' && !isEmpty(project)) {
        console.log('Downloading Project');
        await useDownload.initializeDownload(project);
        console.log('Download Complete!');

      }
      else if (selectedProject.source === 'device' && !isEmpty(project)) {
        console.log(`Loading ${project.fileName} project from device.`);
        await useImport.loadProjectFromDevice(project, false);
        console.log(`${project.fileName} has been imported.`);
      }
      setUploadComplete('');
      setDatasetsNotUploaded([]);
      setError(false);
    }
    catch (err) {
      console.error('Error loading or downloading project', err);
      setUploadComplete('');
      setError(true);
    }
  };

  const renderDatasetsNotUploadedList = (dataset) => {
    return (
      <Text style={{textAlign: 'left'}}>{dataset.name}</Text>
    );
  };

  const renderUploadProgressModal = async () => {
    try {
      isImageTransferring && dispatch(setIsImageTransferring(false));
      setUploadComplete('uploading');
      const uploadStatusObj = await useUpload.initializeUpload();
      const {status, datasets} = uploadStatusObj;
      setUploadComplete(status);
      setDatasetsNotUploaded(datasets);
      dispatch(addedStatusMessage('\nUpload Complete!'));
    }
    catch (err) {
      console.error('Error in renderUploadProgressModal', err);
      setUploadComplete('');
      setError(true);
    }
  };

  const renderDatasetsNotUploaded = () => {
    return (
      <View>
        <View style={{alignItems: 'center'}}>
          <Icon
            name={'warning-outline'}
            type={'ionicon'}
            color={'orange'}
            containerStyle={{paddingTop: 15}}
          />
          <Text style={{marginBottom: 15, textAlign: 'left'}}>The following datasets did not upload because the version
            on the server is the same or newer:</Text>
          <FlatList
            data={datasetsNotUploaded}
            renderItem={({item}) => renderDatasetsNotUploadedList(item)}
            ListEmptyComponent={<Text>All datasets were uploaded.</Text>}
          />
        </View>
      </View>
    );
  };

  return (
    <ProgressModal
      buttonText={selectedProject.source !== '' && 'Continue'}
      closeProgressModal={() => dispatch(setIsProgressModalVisible(false))}
      dialogTitle={'UPLOADING...'}
      isProgressModalVisible={isProgressModalVisible}
      onPressComplete={() => handleCompletePress()}
      showButton={uploadComplete === 'complete' || error}
      showInfo={!isEmpty(datasetsNotUploaded)}
      animation={
        <LottieAnimation
          type={error ? 'error' : uploadComplete === 'complete' ? 'complete' : 'uploading'}
          doesLoop={uploadComplete === 'uploading'}
          show={uploadComplete === 'uploading'}
          error={error}
        />}
      info={renderDatasetsNotUploaded()}
    >
      {!error ? (
          <View>
            <View style={{padding: 10}}>
              <Text style={{textAlign: 'center'}}>{statusMessages}</Text>
            </View>
            {isImageTransferring && <View style={{paddingTop: 10}}>
              <Text style={{textAlign: 'center', paddingBottom: 5}}>Uploading images</Text>
              <ProgressBar
                progress={projectTransferProgress}
                width={250}
                height={15}
                borderRadius={20}
              />
              <Text style={{textAlign: 'center'}}>{`${(projectTransferProgress * 100).toFixed(0)}%`}</Text>
            </View>}
            {/*{uploadComplete && datasetsNotUploaded?.length > 0 && renderDatasetsNotUploaded()}*/}
          </View>
        )
        : <View>
            <Text style={{textAlign: 'center'}}>{statusMessages}</Text>
          </View>
      }
    </ProgressModal>
  );
};

export default UploadProgressModal;
