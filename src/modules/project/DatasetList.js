import React, {useState, useEffect} from 'react';
import {ScrollView, Switch, Text, View} from 'react-native';

import {Button, Icon, ListItem} from 'react-native-elements';
import {BallIndicator} from 'react-native-indicators';
import Dialog, {
  DialogTitle,
  DialogButton,
  DialogFooter,
  FadeAnimation,
} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import sharedDialogStyles from '../../shared/common.styles';
import {isEmpty, truncateText} from '../../shared/Helpers';
import TexInputModal from '../../shared/ui/GeneralTextInputModal';
import Loading from '../../shared/ui/Loading';
import StatusDialogBox from '../../shared/ui/StatusDialogBox';
import {addedStatusMessage, clearedStatusMessages, setStatusMessagesModalVisible} from '../home/home.slice';
import useProjectHook from '../project/useProject';
import useSpotsHook from '../spots/useSpots';
import {projectReducers} from './project.constants';
import styles from './project.styles';
import {updatedDatasetProperties, updatedDatasets, setActiveDatasets, setSelectedDataset} from './projects.slice';

const DatasetList = () => {

  const [useSpots] = useSpotsHook();
  const [useProject] = useProjectHook();
  const [loading, setLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState({});
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [isDatasetNameModalVisible, setIsDatasetNameModalVisible] = useState(false);
  const [isStatusMessagesModalVisible, setIsStatusMessagesModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('Datasets in useEffect', datasets);
    console.log('States in useEffect', isDeleteConfirmModalVisible, isDatasetNameModalVisible);
    deleteDataset();
  }, [datasets, isDeleting, activeDatasetsIds, isStatusMessagesModalVisible, selectedDatasetId]);

  const deleteDataset = async () => {
    if (!isDeleteConfirmModalVisible && !isDatasetNameModalVisible && isDeleting && selectedDataset && selectedDataset.id) {
      setIsDeleting(false);
      setLoading(true);
      setIsStatusMessagesModalVisible(true);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage({statusMessage: 'Deleting Dataset...'}));
      setTimeout(() => {
        useProject.destroyDataset(selectedDataset.id).then(() => {
          console.log('Dataset has been deleted!');
          setLoading(false);
        });
      }, 500);
    }
  };

  const initializeDelete = () => {
    setIsDatasetNameModalVisible(false);
    setIsDeleteConfirmModalVisible(false);
    setIsDeleting(true);
  };

  const isDisabled = (id) => {
    return activeDatasetsIds.length === 1 && activeDatasetsIds[0] === id;
  };

  const renderDatasets = () => {
    if (!isEmpty(datasets)) {
      return (
        <ScrollView>
          {Object.values(datasets).map((item, i, obj) => {
            return <ListItem
              key={item.id}
              containerStyle={styles.projectDescriptionListContainer}
              bottomDivider={i < obj.length - 1}
            >
              <Icon
                name='edit'
                type={'material'}
                size={20}
                color='darkgrey'
                onPress={() => _selectedDataset(item.id, item.name)}
              />
              <ListItem.Content>
                <ListItem.Title
                  style={styles.datasetListItemText}>{truncateText(item.name, 20)}
                </ListItem.Title>
                <ListItem.Subtitle style={styles.datasetListItemSpotCount}>
                  {item.spotIds
                    ? `(${item.spotIds.length} spot${item.spotIds.length !== 1 ? 's' : ''})`
                    : '(0 spots)'}
                </ListItem.Subtitle>
              </ListItem.Content>
              <Switch
                onValueChange={(value) => setSwitchValue(value, item)}
                value={activeDatasetsIds.some(dataset => dataset === item.id)}
                // value={false}
                disabled={isDisabled(item.id)}
              />
            </ListItem>;
          })}
        </ScrollView>);
    }
  };

  const renderDatasetNameChangeModal = () => {
    return (
      <View style={{backgroundColor: 'red', alignContent: 'flex-start'}}>
        <TexInputModal
          dialogTitle={'Edit or Delete Dataset'}
          style={styles.dialogTitle}
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
            disabled={isDisabled(selectedDataset.id)}
            // disabledTitleStyle={{color: 'yellow'}}
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
          {isDisabled(selectedDataset.id) && (
            <View>
              <Text style={[styles.dialogContentImportantText, {paddingTop: 10}]}>You must set another active dataset
                before you delete this dataset</Text>
            </View>
          )}
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
            <DialogButton text={'Delete'} onPress={() => initializeDelete()}/>
            <DialogButton text={'Cancel'} onPress={() => setIsDeleteConfirmModalVisible(false)}/>
          </DialogFooter>
        }
      >
        <View style={styles.dialogContent}>
          <Text style={{textAlign: 'center'}}>Are you sure you want to delete
            {selectedDataset && selectedDataset.name
              ? <Text style={styles.dialogContentImportantText}>{'\n' + selectedDataset.name}</Text>
              : null
            }
            ?
          </Text>
          <Text style={styles.dialogConfirmText}>This will<Text style={styles.dialogContentImportantText}>ERASE</Text>
            everything in this dataset including features, images, and all other data!</Text>
          <Text style={styles.dialogConfirmText}>Do you want to delete?</Text>
        </View>
      </Dialog>
    );
  };

  const renderStatusDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Delete Status'}
        style={sharedDialogStyles.dialogTitleSuccess}
        visible={isStatusMessagesModalVisible}
        onTouchOutside={() => dispatch(setStatusMessagesModalVisible({bool: false}))}
        // disabled={progress !== 1 && !uploadErrors}
      >
        <View style={{height: 100}}>

          {loading
            ? (
              <View style={{flex: 1}}>
                <BallIndicator
                  color={'darkgrey'}
                  count={8}
                  size={30}
                />
              </View>
            )
            : null
          }
          <View style={{flex: 1, paddingTop: 10}}>
            <Text style={{textAlign: 'center'}}>{statusMessages.join('\n')}</Text>
            {!loading && <Button
              title={'OK'}
              containerStyle={{paddingTop: 15}}
              type={'clear'}
              onPress={() => setIsStatusMessagesModalVisible(false)}
            />}
          </View>
        </View>
      </StatusDialogBox>
    );
  };

  const saveDataset = () => {
    dispatch(updatedDatasetProperties(selectedDataset));
    setIsDatasetNameModalVisible(false);
  };

  const _selectedDataset = (id, name) => {
    setSelectedDataset({name: name, id: id});
    setIsDatasetNameModalVisible(true);
  };

  const setSwitchValue = async (val, dataset) => {
    if (isOnline && !isEmpty(userData) && !isEmpty(dataset.spotIds) && selectedDataset.length > 1){
      setLoading(true);
        dispatch(setStatusMessagesModalVisible({bool: true}));
        dispatch(clearedStatusMessages());
        await useSpots.downloadSpots(dataset, userData.encoded_login);
      dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
        setLoading(false);
    }
    else await dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));


    // const datasetsCopy = JSON.parse(JSON.stringify(datasets));
    // datasetsCopy[id].active = val;

    // Check for a current dataset
    // const i = Object.values(datasetsCopy).findIndex(data => data.current === true);
    // if (val && i === -1) datasetsCopy[id].current = true;

    // else if (!val && datasetsCopy[id].current) {
    //   datasetsCopy[id].current = false;
    //   const datasetsActive = Object.values(datasetsCopy).filter(dataset => dataset.active === true);
    //   datasetsCopy[datasetsActive[0].id].current = true;
    // }

    // if (isOnline && !isEmpty(userData) && !isEmpty(datasetsCopy[id]) && datasetsCopy[id].active
    //   && isEmpty(datasetsCopy[id].spotIds)) {
    //   // dispatch({type: homeReducers.SET_LOADING, bool: true});
    //   setLoading(true);
    //   // dispatch(updatedDatasets(datasetsCopy));
    //   dispatch(setStatusMessagesModalVisible({bool: true}));
    //   dispatch(clearedStatusMessages());
    //   // await useSpots.downloadSpots(datasetsCopy[id], userData.encoded_login);
    //   dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
    //   setLoading(false);
    // }
    // else {
    //   dispatch(updatedDatasets(datasetsCopy));
    // }
  };

  return (
    <View style={{flex: 1}}>
      {renderStatusDialogBox()}
      {renderDatasets()}
      {renderDatasetNameChangeModal()}
      {renderDeleteConformationModal()}
      {loading && <Loading style={{backgroundColor: 'transparent'}}/>}
    </View>
  );
};

export default DatasetList;
