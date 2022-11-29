import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {STRABO_APIS} from '../../../services/deviceAndAPI.constants';
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
  </>);
};

export default UploadModal;
