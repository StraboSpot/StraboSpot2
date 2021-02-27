import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {BLUE} from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
import Spacer from '../../shared/ui/Spacer';
import {setBackupModalVisible, setSelectedProject, setUploadModalVisible} from '../home/home.slice';

const UploadBackAndExport = () => {

  const dispatch = useDispatch();
  const isOnline = useSelector(state => state.home.isOnline);

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

  const renderUploadAndBackupButtons = () => {
    return (
      <View>
        <Button
          title={isOnline ? 'Upload project to StraboSpot' : 'Need to be ONLINE to upload'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => {
            dispatch(setSelectedProject({source: '', project: ''}));
            dispatch(setUploadModalVisible(true));
          }}
          disabled={!isOnline}
        />
        <Button
          title={'Backup project to device'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => {
            dispatch(setSelectedProject({source: '', project: ''}));
            dispatch(setBackupModalVisible(true));
          }}
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
