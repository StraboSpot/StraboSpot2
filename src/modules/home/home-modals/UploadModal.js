import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import useUploadHook from '../../../services/useUpload';
import commonStyles from '../../../shared/common.styles';
import {isEmpty, truncateText} from '../../../shared/Helpers';
import Spacer from '../../../shared/ui/Spacer';
import UploadDialogBox from '../../project/UploadDialogBox';
import useProjectHook from '../../project/useProject';
import {setUploadModalVisible} from '../home.slice';

const UploadModal = (props) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const endPoint = useSelector(state => state.project.databaseEndpoint);
  const isUploadModalVisible = useSelector(state => state.home.isUploadModalVisible);
  const useUpload = useUploadHook();
  const [useProject] = useProjectHook();

  return (
    <UploadDialogBox
      dialogTitle={'OVERWRITE WARNING!'}
      visible={isUploadModalVisible}
      cancel={() => dispatch(setUploadModalVisible(false))}
      buttonText={'Upload'}
      onPress={async () => {
        await useUpload.initializeUpload();
      }}
    >
      <View>
        <View>
          <Text style={commonStyles.dialogContentImportantText}>Uploading to:</Text>
          <Text style={commonStyles.dialogContentImportantText}>
            {endPoint.isSelected ? endPoint.url : 'https://strabospot.org/db'}
          </Text>
        </View>
        <Spacer/>
        <Text>
          <Text style={commonStyles.dialogContentImportantText}>{!isEmpty(
            currentProject) && currentProject.description.project_name} </Text>
          project properties and the following active datasets will be uploaded and will
          <Text style={commonStyles.dialogContentImportantText}> OVERWRITE</Text> any data already on the server
          for this project:
        </Text>
        <View style={{alignItems: 'center', paddingTop: 15, paddingBottom: 10}}>
          <FlatList
            data={useProject.getActiveDatasets()}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => <Text>{item.name.length > 30 ? '- ' + truncateText(item.name, 30)
              : '- ' + item.name}</Text>}
          />
        </View>
      </View>
    </UploadDialogBox>
  );
};

export default UploadModal;
