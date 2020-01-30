import React, {useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import Divider from '../components/settings-panel/HomePanelDivider';
import {Button} from 'react-native-elements';
import commonStyles from '../shared/common.styles';
import {homeReducers} from '../views/home/Home.constants';
import styles from './Project.styles';
import {useDispatch, useSelector} from 'react-redux';
import UploadDialogBox from './UploadDialogBox';
import useImagesHook from '../components/images/useImages';
import useProjectHook from './useProject';

const UploadBackAndExport = (props) => {
  const [useImages] = useImagesHook();
  const [useProject] = useProjectHook();
  const [activeDatasets, setActiveDatasets] = useState(null);
  const [isUploadDialogVisible, setIsUploadDialogVisible] = useState(false);
  const dispatch = useDispatch();
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

  const initializeUpload = () => {
    console.log('Initializing Upload');
    const filteredDatasets = Object.values(datasets).filter(dataset => {
      return dataset.active === true;
    });
    setActiveDatasets(filteredDatasets);
    setIsUploadDialogVisible(true);
  };

  const upload = () => {
    // dispatch({type: homeReducers.SET_STATUS_BOX_LOADING, bool: true});
    return uploadProject()
      .then(uploadDatasets)
      .catch(err => {
        dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
        if (err.status) dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: `Error uploading project: Status \n ${err.status}`});
        else dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: `Error uploading project: \n ${err}`});
      })
      .finally(() => {
          useImages.deleteTempImagesFolder().then(()=> {
            dispatch({type: homeReducers.SET_STATUS_BOX_LOADING, value: false});
            dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Upload Complete!'});
          });
        },
      );
  };

  const uploadDatasets = async () => {
    await useProject.uploadDatasets();
      return Promise.resolve();
  };

  const uploadProject = async () => {
    setIsUploadDialogVisible(false);
    await useProject.uploadProject();
    return Promise.resolve();
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
      <View>
        <Text>The following project properties and the active datasets will be uploaded and will
          <Text style={styles.dialogContentText}> OVERWRITE</Text> the project
          properties and selected datasets on the server: </Text>
        <View style={{alignItems: 'center', paddingTop: 15}}>
          <FlatList
            data={activeDatasets}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => renderNames(item)}
          />
        </View>
        <Text style={{textAlign: 'center', paddingTop: 15}}>Do you want to continue?</Text>
      </View>
    </UploadDialogBox>
  );

  return (
    <React.Fragment>
      <Divider sectionText={'upload and backup'}/>
      {renderUploadAndBackupButtons()}
      <Divider sectionText={'export'}/>
      {renderExportButtons()}
      <Divider sectionText={'restore project from backup'}/>
      {renderUploadDialogBox()}
    </React.Fragment>
  );
};

export default UploadBackAndExport;
