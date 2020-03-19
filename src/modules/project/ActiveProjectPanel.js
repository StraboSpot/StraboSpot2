import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import { Button, Icon} from 'react-native-elements';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import DatasetList from './DatasetList';
import ActiveDatasetsList from './ActiveDatasetsList';
import ActiveProjectList from './ActiveProjectList';
import {isEmpty} from '../../shared/Helpers';
import GeneralTextInputModal from '../../shared/ui/GeneralTextInputModal';

// Styles
import styles from './project.styles';
import commonStyles from '../../shared/common.styles';
import useProjectHook from './useProject';

const ActiveProjectPanel = (props) => {

  const [useProject] = useProjectHook();
  const [activeDatasets, setActiveDatasets] = useState(null);
  const [datasetName, setDatasetName] = useState(null);
  const [isAddDatasetModalVisible, setIsAddDatasetModalVisible] = useState(false);
  const datasets = useSelector(state => state.project.datasets);
  const settingsPageVisible = useSelector(state => state.settingsPanel.settingsPageVisible);
  const [showPanel, setShowPanel] = useState(null);


  useEffect(() => {
    const filteredDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    setActiveDatasets(filteredDatasets);
  }, [datasets]);

  const renderAddDatasetModal = () => {
    return (
      <GeneralTextInputModal
        visible={isAddDatasetModalVisible}
        dialogTitle={'Add a Dataset'}
        onPress={() => onAddDataset()}
        close={() => setIsAddDatasetModalVisible(false)}
        value={datasetName}
        onChangeText={(text) => setDatasetName(text)}
      />
    );
  };

  const onAddDataset = async () => {
    await useProject.addDataset(datasetName);
    setIsAddDatasetModalVisible(false);
  };

  return (
    <React.Fragment>
      <ActiveProjectList openSidePanel={props.openSidePanel}/>
      <View style={styles.dividerWithButtonContainer}>
        <Divider sectionText={'PROJECT DATASETS'}/>
        <Button
          title={'Add'}
          titleStyle={{fontSize: 14}}
          containerStyle={{paddingRight: 20}}
          buttonStyle={{padding: 0}}
          type={'clear'}
          onPress={() => setIsAddDatasetModalVisible(true)}
        />
      </View>
      <Text style={[commonStyles.standardDescriptionText, styles.subHeaderText]} >Select pencil to edit name</Text>
      <View style={[styles.sectionContainer, {height: 200}]}>
      <DatasetList/>
      </View>
      <View style={{paddingBottom: 10}}>
        <Divider sectionText={'ACTIVE DATASETS'}/>
      </View>
      <View style={[styles.sectionContainer, {height: 200}]}>
        {!isEmpty(activeDatasets) ? <ActiveDatasetsList/> : null}
      </View>
      <View style={{alignItems: 'center', margin: 10, marginTop: 0}}>
        <Text style={commonStyles.standardDescriptionText}>New Spots will be added to the check marked data set</Text>
      </View>
      {renderAddDatasetModal()}
    </React.Fragment>
  );
};

export default ActiveProjectPanel;
