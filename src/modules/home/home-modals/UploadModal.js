import React, {useState} from 'react';
import {Text, View} from 'react-native';

import LottieView from 'lottie-react-native';
import ProgressBar from 'react-native-progress/Bar';
import {useDispatch, useSelector} from 'react-redux';

import {STRABO_APIS} from '../../../services/urls.constants';
import useUploadHook from '../../../services/useUpload';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import ProgressModal from '../../../shared/ui/modal/ProgressModal';
import Spacer from '../../../shared/ui/Spacer';
import useAnimationsHook from '../../../shared/ui/useAnimations';
import UploadDialogBox from '../../project/UploadDialogBox';
import useProjectHook from '../../project/useProject';
import {setUploadModalVisible} from '../home.slice';

const UploadModal = () => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const endPoint = useSelector(state => state.project.databaseEndpoint);
  const isUploadModalVisible = useSelector(state => state.home.isUploadModalVisible);
  const isImageTransferring = useSelector(state => state.project.isImageTransferring);
  const projectTransferProgress = useSelector(state => state.project.projectTransferProgress);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const useUpload = useUploadHook();
  const [useProject] = useProjectHook();

  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  // const [imageUpload, setImageUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [response, setResponse] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);

  const useAnimations = useAnimationsHook();

  const handleCompletePress = () => {
    setIsProgressModalVisible(false);
    setUploadComplete(false);
  };

  const renderUploadProgressModal = async () => {
    dispatch(setUploadModalVisible(false));
    setIsProgressModalVisible(true);
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

  return (<>
    <UploadDialogBox
      dialogTitle={'OVERWRITE WARNING!'}
      visible={isUploadModalVisible}
      cancel={() => dispatch(setUploadModalVisible(false))}
      buttonText={'Upload'}
      onPress={async () => renderUploadProgressModal()}
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
    <ProgressModal
      closeProgressModal={() => setIsProgressModalVisible(false)}
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
  </>);
};

export default UploadModal;
