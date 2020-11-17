import {Platform} from 'react-native';

import RNFS from 'react-native-fs';
import {useDispatch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';


const useDevice = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = devicePath + '/StraboSpotProjects';
  const appDirectory = '/StraboSpot';
  const imagesDirectory = appDirectory + '/Images';

  const dispatch = useDispatch();

  const copyFiles = async (source, target) => {
    try {
      await RNFS.copyFile(source, target);
    }
    catch (err) {
      console.error('Error Copying Image Files to Backup');
      throw Error(err);
    }
  };

  const doesDeviceDirectoryExist = async (directory) => {
    try {
      const checkDirSuccess = await RNFetchBlob.fs.isDir(directory);
      if (checkDirSuccess) {
        console.log('Directory', directory, 'exists.', checkDirSuccess);
      }
      else {
        // If directory does not exist then one is created
        return RNFetchBlob.fs.mkdir(directory)
          .then(checkDirectorySuccess => {
            console.log('Directory:', directory, 'CREATED!');
            return checkDirectorySuccess;
          })
          .catch(createDirError => {
            console.error('Unable to create directory', directory, 'ERROR:', createDirError);
            throw Error;
          });
      }
      console.log(checkDirSuccess);
      return checkDirSuccess;
    }
    catch (err) {
      console.error('Error in doesDeviceDirectoryExist()', err);
      throw Error;
    }
  };

  const doesDeviceFileExist = async (id, extension) => {
    const imageExists = await RNFetchBlob.fs.exists(devicePath + imagesDirectory + '/' + id + extension);
    console.log('Image Exists:', imageExists);
    return imageExists;
  };

  const doesDeviceBackupDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) {
      return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/' + subDirectory);
    }
    else return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups);
  };

  const writeFileToDevice = (path, filename, data) => {
    return RNFS.writeFile(path + '/' + filename, JSON.stringify(data), 'utf8')
      .then(() => 'FILES WRITTEN SUCCESSFULLY!')
      .catch(err => console.error('Write Error!', err.message));
  };

  return {
    copyFiles: copyFiles,
    doesDeviceBackupDirExist: doesDeviceBackupDirExist,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
    doesDeviceFileExist: doesDeviceFileExist,
    writeFileToDevice: writeFileToDevice,
  };
};

export default useDevice;
