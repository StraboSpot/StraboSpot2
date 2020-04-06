import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {Platform} from 'react-native';

const useExport = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectory = '/StraboSpot';
  const dataBackupsDirectory = devicePath + appDirectory + '/DataBackups';

  const dbs = useSelector(state => state);
  // dbs.project = {}

  const backupProjectToDevice = async (exportedFileName) => {
    await doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups);
    // console.log('Next')
    // const dataDir = await checkDistributionDataDir();
    // console.log('Next', dataDir);
    const dataJson = await gatherDataForDistribution();
    // console.log('DataJson', dataJson);
    const exportToDevice = await exportData(devicePath + appDirectoryForDistributedBackups + '/' + exportedFileName, dataJson, 'data.json');
    console.log('exportData', exportToDevice);

  };

  const checkDistributionDataDir = async () => {
    if (devicePath){
      return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/data').then( checkDirSuccess => {
        //exists. delete then add
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
        //doesn't exist, just create
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
    }
    else return Promise.reject('Device Not Found!');
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

  const exportData = (directory, data, filename) => {
    // let dir = directory.split('/');
    // dir.pop();
    // const rootDir = dir.join('/');
    return doesDeviceDirectoryExist(directory).then((fullPath) => {
      console.log('ROOT', fullPath)
      return RNFetchBlob.fs.writeFile(directory + '/data.json', JSON.stringify(data), 'utf8')
        .then(() => Promise.resolve('File written to device'));
    });
  };

  const gatherDataForDistribution = () => {
    const dbsStateCopy = JSON.parse(JSON.stringify(dbs));
    let activeDatasets = [];
    let currentDataset = {};
    let spots = dbsStateCopy.spot.spots;
    let configDb = {};
    let mapNamesDb = {};
    let mapTilesDb = {};
    let json = {
      mapNamesDb: mapNamesDb,
      mapTilesDb: mapTilesDb,
      projectDb: dbsStateCopy.project.project,
      spotsDb: spots,
    };
    Object.values(dbsStateCopy.project.datasets).map(dataset => {
      const datasetKey = 'dataset_' + dataset.id;
      const spotsInDatasetKey = 'spots_' + dataset.id;
      if (dataset.current && dataset.current === true) currentDataset = dataset;
      if (dataset.active && dataset.active === true) activeDatasets.push(dataset);
      json.projectDb = {
        ...json.projectDb,
        activeDatasets: activeDatasets,
        [datasetKey]: dataset,
        [spotsInDatasetKey]: dataset.spotIds,
        'spots_dataset': currentDataset,
      };
      delete dataset.active;
      delete dataset.current;
    });
    json.projectDb.activeDatasets.map(dataset => {
      delete dataset.active;
      delete dataset.current;
    });
    delete json.projectDb.self;
    delete json.projectDb.projecttype;
    console.log('JsonCopy', json)
    return Promise.resolve(json);
  };

  const exportHelpers = {
    backupProjectToDevice: backupProjectToDevice,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
  };

  return [exportHelpers];
};

export default useExport;
