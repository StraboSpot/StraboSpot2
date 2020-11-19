import React, {useState} from 'react';
import {ScrollView, Switch, Text, View} from 'react-native';

import {Button, Icon, ListItem} from 'react-native-elements';
import Dialog, {DialogButton, DialogFooter, DialogTitle, FadeAnimation} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, truncateText} from '../../shared/Helpers';
import TexInputModal from '../../shared/ui/GeneralTextInputModal';
import {setProjectLoadComplete} from '../home/home.slice';
import useProjectHook from '../project/useProject';
import styles from './project.styles';
import {updatedDatasetProperties} from './projects.slice';

const DatasetList = () => {
  const [useProject] = useProjectHook();

  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [isDatasetNameModalVisible, setIsDatasetNameModalVisible] = useState(false);
  const [selectedDataset, setSelectedDatasetProperties] = useState({});

  const dispatch = useDispatch();
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);

  const editDataset = (id, name) => {
    setSelectedDatasetProperties({name: name, id: id});
    setIsDatasetNameModalVisible(true);
  };

  const initializeDeleteDataset = () => {
    setIsDatasetNameModalVisible(false);
    setIsDeleteConfirmModalVisible(false);
    if (selectedDataset && selectedDataset.id) useProject.destroyDataset(selectedDataset.id).catch(console.log);
    else console.error('Selected dataset or id is undefined!');
  };

  const isDisabled = (id) => {
    return (activeDatasetsIds.length === 1 && activeDatasetsIds[0] === id) || selectedDatasetId === id;
  };

  const renderDatasets = () => {
    if (!isEmpty(datasets)) {
      return (
        <ScrollView>
          {Object.values(datasets).map((item, i, obj) => {
            return (
              <ListItem
                key={item.id}
                containerStyle={styles.projectDescriptionListContainer}
                bottomDivider={i < obj.length - 1}
              >
                <Icon
                  name='edit'
                  type={'material'}
                  size={20}
                  color='darkgrey'
                  onPress={() => editDataset(item.id, item.name)}
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
                  disabled={isDisabled(item.id)}
                />
              </ListItem>
            );
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
          onChangeText={(text) => setSelectedDatasetProperties({...selectedDataset, name: text})}
        >
          <Button
            title={'Delete Dataset'}
            titleStyle={{color: 'red'}}
            type={'clear'}
            disabled={isDisabled(selectedDataset.id)}
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
              <Text style={[styles.dialogContentImportantText, {paddingTop: 10, textAlign: 'center'}]}>
                {selectedDataset.name} can not be deleted while still selected as the current dataset.
              </Text>
            </View>
          )}
        </TexInputModal>
      </View>
    );
  };

  const renderDeleteConfirmationModal = () => {
    return (
      <Dialog
        dialogStyle={[styles.dialogBox, {position: 'absolute', top: '25%'}]}
        width={300}
        visible={isDeleteConfirmModalVisible}
        dialogAnimation={new FadeAnimation({animationDuration: 300, useNativeDriver: true})}
        useNativeDriver={true}
        dialogTitle={
          <DialogTitle
            style={styles.dialogTitle}
            textStyle={styles.dialogTitleText}
            title={'Confirm Delete!'}
          />
        }
        footer={
          <DialogFooter>
            <DialogButton text={'Delete'} onPress={() => initializeDeleteDataset()}/>
            <DialogButton text={'Cancel'} onPress={() => setIsDeleteConfirmModalVisible(false)}/>
          </DialogFooter>
        }
      >
        <View style={styles.dialogContent}>
          <Text style={{textAlign: 'center'}}>Are you sure you want to delete Dataset
            {selectedDataset && selectedDataset.name
            && <Text style={styles.dialogContentImportantText}>{'\n' + selectedDataset.name}</Text>}
            ?
          </Text>
          <Text style={styles.dialogConfirmText}>This will
            <Text style={styles.dialogContentImportantText}> ERASE </Text>
            everything in this dataset including Spots, images, and all other data!
          </Text>
        </View>
      </Dialog>
    );
  };

  const saveDataset = () => {
    dispatch(updatedDatasetProperties(selectedDataset));
    setIsDatasetNameModalVisible(false);
  };

  const setSwitchValue = async (val, dataset) => {
    await useProject.setSwitchValue(val, dataset);
    dispatch(setProjectLoadComplete(true));
  };

  return (
    <View>
      {renderDatasets()}
      {renderDatasetNameChangeModal()}
      {renderDeleteConfirmationModal()}
    </View>
  );
};

export default DatasetList;
