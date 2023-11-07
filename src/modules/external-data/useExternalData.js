import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import {csvToArray, getNewUUID, urlValidator} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setErrorMessagesModalVisible,
  setLoadingStatus,
  setStatusMessagesModalVisible,
} from '../home/home.slice';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotProperties} from '../spots/spots.slice';

const useExternalData = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const useDevice = useDeviceHook();

  let csvObject = {};

  const pickCSV = async () => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      const res = await useDevice.pickCSV();
      console.log({uri: res.uri, type: res.type, name: res.name, size: res.size});
      csvObject.name = res.name;
      csvObject.size = res.size;
      csvObject.id = getNewUUID();
      const CSVData = await useDevice.readFile(res.uri);
      if (CSVData) {
        csvObject.data = csvToArray(CSVData);
        console.log('CSV Object', csvObject);
        saveCSV(csvObject);
        console.log('.CSV saved successfully!');
        dispatch(setLoadingStatus({view: 'home', bool: false}));
      }
      else throw Error('Error reading file');
    }
    catch (err) {
      if (useDevice.isPickDocumentCanceled(err)) {
        console.log('User canceled', err);
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        // User cancelled the picker, exit any dialogs or menus and move on
      }
      else {
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage(`Something went wrong opening ${csvObject.name}!`));
        if (err === 'Error reading file') dispatch(addedStatusMessage('Error reading file'));
        else dispatch(addedStatusMessage('No such file or directory!'));
        dispatch(setErrorMessagesModalVisible(true));
        throw err;
      }
    }
  };

  const deleteCVS = (tableToDelete) => {
    const CSVcopy = JSON.parse(JSON.stringify(spot.properties.data.tables));
    console.log(CSVcopy);
    const filteredArr = CSVcopy.filter(table => table.id !== tableToDelete.id);
    console.log(filteredArr);
    dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
    dispatch(editedSpotProperties({field: 'data', value: {tables: filteredArr, urls: spot.properties.data.urls}}));
  };

  const deleteURL = (urlToDelete) => {
    const urlCopy = JSON.parse(JSON.stringify(spot.properties.data.urls));
    console.log(urlCopy);
    const filteredArr = urlCopy.filter(url => url !== urlToDelete);
    console.log(filteredArr);
    dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
    dispatch(editedSpotProperties({field: 'data', value: {urls: filteredArr, tables: spot.properties.data.tables}}));
  };

  const saveCSV = () => {
    try {
      let savedTables;
      let editedData = spot.properties.data ? JSON.parse(JSON.stringify(spot.properties.data)) : {};
      if (spot.properties.data?.tables) savedTables = spot.properties.data.tables;
      console.log(savedTables);
      if (!editedData.tables) editedData.tables = [];
      editedData.tables.push(csvObject);
      console.log(editedData);
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: 'data', value: editedData}));
    }
    catch (err) {
      console.error('Error saving .CSV file');
    }
  };

  const saveEdits = (urlToEdit) => {
    let editedData = spot.properties.data ? JSON.parse(JSON.stringify(spot.properties.data)) : {};
    const urlArrCopy = editedData.urls;
    urlArrCopy.splice(urlToEdit.index, 1, urlToEdit.url);
    dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
    dispatch(editedSpotProperties({field: 'data', value: editedData}));
  };

  const saveURL = (protocol, url) => {
    let savedUrls;
    const fullURL = (protocol + url).toLowerCase();
    console.log(fullURL);
    let editedData = spot.properties.data ? JSON.parse(JSON.stringify(spot.properties.data)) : {};
    if (spot.properties.data?.urls) savedUrls = spot.properties.data.urls;
    const valid = urlValidator(fullURL.toLowerCase());
    if (valid) {
      if (!savedUrls?.includes(fullURL)) {
        if (!editedData?.urls) editedData.urls = [];
        editedData.urls.push(fullURL.toLowerCase());
        dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
        dispatch(editedSpotProperties({field: 'data', value: editedData}));
      }
      else {
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage('URL is already in list.'));
        dispatch(setStatusMessagesModalVisible(true));
      }
    }
    else throw Error();
  };

  return {
    pickCSV: pickCSV,
    deleteCVS: deleteCVS,
    deleteURL: deleteURL,
    saveEdits: saveEdits,
    saveURL: saveURL,
  };
};

export default useExternalData;
