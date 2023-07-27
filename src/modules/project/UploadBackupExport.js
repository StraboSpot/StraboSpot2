import React from 'react';
import {Alert, Linking, Platform, Text, View} from 'react-native';

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
import overlayStyles from '../home/overlay.styles';
import {setSelectedProject} from './projects.slice';

const UploadBackAndExport = () => {

  const dispatch = useDispatch();
  const isOnline = useSelector(state => state.home.isOnline);
  const activeDatasets = useSelector(state => state.project.activeDatasetsIds);
  const user = useSelector(state => state.user);

  const useDevice = useDeviceHook();

  const checkForActiveDatasets = () => {
    if (activeDatasets.length > 0) {
      dispatch(setSelectedProject({source: '', project: ''}));
      dispatch(setBackupModalVisible(true));
    }
    else {
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('There are no active datasets selected.'));
      dispatch(setErrorMessagesModalVisible(true));
    }
  };

  const openURL = async () => {
    const url = 'https://strabospot.org/files/helpFiles/Moving_Project_Backups_Out_of%20StraboSpot2.pdf';
    const canOpen = await Linking.canOpenURL(url);
    canOpen ? await Linking.openURL(url) : Alert.alert('Need to be online');
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
          : (
            <View style={uiStyles.spacer}>
              <Text style={commonStyles.dialogContentImportantText}>If you are attempting to upload the project,
                check to see if you are logged in
              </Text>
            </View>
          )}
        <Button
          title={'Backup project to device'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => checkForActiveDatasets()}
        />
        {Platform.OS === 'ios'
          && (
            <View style={{padding: 10}}>
              <Text style={{...overlayStyles.statusMessageText}}>After backing up,
                to further preserve your data please copy your project backups out of the StraboSpot2/ProjectBackups
                folder to a
                different folder in the iOS app Files/On My IPad! If online, you can find detailed instructions
                <Text style={{color: BLUE}} onPress={openURL}> here</Text>.
              </Text>
            </View>
          )
        }
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

      {Platform.OS === 'ios'
        && (
          <View style={{flex: 1, justifyContent: 'flex-end', paddingBottom: 15}}>
            <View style={{padding: 10, alignItems: 'center'}}>
              <Text style={{...uiStyles.sectionDividerText, textAlign: 'center'}}>
                Additional help documents can be found in the Menu -&gt; Help -&gt; Documentation
              </Text>
            </View>
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
        )
      }
      {/*<Divider sectionText={'export'}/>*/}
      {/*{renderExportButtons()}*/}
      {/*<Divider sectionText={'restore project from backup'}/>*/}
    </View>
  );
};

export default UploadBackAndExport;
