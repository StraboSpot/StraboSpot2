import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import LottieView from 'lottie-react-native';
import {Icon} from 'react-native-elements';
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
  const [error, setError] = useState(false);
  const [datasetsNotUploaded, setDatasetsNotUploaded] = useState([]);

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
    setError(false);
    if (selectedProject.source === 'server' && !isEmpty(project)) {
      console.log('Downloading Project');
      await useDownload.initializeDownload(project);
      console.log('Download Complete!');
      setUploadComplete(false);
      setDatasetsNotUploaded([]);
      setError(false);
    }
  };

  const renderList = (dataset) => {
    return (
      <Text style={{textAlign: 'left'}}>{dataset.name}</Text>
    );
  };

  const renderUploadProgressModal = async () => {
    try {
      const uploadStatusObj = await useUpload.initializeUpload();
      const {status, datasets} = uploadStatusObj;
      setUploadComplete(status);
      setDatasetsNotUploaded(datasets);
      dispatch(addedStatusMessage('\nUpload Complete!'));
    }
    catch (err) {
      console.error('Error in renderUploadProgressModal', err);
      setError(true);
    }
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
            renderItem={({item}) => renderList(item)}
            ListEmptyComponent={<Text>All datasets were uploaded.</Text>}
          />
        </View>
      </View>
    );
  };

  return (
    <ProgressModal
      buttonText={selectedProject.source !== '' && 'Continue'}
      closeProgressModal={() => setProgressModalVisible(false)}
      dialogTitle={'UPLOADING...'}
      isProgressModalVisible={isProgressModalVisible}
      onPressComplete={() => handleCompletePress()}
      showButton={uploadComplete === 'complete' || error}
      showInfo={!isEmpty(datasetsNotUploaded)}
      animation={renderUploadingAnimation(
        error ? 'error' : uploadComplete === 'complete' ? 'complete' : 'uploading')}
      info={renderDatasetsNotUploaded()}
    >
      {!error ? (
          <View style={{flex: 1}}>
            <View style={{}}>
              <Text style={{textAlign: 'center'}}>{statusMessages}</Text>
            </View>
            {isImageTransferring && <View style={{paddingTop: 10}}>
              <Text>Uploading image...</Text>
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
        : <View style={{flex: 1}}>
          <View style={{}}>
            <Text style={{textAlign: 'center'}}>{statusMessages}</Text>
          </View>
        </View>
      }
    </ProgressModal>
  );
};

export default UploadProgressModal;
