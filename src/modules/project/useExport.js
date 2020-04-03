import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';

const useExport = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectory = '/StraboSpot';
  const dataBackupsDirectory = devicePath + appDirectory + '/DataBackups';

  const backupProjectToDevice = async () => {
    await doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups);
    console.log('Next')
    const res = await checkDistributionDataDir();
    console.log('Next', res)
  };

  const checkDistributionDataDir = async () => {
   return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/data').then( checkDirSuccess => {
      if (checkDirSuccess) {
        console.log('data folder exists', checkDirSuccess);
         return RNFetchBlob.fs.unlink(devicePath + appDirectoryForDistributedBackups + '/data').then(() => {
          console.log('Success removing', appDirectoryForDistributedBackups + '/data');
          return RNFetchBlob.fs.mkdir(devicePath + appDirectoryForDistributedBackups + '/data').then(createDirSuccess => {
            console.log('Success creating', appDirectoryForDistributedBackups + '/data');
            return Promise.resolve(devicePath + appDirectoryForDistributedBackups + '/data')
          })
            .catch(err => {
              console.log('Error making directory', err);
              return Promise.reject(err.message);
            });
        });
      }
      else {
        console.log('Data folder does not exist');
         return RNFetchBlob.fs.mkdir(devicePath + appDirectoryForDistributedBackups + '/data').then(createDirSuccess => {
          console.log('Directory', appDirectoryForDistributedBackups + '/data', 'created.', createDirSuccess);
          return Promise.resolve(devicePath + appDirectoryForDistributedBackups + '/data');
        })
          .catch(err => {
            console.log('Error making directory', err);
            return Promise.reject(err.message);
          });
      }
    });
    // return Promise.resolve();
  };

  const doesDeviceDirectoryExist = async (directory) => {
    return await RNFetchBlob.fs.isDir(directory).then(checkDirSuccess => {
      if (checkDirSuccess) {
        console.log('Directory', directory, 'exists.', checkDirSuccess);
        return Promise.resolve(directory);
      }
      else {
        return RNFetchBlob.fs.mkdir(directory)
          .then(checkDirectorySuccess => {
            console.log('Directory', directory, 'created', checkDirectorySuccess);
            return Promise.resolve(directory);
          })
          .catch(createDirError => {
            console.log('Unable to create directory', directory, createDirError);
            return Promise.reject(createDirError);
          });
      }
    });
  };

  const exportHelpers = {
    backupProjectToDevice: backupProjectToDevice,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
  };

  return [exportHelpers];
}

export default useExport;
