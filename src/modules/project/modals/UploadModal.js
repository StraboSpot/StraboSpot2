import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {STRABO_APIS} from '../../../services/urls.constants';
import useUploadHook from '../../../services/useUpload';
import {isEmpty} from '../../../shared/Helpers';
import Spacer from '../../../shared/ui/Spacer';
import {setIsProgressModalVisible, setIsUploadModalVisible} from '../../home/home.slice';
import overlayStyles from '../../home/overlays/overlay.styles';
import MenuModal from '../MenuModal';
import {Button} from 'react-native-elements';
import LottieAnimations from '../../../utils/animations/LottieAnimations.web';

const UploadModal = ({closeModal, visible}) => {
  console.log('UE UploadModal');

  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const endPoint = useSelector(state => state.connections.databaseEndpoint);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const [modalTitle, setModalTitle] = useState('Overwrite Warning!');
  const [uploadUpStatus, setUploadUpStatus] = useState('');

  const useUpload = useUploadHook();

  useEffect(() => {
    setUploadUpStatus('');
  }, []);

  const initiateUpload = async () => {
    setModalTitle('Uploading');
    setUploadUpStatus('uploading');
    await useUpload.initializeUpload();
    setUploadUpStatus('complete');
    setModalTitle('All Uploaded!');
  };

  const renderUploadProgress = () => {
    return (
      <View>
        <LottieAnimations
          type={uploadUpStatus === 'uploading' ? 'loadingFile' : 'complete'}
          show={uploadUpStatus === 'uploading'}
          doesLoop={uploadUpStatus === 'uploading'}
        />
        <Text style={overlayStyles.statusMessageText}>{statusMessages.join('\n')}</Text>
      </View>
    );
  };

  return (
    <MenuModal
      modalTitle={modalTitle}
      visible={visible}
      cancel={() => dispatch(setIsUploadModalVisible(false))}
      buttonText={'Upload'}
      onPress={closeModal}
    >
      {uploadUpStatus === '' ? (
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
              title={'UPLOAD'}
              type={'clear'}
              titleStyle={overlayStyles.buttonText}
              onPress={initiateUpload}
            />
            <Button
              title={'CANCEL'}
              type={'clear'}
              titleStyle={overlayStyles.buttonText}
              onPress={closeModal}
            />
          </View>
        </View>
      ) : renderUploadProgress()
      }
    </MenuModal>
  );
};

export default UploadModal;
