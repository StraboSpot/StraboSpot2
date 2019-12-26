import React, {useState, useEffect} from 'react';
import {Alert, FlatList, ListView, Text, View} from 'react-native';
import Divider from '../components/settings-panel/HomePanelDivider';
import {Button, ListItem} from 'react-native-elements';
import commonStyles from '../shared/common.styles';
import {homeReducers} from '../views/home/Home.constants';
import styles from './Project.styles';
import sharedDialogStyles from '../shared/common.styles';
import {useDispatch, useSelector} from 'react-redux';
import {isEmpty} from '../shared/Helpers';
import UploadDialogBox from './UploadDialogBox';
import StatusDialogBox from '../shared/ui/StatusDialogBox';
import useServerRequests from '../services/useServerRequests';
import ProgressCircle from '../shared/ui/ProgressCircle';
import useSpots from '../spots/useSpots';

const UploadBackAndExport = (props) => {
  const [serverRequests] = useServerRequests();
  const [spotFactory] = useSpots();
  const [progress, setProgress] = useState(null);
  const [uploadErrors, setUploadErrors] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState(null);
  const [uploadConfirmText, setUploadConfirmText] = useState(null);
  const [isUploadDialogVisible, setIsUploadDialogVisible] = useState(false);
  const [isUploadStatusDialogBoxVisible, setIsUploadStatusDialogVisible] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const project = useSelector(state => state.project.project);
  const datasets = useSelector(state => state.project.datasets);
  const isOnline = useSelector(state => state.home.isOnline);

  const onBackupProject = () => {
    console.log('onBackupProject');
  };

  const onShareProjectAsCSV = () => {
    console.log('onShareProjectAsCSV');
  };

  const onShareNotebookAsPDF = () => {
    console.log('onShareNotebookAsPDF');
  };

  const onShareProjectAsShapefile = () => {
    console.log('onShareProjectAsShapefile');
  };

  const checkValidDateTime = (spots) => {
    const checkedSpot = spots.forEach(spot => {
      if (!spot.properties.date || !spot.properties.time) {
        let date = spot.properties.date || spot.properties.time;
        if (!date) {
          date = new Date(Date.now());
          date.setMilliseconds(0);
        }
        spot.properties.date = spot.properties.time = date.toISOString();
        console.log('SPOT', spot);
        // dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'date', value: date});
      }
    });
    console.log('CheckedSpot', checkedSpot);
    // return checkedSpot;
  };

  const initializeUpload = () => {
    console.log('Initializing Upload');
    const activeDatasets = Object.values(datasets).filter(dataset => {
      return dataset.active === true;
    });
    let ConfirmText = null;
    if (isEmpty(activeDatasets)) {
      ConfirmText = (
        <Text>No active datasets to upload! Only the project properties will be uploaded and will
          <Text style={styles.dialogContentText}> OVERWRITE </Text>
          <Text>the properties for this project on the server. Continue?'</Text>
        </Text>
      );
    }
    else {
      ConfirmText = (
        <View>
          <Text>The following project properties and the active datasets will be uploaded and will
            <Text style={styles.dialogContentText}> OVERWRITE</Text> the project
          properties and selected datasets on the server. Continue? {'\n'}</Text>
          <View style={{alignItems: 'center'}}>
            <FlatList
              data={activeDatasets}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => renderNames(item)}
            />
          </View>
          </View>
      );
    }
    setUploadConfirmText(ConfirmText);
    setIsUploadDialogVisible(true);
  };

  const makeNextRequest = (activeDatasets, currentRequest) => {
    return uploadDataset(activeDatasets[currentRequest]);
  };

  const upload = () => {
    // dispatch({type: homeReducers.SET_LOADING, bool: true});
    return uploadProject()
      .then(uploadDatasets)
      .catch(err => {
        console.log('Upload Errors');
        setUploadErrors(true);
      });
  };

  const uploadDataset = async (dataset) => {
    let datasetCopy = JSON.parse(JSON.stringify(dataset));
    delete datasetCopy.spotIds;
    delete datasetCopy.current;
    delete datasetCopy.active;
    const response = await serverRequests.updateDataset(datasetCopy, user.encoded_login);
    console.log('Finished updating dataset', response);
    const response2 = await serverRequests.addDatasetToProject(project.id, dataset.id, user.encoded_login);
    console.log('Finished updating dataset', response2);
    await uploadSpots(dataset);
    console.log('Spots Uploaded');
    setTimeout(() => {
      console.log('Finished Uploading Datasets');
      setIsUploadStatusDialogVisible(false);
    }, 1000);
  };

  const uploadDatasets = async () => {
    let currentRequest = 0;
    const activeDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    // Upload datasets synchronously
    await makeNextRequest(activeDatasets, currentRequest);
    currentRequest++;
    if (currentRequest > 0 && currentRequest < activeDatasets.length) {
      console.log('A');
    }
    if (currentRequest < activeDatasets.length) {
      console.log('MakeNextRequest', currentRequest);
      await makeNextRequest(activeDatasets, currentRequest);
    }
    else {
      dispatch({type: homeReducers.SET_LOADING, bool: false});
      setTimeout(() => {
        console.log('Finished Uploading Datasets');
        setIsUploadStatusDialogVisible(false);
      }, 2000);
    }
  };

  const uploadProject = async () => {
    setProgress(0);
    console.log('PROJECT UPLOADING...');
    setIsUploadDialogVisible(false);
    setIsUploadStatusDialogVisible(true);
    // await serverRequests.updateProject(project, user.encoded_login).then((response) => {
        try {
          const updatedProject = await serverRequests.updateProject(project, user.encoded_login);
          console.log('Finished uploading project', updatedProject);
          setUploadErrors(false);
          // dispatch({type: homeReducers.SET_LOADING, bool: false});
          setUploadStatusMessage(<Text>Uploaded project the properties for the project:
            <Text style={[styles.dialogContentText, {color: 'black'}]}> {project.description.project_name}</Text>
          </Text>);
          await setProgress(1);
          // setIsUploadDialogVisible(false);
          console.log('Going to uploadDatasets next')
        }
        catch (err) {
          setUploadErrors(true);
          // setIsUploadDialogVisible(false);
          setUploadStatusMessage(
            <Text style={{textAlign: 'center'}}>Error uploading project:
              <Text style={[styles.dialogContentText, {color: 'black'}]}> {project.description.project_name}</Text>
            </Text>);
          setIsUploadStatusDialogVisible(true);
          console.log('Error uploading project', project);
        }
      // }
    // );
  };

  const uploadSpots = async (dataset) => {
    let spots = await spotFactory.getSpotsByIds(dataset.spotIds);
    console.log('Spot', spots);
    // spots.forEach(spotValue => checkValidDateTime(spotValue));
    if (isEmpty(spots)) {
      Alert.alert('No Spots to Upload');
    }
    else {
      const spotCollection = {
        type: 'FeatureCollection',
        features: Object.values(spots),
      };
      return serverRequests.updateDatasetSpots(dataset.id, spotCollection, user.encoded_login);
    }
  };

  const renderUploadAndBackupButtons = () => {
    return (
      <View>
        <Button
          title={isOnline ? 'Upload project to StraboSpot' : 'Need to be ONLINE to upload'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => initializeUpload()}
          disabled={!isOnline}
        />
        <Button
          title={'Backup project to device'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onBackupProject()}
        />
      </View>
    );
  };

  const renderStatusDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={uploadErrors ? 'ERROR!' : 'SUCCESS!'}
        style={uploadErrors ? sharedDialogStyles.dialogTitleError : sharedDialogStyles.dialogTitleSuccess}
        buttonText={'OK'}
        visible={isUploadStatusDialogBoxVisible}
        cancel={() => setIsUploadStatusDialogVisible(false)}
        onTouchOutside={() => setIsUploadStatusDialogVisible(false)}
        disabled={progress !== 1 && !uploadErrors}
      >
        {uploadStatusMessage}
        <View style={styles.progressCircleContainer}>
          <ProgressCircle progress={progress} />
        </View>
      </StatusDialogBox>
    );
  };

  const renderExportButtons = () => {
    return (
      <View>
        <Button
          title={'Share Notebook as PDF'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onShareNotebookAsPDF()}
        />
        <Button
        title={'Share Project as CSV'}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => onShareProjectAsCSV()}
      />
        <Button
          title={'Share Project as Shapefile'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onShareProjectAsShapefile()}
        />
        <View style={{alignItems: 'center', margin: 10, marginTop: 10}}>
          <Text style={commonStyles.standardDescriptionText}>Exports should not be used as the only backup. Since the
          full database cannot be reconstructed from them.</Text>
        </View>
      </View>
    );
  };

  const renderNames = (item) => {
    const name = item.name;
    const maxLength = 30;
    const truncated = name.substr(0, maxLength);
    return <Text>{name.length > maxLength ? '- ' + truncated : '- ' + name}</Text>;
  };

  const renderUploadDialogBox = () => (
    <UploadDialogBox
      dialogTitle={'UPLOAD WARNING!'}
      visible={isUploadDialogVisible}
      cancel={() => setIsUploadDialogVisible(false)}
      onPress={() => upload()}
    >
      {uploadConfirmText}
    </UploadDialogBox>
  );

  return (
    <React.Fragment>
      <Divider sectionText={'upload and backup'}/>
      {renderUploadAndBackupButtons()}
      <Divider sectionText={'export'}/>
      {renderExportButtons()}
      <Divider sectionText={'restore project from backup'}/>
      <View style={styles.listContainer}>
      </View>
      {renderUploadDialogBox()}
      {renderStatusDialogBox()}
    </React.Fragment>
  );
};

export default UploadBackAndExport;
