import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {BLUE} from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
import Spacer from '../../shared/ui/Spacer';
import uiStyles from '../../shared/ui/ui.styles';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setBackupModalVisible,
  setErrorMessagesModalVisible,
  setUploadModalVisible,
} from '../home/home.slice';
import {setSelectedProject} from './projects.slice';

const UploadBackAndExport = (props) => {

  const dispatch = useDispatch();
  const isOnline = useSelector(state => state.home.isOnline);
  const activeDatasets = useSelector(state => state.project.activeDatasetsIds);
  const user = useSelector(state => state.user);

  const useDevice = useDeviceHook();

  const onShareProjectAsCSV = () => {
    console.log('onShareProjectAsCSV');
  };

  const onShareNotebookAsPDF = () => {
    console.log('onShareNotebookAsPDF');
  };

  const onShareProjectAsShapefile = () => {
    console.log('onShareProjectAsShapefile');
  };

  const checkforActiveDatasets = () => {
    if (activeDatasets.length > 0) {
      dispatch(setSelectedProject({source: '', project: ''}));
      dispatch(setBackupModalVisible(true));
    }
    else {
      props.openMainMenu('Active Project');
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('There are no active datasets selected.'));
      dispatch(addedStatusMessage(
        'Pressing "OK" will direct you to the Active Projects panel where you can make selecitions.'));
      dispatch(setErrorMessagesModalVisible(true));
    }
  };

  const renderUploadAndBackupButtons = () => {
    return (
      <View>
        {user.encoded_login ? <Button
          title={isOnline.isConnected ? 'Upload project to StraboSpot' : 'Need to be connected to server'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => {
            dispatch(setSelectedProject({source: '', project: ''}));
            dispatch(setUploadModalVisible(true));
          }}
          disabled={!isOnline.isConnected}
        />
          : <View style={uiStyles.spacer}>
          <Text style={commonStyles.dialogContentImportantText}>If you are attempting to upload the project, check to see if you are logged in</Text>
          </View>}
        <Button
          title={'Backup project to device'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => checkforActiveDatasets()}
        />
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1}}>
        <SectionDivider dividerText={'upload and backup'}/>
        <Spacer/>
        {renderUploadAndBackupButtons()}
      </View>

      <View style={{flex: 1, justifyContent: 'flex-end', paddingBottom: 15}}>
        <Button
          title={'View/Edit Files on Device'}
          type={'outline'}
          containerStyle={commonStyles.buttonPadding}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => useDevice.openURL('ProjectBackups')}
          iconContainerStyle={{paddingRight: 10}}
          icon={{
            name: 'file-tray-full-outline',
            type: 'ionicon',
            color: BLUE,
          }}
        />
      </View>
      {/*<Divider sectionText={'export'}/>*/}
      {/*{renderExportButtons()}*/}
      {/*<Divider sectionText={'restore project from backup'}/>*/}
    </View>
  );
};

export default UploadBackAndExport;
