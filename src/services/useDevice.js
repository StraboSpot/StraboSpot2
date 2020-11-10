import {Platform} from 'react-native';

import {useDispatch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import {doesBackupDirectoryExist} from '../modules/project/projects.slice';

const useDevice = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = devicePath + '/StraboSpotProjects';
  const dispatch = useDispatch();

  const doesDeviceDirectoryExist = async (directory) => {
    try {
        const checkDirSuccess = await RNFetchBlob.fs.isDir(directory);
        if (checkDirSuccess) {
          console.log('Directory', directory, 'exists.', checkDirSuccess);
          // dispatch(doesBackupDirectoryExist(checkDirSuccess));
        }
        else {
          // If directory does not exist then one is created
          return RNFetchBlob.fs.mkdir(directory)
            .then(checkDirectorySuccess => {
              console.log('Directory', directory, 'created', checkDirectorySuccess);
              // dispatch(doesBackupDirectoryExist(checkDirSuccess));
            })
            .catch(createDirError => {
              console.log('Unable to create directory', directory, 'ERROR:', createDirError);
            });
        }
        return checkDirSuccess;
    }
    catch (err) {
      console.error('Error Checking If Directory Exists.');
    }
  };

  const doesDeviceBackupDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) {
      return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/' + subDirectory);
    }
    else return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups);
  };

  return {
    doesDeviceBackupDirExist: doesDeviceBackupDirExist,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
  };
};

export default useDevice;
