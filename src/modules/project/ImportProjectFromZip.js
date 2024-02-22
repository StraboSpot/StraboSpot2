import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {Button, Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import projectStyles from './project.styles';
import {APP_DIRECTORIES} from '../../services/directories.constants';
import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import alert from '../../shared/ui/alert';
import Loading from '../../shared/ui/Loading';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setErrorMessagesModalVisible,
  setProjectLoadSelectionModalVisible,
  setStatusMessageModalTitle,
} from '../home/home.slice';

const ImportProjectFromZip = ({
                                goBackToMain,
                                importComplete,
                                importedProject,
                                setImportComplete,
                                source,
                                visibleSection,
                              }) => {
  const dispatch = useDispatch();
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);

  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const useDevice = useDeviceHook();

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
              source && source('device');
              visibleSection('deviceProjects');
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
      setIsLoading(true);
      dispatch(setStatusMessageModalTitle('Importing Project...'));
      await useDevice.unZipAndCopyImportedData(importedProject);
      await useDevice.makeDirectory(APP_DIRECTORIES.BACKUP_DIR + fileName);
      setImportComplete(true);
      dispatch(setStatusMessageModalTitle('Project Imported'));
      setIsLoading(false);
    }
    catch (err) {
      console.error('Error Writing Project Data', err);
      dispatch(clearedStatusMessages());
      dispatch(setErrorMessagesModalVisible(true));
      dispatch(addedStatusMessage(err.toString()));
      setImportComplete(false);
      setIsLoading(false);
    }
  };

  const verifyFileExistence = async (dataType) => {
    if (dataType === 'data') {
      setFileName(importedProject.name.replace('.zip', ''));
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
        await saveToDevice();
      }
    }
  };

  return (
    <View style={{padding: 10}}>
      {isProjectLoadSelectionModalVisible && !isLoading
        && (
          <Button
            onPress={() => goBackToMain()}
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

      {importComplete ? renderImportComplete()
        : isLoading ? (
            <View style={{flex: 1, margin: 60}}>
              <Loading
                isLoading={isLoading}
                style={{}}
              />
            </View>
          )
          : (
            <View style={{alignItems: 'center'}}>
              <Text style={{fontWeight: 'bold'}}>Selected Project to Import:</Text>
              <Text>{importedProject.name}</Text>
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

export default ImportProjectFromZip;
