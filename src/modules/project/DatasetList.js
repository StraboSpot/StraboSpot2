import React, {useState, useEffect} from 'react';
import {ScrollView, Switch, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Icon, ListItem} from 'react-native-elements';
import Dialog, {
  DialogTitle,
  DialogButton,
  DialogFooter,
  FadeAnimation,
} from 'react-native-popup-dialog';

import {isEmpty, truncateText} from '../../shared/Helpers';
import Loading from '../../shared/ui/Loading';
import TexInputModal from '../../shared/ui/GeneralTextInputModal';

// Constants
import {projectReducers} from './project.constants';

// Hooks
import useSpotsHook from '../spots/useSpots';
import useProjectHook from '../project/useProject';
import {homeReducers} from '../home/home.constants';

// Styles
import styles from './project.styles';

const DatasetList = () => {

  const [useSpots] = useSpotsHook();
  const [useProject] = useProjectHook();
  const [loading, setLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState({});
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [isDatasetNameModalVisible, setIsDatasetNameModalVisible] = useState(false);
  const datasets = useSelector(state => state.project.datasets);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect (() => {
    console.log('Datasets in useEffect', datasets)
  }, [datasets])

  const deleteDataset = async () => {
    setIsDatasetNameModalVisible(false);
    setIsDeleteConfirmModalVisible(false);
    await useProject.destroyDataset(selectedDataset.id);
  };

  const isDisabled = (id) => {
    const activeDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    return activeDatasets.length === 1 && activeDatasets[0].id === id;
  };

  const renderDatasets = () => {
    if (!isEmpty(datasets)) {
      return (
        <ScrollView>
          {Object.values(datasets).map((item) => {
            return <ListItem
              key={item.id}
              title={truncateText(item.name, 15)}
              containerStyle={styles.projectDescriptionListContainer}
              bottomDivider
              rightElement={
                <Switch
                  onValueChange={(value) => setSwitchValue(value, item.id)}
                  value={item.active}
                  disabled={isDisabled(item.id)}
                />}
              leftIcon={   <Icon
                name='edit'
                type={'material'}
                size={20}
                color='darkgrey'
                onPress={() => _selectedDataset(item.id, item.name)}
              />}
            />;
          })}
        </ScrollView>);
    }
  };

  const renderDatasetNameChangeModal = () => {
    return (
      <View style={{backgroundColor: 'red', alignContent: 'flex-start'}}>
      <TexInputModal
        dialogTitle={'Edit or Delete Dataset'}
        visible={isDatasetNameModalVisible}
        onPress={() => saveDataset()}
        close={() => setIsDatasetNameModalVisible(false)}
        value={selectedDataset.name}
        onChangeText={(text) => setSelectedDataset({...selectedDataset, name: text})}
      >
          <Button
            title={'Delete Dataset'}
            titleStyle={{color: 'red'}}
            type={'clear'}
            buttonStyle={{paddingTop: 20, padding: 0}}
            onPress={() => setIsDeleteConfirmModalVisible(true)}
            icon={
              <Icon
                iconStyle={{paddingRight: 10}}
                name='trash'
                type={'font-awesome'}
                size={20}
                color='red'
              />
            }
          />
      </TexInputModal>
      </View>
    );
  };

  const renderDeleteConformationModal = () => {
    return (
      <Dialog
        dialogStyle={[styles.dialogBox, {position: 'absolute', top: '25%'}]}
        width={300}
        visible={isDeleteConfirmModalVisible}
        dialogAnimation={new FadeAnimation({
          animationDuration: 300,
          useNativeDriver: true,
        })}
        useNativeDriver={true}
        dialogTitle={
          <DialogTitle
            style={styles.dialogTitle}
            textStyle={styles.dialogTitleText}
            title={'Confirm Delete!'}/>
        }
        footer={
          <DialogFooter>
            <DialogButton text={'Delete'} onPress={() => deleteDataset()}/>
            <DialogButton text={'Cancel'} onPress={() => setIsDeleteConfirmModalVisible(false)}/>
          </DialogFooter>
        }
      >
        <View style={styles.dialogContent}>
          <Text style={{textAlign: 'center'}}>Are you sure you want to delete
            {selectedDataset && selectedDataset.name ? <Text style={styles.dialogContentImportantText}>{'\n' + selectedDataset.name}</Text> : null}
            ?</Text>
          <Text style={styles.dialogConfirmText}>This will <Text style={styles.dialogContentImportantText}>ERASE</Text> everything in this dataset including features, images, and all other data!</Text>
          <Text style={styles.dialogConfirmText}>Do you want to delete?</Text>
        </View>
      </Dialog>
    );
  };

  const saveDataset = () => {
    dispatch({type: 'UPDATE_DATASET_PROPERTIES', dataset: selectedDataset});
    setIsDatasetNameModalVisible(false);
  };

  const _selectedDataset = (id, name) => {
      setSelectedDataset({name: name, id: id});
      setIsDatasetNameModalVisible(true);
  };

  const setSwitchValue = async (val, id) => {
    const datasetsCopy = {...datasets};
    datasetsCopy[id].active = val;

    // Check for a current dataset
    const i = Object.values(datasetsCopy).findIndex(data => data.current === true);
    if (val && i === -1) datasetsCopy[id].current = true;

    else if (!val && datasetsCopy[id].current) {
      datasetsCopy[id].current = false;
      const datasetsActive = Object.values(datasetsCopy).filter(dataset => dataset.active === true);
      datasetsCopy[datasetsActive[0].id].current = true;
    }
    if (isOnline && !isEmpty(userData) && !isEmpty(datasetsCopy[id]) && datasetsCopy[id].active &&
      isEmpty(datasetsCopy[id].spotIds)) {
      // dispatch({type: homeReducers.SET_LOADING, bool: true});
      setLoading(true);
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsCopy});
      dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, value: true});
      await useSpots.downloadSpots(datasets[id], userData.encoded_login);
      dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Download Complete!'});
      setLoading(false);
    }
    else {
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsCopy});
    }
  };

  return (
    <View style={{flex: 1}}>
      {renderDatasets()}
      {renderDatasetNameChangeModal()}
      {renderDeleteConformationModal()}
      {loading && <Loading style={{backgroundColor: 'transparent'}}/>}
    </View>
  );
};

export default DatasetList;
