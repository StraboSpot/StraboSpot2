import {Linking} from 'react-native';

import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';

import {csvToArray, getNewUUID, urlValidator} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setStatusMessagesModalVisible,
  setLoadingStatus, setErrorMessagesModalVisible,
} from '../home/home.slice';
import {editedSpotProperties} from '../spots/spots.slice';

const useExternalData = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  let CSVObject = {};

  const CSVPicker = async () => {
    try {

      dispatch(setLoadingStatus({view: 'home', bool: true}));
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.csv],
      });
      console.log({
          uri: res.uri,
          type: res.type,
          name: res.name,
          size: res.size,
        },
      );
      const id = getNewUUID();
      const CSVData = await RNFS.readFile(res.uri);
      const csvToArrayRes = csvToArray(CSVData);
      CSVObject = {
        id: id,
        name: res.name,
        data: csvToArrayRes,
        size: res.size,
      };
      console.log('CSVObject', CSVObject);
      saveCSV(CSVObject);
      console.log('.CSV saved successfully!');
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
    catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled', err);
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        // User cancelled the picker, exit any dialogs or menus and move on
      }
      else {
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage(`Something went wrong opening ${CSVObject.name}!`));
        dispatch(addedStatusMessage('No such file or directory!'));
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
    dispatch(editedSpotProperties({field: 'data', value: {tables: filteredArr}}));
  };

  const deleteUrl = (urlToDelete) => {
    const urlCopy = JSON.parse(JSON.stringify(spot.properties.data.urls));
    console.log(urlCopy);
    const filteredArr = urlCopy.filter(url => url !== urlToDelete);
    console.log(filteredArr);
    dispatch(editedSpotProperties({field: 'data', value: {urls: filteredArr}}));
  };

  const openUrl = async (urlToOpen) => {
    try {
      const supported = await Linking.canOpenURL(urlToOpen);
      console.log(supported);
      if (supported) await Linking.openURL(urlToOpen);
      else {
        console.log('Could not open:', urlToOpen);
      }
    }
    catch (err) {
      console.error('Error opening url', urlToOpen, ':', err);
    }
  };

  const saveCSV = () => {
    try {
      let savedTables;
      let editedData = spot.properties.data ? JSON.parse(JSON.stringify(spot.properties.data)) : {};
      if (spot.properties.data?.tables) savedTables = spot.properties.data.tables;
      console.log(savedTables);
      if (!editedData.tables) editedData.tables = [];
      editedData.tables.push(CSVObject);
      console.log(editedData);
      dispatch(editedSpotProperties({field: 'data', value: editedData}));
    }
    catch (err) {
      console.error('Error saving .CSV file');
    }
  };

  const saveEdits = (urlToEdit) => {
    const urlArrCopy = JSON.parse(JSON.stringify(spot.properties.data.urls));
    urlArrCopy.splice(urlToEdit.index, 1, urlToEdit.url);
    dispatch(editedSpotProperties({field: 'data', value: {urls: urlArrCopy}}));
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
    CSVPicker: CSVPicker,
    deleteCVS: deleteCVS,
    deleteUrl: deleteUrl,
    openUrl: openUrl,
    saveCSV: saveCSV,
    saveEdits: saveEdits,
    saveURL: saveURL,
  };
};

export default useExternalData;
