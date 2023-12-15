import React from 'react';
import {Text, View} from 'react-native';

import {Button, Icon} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import projectStyles from './project.styles';
import {APP_DIRECTORIES} from '../../services/directories.constants';
import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import alert from '../../shared/ui/alert';
import {
  addedStatusMessage,
  setErrorMessagesModalVisible,
  setProjectLoadSelectionModalVisible,
} from '../home/home.slice';

const ImportProjectAndroid = (props) => {
  const dispatch = useDispatch();
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);

  const useDevice = useDeviceHook();
  const toast = useToast();

  const renderImportComplete = () => {
    return (
      <View>
        <View style={{padding: 10}}>
          <Text style={{textAlign: 'center'}}>Project has been saved to the app under MyStraboSpot --&gt;
            Projects on Device</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Button
            title={'Go to saved projects'}
            // onPress={() => loadProject()}
            onPress={() => {
              props.source && props.source('device');
              props.visibleSection('deviceProjects');
            }}
            type={'clear'}
            containerStyle={{alignItems: 'flex-start'}}
            titleStyle={commonStyles.standardButtonText}
          />
          {isProjectLoadSelectionModalVisible && (
            <Button
              title={'Close'}
              onPress={() => dispatch(setProjectLoadSelectionModalVisible(false))}
              type={'clear'}
              containerStyle={{alignItems: 'flex-start'}}
              titleStyle={commonStyles.standardButtonText}
            />
          )
          }
        </View>
      </View>
    );
  };

  const saveToDevice = async () => {
    try {
      props?.setLoading(true);
      const project = props.importedProject;
      await useDevice.unZipAndCopyImportedData(project);
      props?.setImportComplete(true);
      toast.show('Data and Images Have Been Saved!');
      props?.setLoading(false);
    }
    catch (err) {
      console.error('Error Writing Project Data', err);
      dispatch(setErrorMessagesModalVisible(true));
      dispatch(addedStatusMessage(err.toString()));
      props?.setLoading(false);
      props?.setImportComplete(false);
      throw Error();
    }
  };

  const verifyFileExistence = async (dataType) => {
    if (dataType === 'data') {
      const fileName = props.importedProject.name.replace('.zip', '');
      const fileExists = await useDevice.doesBackupFileExist(fileName);
      if (fileExists) {
        console.log('File already exits!');
        alert('File Exists', 'A file with the name ' + fileName + ' exists already.  Saving'
          + ' this will overwrite the current one.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Continue',
              onPress: () => saveToDevice(),
              style: 'cancel',
            },
          ]);
      }
      else {
        await useDevice.makeDirectory(APP_DIRECTORIES.BACKUP_DIR + fileName);
        await saveToDevice();
      }
    }
  };

  return (
    <View style={{padding: 10}}>
      {isProjectLoadSelectionModalVisible
        && (
          <Button
            onPress={() => props.goBackToMain()}
            type={'clear'}
            // title={'Back'}
            titleStyle={commonStyles.standardButtonText}
            containerStyle={{alignItems: 'flex-start'}}
            icon={
              <Icon
                name={'arrow-back'}
                type={'ionicon'}
                color={'black'}
                iconStyle={projectStyles.buttons}
                size={25}
              />
            }
          />
        )
      }


      {props.importComplete ? renderImportComplete()
        : (
          <View style={{alignItems: 'center'}}>
            <Text style={{fontWeight: 'bold'}}>Selected Project to Import:</Text>
            <Text>{props.importedProject.name}</Text>
            <Button
              title={'Unzip and Save'}
              type={'clear'}
              containerStyle={{marginTop: 20}}
              onPress={() => verifyFileExistence('data')}
            />
          </View>
        )
      }
    </View>
  );
};

export default ImportProjectAndroid;
