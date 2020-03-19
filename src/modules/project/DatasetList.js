import React, {useState} from 'react';
import {ScrollView, Switch, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Icon, ListItem} from 'react-native-elements';

import {isEmpty, truncateText} from '../../shared/Helpers';
import Loading from '../../shared/ui/Loading';
import TexInputModal from '../../shared/ui/GeneralTextInputModal';

// Constants
import {projectReducers} from './project.constants';

// Hooks
import useSpotsHook from '../spots/useSpots';
import {homeReducers} from '../home/home.constants';

// Styles
import styles from './project.styles';

const DatasetList = () => {
  const [useSpots] = useSpotsHook();
  const [loading, setLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState({});
  const [isDatasetNameModalVisible, setIsDatasetNameModalVisible] = useState(false);
  const datasets = useSelector(state => state.project.datasets);
  const isOnline = useSelector(state => state.home.isOnline);
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();

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
      <TexInputModal
        dialogTitle={'Dataset Name Change'}
        visible={isDatasetNameModalVisible}
        onPress={() => saveDataset()}
        close={() => setIsDatasetNameModalVisible(false)}
        value={selectedDataset.name}
        onChangeText={(text) => setSelectedDataset({...selectedDataset, name: text})}
      />
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
      {loading && <Loading style={{backgroundColor: 'transparent'}}/>}
    </View>
  );
};

export default DatasetList;
