import React, {useEffect, useState} from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {Button, Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useDownloadHook from '../../services/useDownload';
import commonStyles from '../../shared/common.styles';
import {truncateText,isEmpty} from '../../shared/Helpers';
import DeleteConformationDialogBox from '../../shared/ui/DeleteConformationDialogBox';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import TextInputModal from '../../shared/ui/GeneralTextInputModal';
import {setProjectLoadComplete} from '../home/home.slice';
import useProjectHook from '../project/useProject';
import styles from './project.styles';
import {updatedDatasetProperties} from './projects.slice';

const DatasetList = () => {
  const [useProject] = useProjectHook();
  const useDownload = useDownloadHook();

  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [isDatasetNameModalVisible, setIsDatasetNameModalVisible] = useState(false);
  const [selectedDataset, setSelectedDatasetProperties] = useState({});

  const dispatch = useDispatch();
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);

  useEffect(() => {
    console.log('In Dataset List UE');
    console.log('DATASET WITH IMAGES', datasets);

  }, [datasets]);

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

  const renderDatasetListItem = (dataset) => {
    const spotsInDataset = dataset.spotIds
      ? `${dataset?.spotIds.length} spot${dataset?.spotIds.length !== 1 ? 's' : ''}`
      : '0 spots';
    const imagesNeededOfTotal = `${dataset?.images?.neededImagesIds?.length}/${dataset?.images?.imageIds?.length} images needed`;
    return (
      <ListItem
        key={dataset.id}
        containerStyle={commonStyles.listItem}
      >
        <Icon
          name='edit'
          type={'material'}
          size={20}
          color='darkgrey'
          onPress={() => editDataset(dataset.id, dataset.name)}
        />
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{truncateText(dataset.name, 18)}</ListItem.Title>
          <ListItem.Subtitle>
            {spotsInDataset},{'\n'} {imagesNeededOfTotal}
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          onValueChange={(value) => setSwitchValue(value, dataset)}
          value={activeDatasetsIds.some(activeDatasetId => activeDatasetId === dataset.id)}
          disabled={isDisabled(dataset.id)}
        />
        <View >
          <Icon
            name={'image-outline'}
            type={'ionicon'}
            size={20}
            containerStyle={{paddingBottom: 5}}
          />
          <Icon
            name={isEmpty(dataset?.images?.neededImagesIds) ? 'checkmark-outline' : 'file-download'}
            type={isEmpty(dataset?.images?.neededImagesIds) ? 'ionicon' : 'material'}
            size={20}
            color={isEmpty(dataset?.images?.neededImagesIds) && 'green'}
            onPress={() => useDownload.initializeDownloadImages(dataset?.images?.neededImagesIds, dataset)}
          />
        </View>
      </ListItem>
    );
  };

  const renderDatasetNameChangeModal = () => {
    return (
      <View style={{backgroundColor: 'red', alignContent: 'flex-start'}}>
        <TextInputModal
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
            buttonStyle={{padding: 0}}
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
        </TextInputModal>
      </View>
    );
  };

  const renderDeleteConfirmationModal = () => {
    return (
      <DeleteConformationDialogBox
        title={'Confirm Delete!'}
        visible={isDeleteConfirmModalVisible}
        cancel={() => setIsDeleteConfirmModalVisible(false)}
        delete={() => initializeDeleteDataset()}
      >
        <Text style={{textAlign: 'center'}}>Are you sure you want to delete Dataset
          {selectedDataset && selectedDataset.name
          && <Text style={styles.dialogContentImportantText}>{'\n' + selectedDataset.name}</Text>}
          ?
        </Text>
        <Text style={styles.dialogConfirmText}>
          This will
          <Text style={styles.dialogContentImportantText}> ERASE </Text>
          everything in this dataset including Spots, images, and all other data!
        </Text>
      </DeleteConformationDialogBox>
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
    <View style={{flex: 1}}>
      <FlatList
        keyExtractor={(item) => item.id}
        data={Object.values(datasets)}
        renderItem={({item}) => renderDatasetListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
      {renderDatasetNameChangeModal()}
      {renderDeleteConfirmationModal()}
    </View>
  );
};

export default DatasetList;
