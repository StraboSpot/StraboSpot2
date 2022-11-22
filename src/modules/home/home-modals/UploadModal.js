import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {STRABO_APIS} from '../../../services/deviceAndAPI.constants';
import useUploadHook from '../../../services/useUpload';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import Spacer from '../../../shared/ui/Spacer';
import UploadDialogBox from '../../project/UploadDialogBox';
import useProjectHook from '../../project/useProject';
import {setProgressModalVisible, setUploadModalVisible} from '../home.slice';

const UploadModal = () => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const endPoint = useSelector(state => state.project.databaseEndpoint);
  const isUploadModalVisible = useSelector(state => state.home.isUploadModalVisible);
  // const isImageTransferring = useSelector(state => state.project.isImageTransferring);
  // const projectTransferProgress = useSelector(state => state.project.projectTransferProgress);
  // const selectedProject = useSelector(state => state.project.selectedProject);
  // const statusMessages = useSelector(state => state.home.statusMessages);

  // const useDownload = useDownloadHook();
  const useUpload = useUploadHook();
  const [useProject] = useProjectHook();

  // const isProgressModalVisible = useSelector(state => state.home.isProgressModalVisible);

  // const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  // const [imageUpload, setImageUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [response, setResponse] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);

  // useEffect(() => {
  //   if (isUploadModalVisible) renderUploadModal();
  //
  // }, [isUploadModalVisible]);

  // const handleCompletePress = async () => {
  //   const project = selectedProject.project;
  //   dispatch(setSelectedProject({project: '', source: ''}));
  //   dispatch(setUploadModalVisible(false));
  //   setUploadComplete(false);
  //   if (selectedProject.source === 'server') {
  //     console.log('Downloading Project');
  //     await useDownload.initializeDownload(project);
  //     console.log('Download Complete!');
  //   }
  // };

  const renderUploadModal = async () => {
    dispatch(setUploadModalVisible(false));
    dispatch(setProgressModalVisible(true));
    const uploadStatus = await useUpload.initializeUpload();
    console.log('DATASET UPLOAD COMPLETE!', uploadStatus);
    setUploadComplete(uploadStatus);
  };

  // const renderUploadingAnimation = (type) => {
  //   return (<>
  //     <LottieView
  //       source={useAnimations.getAnimationType(type)}
  //       autoPlay
  //       loop={type === 'uploading'}
  //     />
  //   </>);
  // };

  return (<>
    <UploadDialogBox
      dialogTitle={'OVERWRITE WARNING!'}
      visible={isUploadModalVisible}
      cancel={() => dispatch(setUploadModalVisible(false))}
      buttonText={'Upload'}
      onPress={async () => renderUploadModal()}
    >
      <View>
        <View>
          <Text style={commonStyles.dialogContentImportantText}>Uploading to:</Text>
          <Text style={commonStyles.dialogContentImportantText}>
            {endPoint.isSelected ? endPoint.url : STRABO_APIS.DB}
          </Text>
        </View>
        <Spacer/>
        <Text>
          <Text style={commonStyles.dialogContentImportantText}>{!isEmpty(
            currentProject) && currentProject.description.project_name} </Text>
          project properties and datasets will be uploaded and will
          <Text style={commonStyles.dialogContentImportantText}> OVERWRITE</Text> any data already on the server
          for this project:
        </Text>
      </View>
    </UploadDialogBox>
    {/*<UploadProgressModal*/}
    {/*  isProgressModalVisible={isProgressModalVisible}*/}
    {/*/>*/}
  </>);
};

export default UploadModal;
