import React, {useState} from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {Button, Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useDownloadHook from '../../services/useDownload';
import commonStyles from '../../shared/common.styles';
import {isEmpty, truncateText} from '../../shared/Helpers';
import DeleteConformationDialogBox from '../../shared/ui/DeleteConformationDialogBox';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import TextInputModal from '../../shared/ui/GeneralTextInputModal';
import StandardModal from '../../shared/ui/StandardModal';
import {setProjectLoadComplete} from '../home/home.slice';
import overlayStyles from '../home/overlay.styles';
import useProjectHook from '../project/useProject';
import {updatedDatasetProperties} from './projects.slice';

const DatasetList = () => {
  console.log('Rendering DatasetList...');

  const [useProject] = useProjectHook();
  const useDownload = useDownloadHook();

  const [selectedDataset, setSelectedDataset] = useState({});
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [isDatasetNameModalVisible, setIsDatasetNameModalVisible] = useState(false);
  const [isMakeDatasetCurrentModalVisible, setMakeIsDatasetCurrentModalVisible] = useState(false);
  const [selectedDatasetToEdit, setSelectedDatasetToEdit] = useState({});

  const dispatch = useDispatch();
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);

  const downloadImages = async (dataset) => {
    const imageRes = await useDownload.initializeDownloadImages(dataset?.images?.neededImagesIds, dataset);
    console.log('Image Res', imageRes);
  };

  const editDataset = (id, name) => {
    setSelectedDatasetToEdit({name: name, id: id});
    setIsDatasetNameModalVisible(true);
  };

  const initializeDeleteDataset = () => {
    setIsDeleteConfirmModalVisible(false);
    if (selectedDatasetToEdit && selectedDatasetToEdit.id) {
      useProject.destroyDataset(selectedDatasetToEdit.id).catch(console.log);
    }
    else console.error('Selected dataset or id is undefined!');
  };

  const isDisabled = (id) => {
    return (activeDatasetsIds.length === 1 && activeDatasetsIds[0] === id)
      || (selectedDatasetId && selectedDatasetId === id);
  };

  const handleDeletePressed = () => {
    setIsDatasetNameModalVisible(false);
    setIsDeleteConfirmModalVisible(true);
  };

  const renderDatasetListItem = (dataset) => {
    const needImages = isEmpty(dataset?.images?.neededImagesIds);
    const spotIds = dataset.spotIds
      ? `${dataset?.spotIds.length} spot${dataset?.spotIds.length !== 1 ? 's' : ''}`
      : '0 spots';
    const imagesNeededOfTotal = dataset.images
      && `${dataset?.images?.neededImagesIds?.length}/${dataset?.images?.imageIds?.length}`;
    const spotsText = spotIds?.length > 1 && `${spotIds}`;
    const imagesText = imagesNeededOfTotal?.length > 1 ? `${imagesNeededOfTotal}` : '0/0';
    return (
      <ListItem
        key={dataset.id}
        containerStyle={commonStyles.listItem}
      >
        <Icon
          name={'edit'}
          type={'material'}
          size={20}
          color={'darkgrey'}
          onPress={() => editDataset(dataset.id, dataset.name)}
        />
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{truncateText(dataset.name, 18)}</ListItem.Title>
          <ListItem.Subtitle style={commonStyles.listItemSubtitle}>
            {spotsText}, {'\n'}{imagesText} images needed
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          onValueChange={value => setSwitchValue(value, dataset)}
          value={activeDatasetsIds.some(activeDatasetId => activeDatasetId === dataset.id)}
          disabled={isDisabled(dataset.id)}
        />
        <View>
          {dataset.images?.imageIds && (
            <Icon
              name={spotIds && 'image-outline'}
              type={spotIds && 'ionicon'}
              size={20}
              containerStyle={{paddingBottom: 5}}
            />
          )}
          <Icon
            name={spotIds ? (needImages ? 'checkmark-outline' : 'download-circle-outline') : 'image-off-outline'}
            type={spotIds ? (needImages ? 'ionicon' : 'material-community') : 'material-community'}
            size={20}
            color={spotIds ? needImages && 'green' : 'black'}
            disabled={needImages}
            disabledStyle={{backgroundColor: 'transparent'}}
            onPress={() => downloadImages(dataset)}
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
          visible={isDatasetNameModalVisible}
          onPress={() => saveDataset()}
          close={() => setIsDatasetNameModalVisible(false)}
          value={selectedDatasetToEdit.name}
          onChangeText={text => setSelectedDatasetToEdit({...selectedDatasetToEdit, name: text})}
        >
          <Button
            title={'Delete Dataset'}
            titleStyle={{color: 'red'}}
            type={'clear'}
            disabled={isDisabled(selectedDatasetToEdit.id)}
            buttonStyle={{padding: 0}}
            onPress={handleDeletePressed}
            icon={
              <Icon
                iconStyle={{paddingRight: 10}}
                name={'trash'}
                type={'font-awesome'}
                size={20}
                color={'red'}
              />
            }
          />
          {isDisabled(selectedDatasetToEdit.id) && (
            <View style={overlayStyles.overlayContent}>
              <Text style={overlayStyles.importantText}>
                {selectedDatasetToEdit.name} can not be deleted while still selected as the current dataset.
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
        isVisible={isDeleteConfirmModalVisible}
        cancel={() => setIsDeleteConfirmModalVisible(false)}
        delete={() => initializeDeleteDataset()}
      >
        <Text style={{textAlign: 'center'}}>Are you sure you want to delete Dataset
          {selectedDatasetToEdit && selectedDatasetToEdit.name
            && <Text style={{}}>{'\n' + selectedDatasetToEdit.name}</Text>}
          ?
        </Text>
        <Text style={overlayStyles.statusMessageText}>
          This will
          <Text style={overlayStyles.importantText}> ERASE </Text>
          everything in this dataset including Spots, images, and all other data!
        </Text>
      </DeleteConformationDialogBox>
    );
  };

  const renderMakeDatasetCurrentModal = () => {
    return (
      <StandardModal
        dialogTitleStyle={{backgroundColor: 'green'}}
        visible={isMakeDatasetCurrentModalVisible && !isProjectLoadSelectionModalVisible}
        footerButtonsVisible={true}
        dialogTitle={'Make Current?'}
        rightButtonText={'Yes'}
        leftButtonText={'No'}
        onPress={() => {
          useProject.makeDatasetCurrent(selectedDataset.id);
          setMakeIsDatasetCurrentModalVisible(false);
        }}
        close={() => setMakeIsDatasetCurrentModalVisible(false)}
      >
        <View>
          <Text style={overlayStyles.statusMessageText}>By selecting &quot;Yes&quot; any new data will be saved
            into</Text>
          <Text style={{...overlayStyles.statusMessageText, fontWeight: 'bold'}}>{selectedDataset.name}.</Text>
        </View>
      </StandardModal>
    );
  };

  const saveDataset = () => {
    dispatch(updatedDatasetProperties(selectedDatasetToEdit));
    setIsDatasetNameModalVisible(false);
  };

  const setSwitchValue = async (val, dataset) => {
    setSelectedDataset(dataset);
    const value = await useProject.setSwitchValue(val, dataset);
    console.log('Value has been switched', value);
    val && setMakeIsDatasetCurrentModalVisible(true);
    dispatch(setProjectLoadComplete(true));
  };

  return (
    <View style={{flex: 1}}>
      <FlatList
        keyExtractor={item => item.id}
        data={Object.values(datasets)}
        renderItem={({item}) => renderDatasetListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
      {renderDatasetNameChangeModal()}
      {renderDeleteConfirmationModal()}
      {renderMakeDatasetCurrentModal()}
    </View>
  );
};

export default DatasetList;
