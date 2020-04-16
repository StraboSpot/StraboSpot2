import {useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {Alert, Platform} from 'react-native';
import {projectReducers} from './project.constants';

const useExport = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectory = '/StraboSpot';
  const imagesDirectory = appDirectory + '/Images';
  const dataBackupsDirectory = devicePath + appDirectory + '/DataBackups';

  const dispatch = useDispatch();
  const dbs = useSelector(state => state);
  // dbs.project = {}

  const backupProjectToDevice = async (exportedFileName) => {
    await doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups);
    // console.log('Next')
    // const dataDir = await checkDistributionDataDir();
    // console.log('Next', dataDir);
    // const dataForExport = await gatherDataForDistribution();  // Data can be backwards compatible with Strabo 1 (unfinished)
    const dataForExport = await gatherDataForBackup();
    // console.log('DataJson', dataJson);
    await exportData(devicePath + appDirectoryForDistributedBackups + '/' + exportedFileName, dataForExport, '/data.json');
    await doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups + '/' + exportedFileName + '/Images');
    const imageSuccess = await gatherImagesForDistribution(dataForExport, exportedFileName)
    console.log('Resolve Message:',imageSuccess.message);
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
        // If directory does not exist then one is created
        return RNFetchBlob.fs.mkdir(directory)
          .then(checkDirectorySuccess => {
            console.log('Directory', directory, 'created', checkDirectorySuccess);
            dispatch({type: projectReducers.BACKUP_DIRECTORY_EXISTS, bool: checkDirectorySuccess});
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
      return RNFetchBlob.fs.writeFile(directory + filename, JSON.stringify(data), 'utf8');
    });
  };

  // const gatherDataForDistribution = () => {
  //   const dbsStateCopy = JSON.parse(JSON.stringify(dbs));
  //   let activeDatasets = [];
  //   let currentDataset = {};
  //   let spots = dbsStateCopy.spot.spots;
  //   let configDb = {};
  //   let mapNamesDb = {};
  //   let mapTilesDb = {};
  //   let json = {
  //     mapNamesDb: mapNamesDb,
  //     mapTilesDb: mapTilesDb,
  //     projectDb: dbsStateCopy.project.project,
  //     spotsDb: spots,
  //   };
  //   Object.values(dbsStateCopy.project.datasets).map(dataset => {
  //     const datasetKey = 'dataset_' + dataset.id;
  //     const spotsInDatasetKey = 'spots_' + dataset.id;
  //     if (dataset.current && dataset.current === true) currentDataset = dataset;
  //     if (dataset.active && dataset.active === true) activeDatasets.push(dataset);
  //     json.projectDb = {
  //       ...json.projectDb,
  //       activeDatasets: activeDatasets,
  //       [datasetKey]: dataset,
  //       [spotsInDatasetKey]: dataset.spotIds,
  //       'spots_dataset': currentDataset,
  //     };
  //     delete dataset.active;
  //     delete dataset.current;
  //   });
  //   json.projectDb.activeDatasets.map(dataset => {
  //     delete dataset.active;
  //     delete dataset.current;
  //   });
  //   delete json.projectDb.self;
  //   delete json.projectDb.projecttype;
  //   console.log('JsonCopy', json)
  //   return Promise.resolve(json);
  // };

  const gatherDataForBackup = () => {
    const dbsStateCopy = JSON.parse(JSON.stringify(dbs));
    let spots = dbsStateCopy.spot.spots;
    // let configDb = {};
    let mapNamesDb = {};
    let mapTilesDb = {};
    let json = {
      mapNamesDb: mapNamesDb,
      mapTilesDb: mapTilesDb,
      projectDb: dbsStateCopy.project,
      spotsDb: spots,
    };
    console.log('JsonCopy', json);
    return Promise.resolve(json);
  };

  const gatherImagesForDistribution = async (data, fileName) => {
    console.log('data:', data);
    let promises = [];
    if (data.spotsDb) {
      console.log('Spots Exist!');
      Object.values(data.spotsDb).map(spot => {
        if (spot.properties.images) {
          console.log('Spot with images', spot.properties.name, 'Images:' , spot.properties.images);
          spot.properties.images.map(image => {
            const promise = moveDistributedImage(image.id, fileName).then(moveFileSuccess => {
              console.log('Moved file:', moveFileSuccess);
            });
            promises.push(promise);
          });
          console.log('Image Promises', promises)
        }
      });
      return Promise.all(promises).then(() => {
        // console.log('Finished moving all images to distribution folder.');
        return Promise.resolve({message: 'Finished moving all images to distribution folder.'});
      });
    }
  };

  const moveDistributedImage = async (image_id, fileName) => {
    return RNFetchBlob.fs.exists(devicePath + imagesDirectory + '/' + image_id + '.jpg')
      .then(exists => {
      console.log(`file exists: ${devicePath + imagesDirectory + '/' + image_id + '.jpg'} : ${exists}`);
      return RNFetchBlob.fs.cp(devicePath + imagesDirectory + '/' + image_id + '.jpg',
        devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/Images/' + image_id + '.jpg')
        .then(res => {
          console.log('Image Copy res', res);
          return Promise.resolve(res);
        })
        .catch(err => {
          console.log('Image copy ERROR', err);
          return Promise.reject(err);
        });
    })
      .catch(err => Alert.alert('ERROR', err.toString()));
    // return Promise.resolve();
  };

  const exportHelpers = {
    backupProjectToDevice: backupProjectToDevice,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
  };

  return [exportHelpers];
};

export default useExport;
