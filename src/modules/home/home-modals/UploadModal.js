import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {STRABO_APIS} from '../../../services/urls.constants';
import {isEmpty} from '../../../shared/Helpers';
import Spacer from '../../../shared/ui/Spacer';
import UploadDialogBox from '../../project/UploadDialogBox';
import useProjectHook from '../../project/useProject';
import {setProgressModalVisible, setUploadModalVisible} from '../home.slice';
import overlayStyles from '../overlay.styles';

const UploadModal = () => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const endPoint = useSelector(state => state.connections.databaseEndpoint);
  const isUploadModalVisible = useSelector(state => state.home.isUploadModalVisible);

  const [useProject] = useProjectHook();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [response, setResponse] = useState('');

  const renderUploadProgressModal = async () => {
    dispatch(setUploadModalVisible(false));
    dispatch(setProgressModalVisible(true));
  };

  return (<>
    <UploadDialogBox
      dialogTitle={'OVERWRITE WARNING!'}
      visible={isUploadModalVisible}
      cancel={() => dispatch(setUploadModalVisible(false))}
      buttonText={'Upload'}
      onPress={() => renderUploadProgressModal()}
    >
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
            currentProject) && currentProject.description.project_name} </Text>
          project properties and datasets will be uploaded and will
          <Text style={overlayStyles.importantText}> OVERWRITE</Text> any data already on the server
          for this project:
        </Text>
      </View>
    </UploadDialogBox>
  </>);
};

export default UploadModal;
