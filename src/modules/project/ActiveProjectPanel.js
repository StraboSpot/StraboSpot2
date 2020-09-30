import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import GeneralTextInputModal from '../../shared/ui/GeneralTextInputModal';
import StandardModal from '../../shared/ui/StandardModal';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import ActiveDatasetsList from './ActiveDatasetsList';
import ActiveProjectList from './ActiveProjectList';
import DatasetList from './DatasetList';
import styles from './project.styles';
import useProjectHook from './useProject';

const ActiveProjectPanel = () => {

  const [useProject] = useProjectHook();
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [activeDatasets, setActiveDatasets] = useState(null);
  const [datasetName, setDatasetName] = useState(null);
  const [isAddDatasetModalVisible, setIsAddDatasetModalVisible] = useState(false);
  const project = useSelector(state => state.project.project);
  const datasets = useSelector(state => state.project.datasets);

  useEffect(() => {
    const filteredDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    setActiveDatasets(filteredDatasets);
  }, [datasets]);

  const confirm = () => {
    useProject.selectProject(project);
    setIsWarningModalVisible(false);
  };

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

  const renderWarningModal = () => {
    return (
      <StandardModal
        visible={isWarningModalVisible}
        dialogTitleStyle={commonStyles.dialogWarning}
        dialogTitle={'Warning!'}
      >
        <View style={[commonStyles.dialogContent]}>
          <Text style={[commonStyles.standardDescriptionText, {textAlign: 'center'}]}>This will overwrite anything that has not been uploaded to
            the server</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', paddingTop: 10}}>
          <Button
            title={'OK'}
            onPress={() => confirm()}
            buttonStyle={{paddingLeft: 20, paddingRight: 20}}
            containerStyle={commonStyles.buttonContainer}/>
          <Button
            title={'Cancel'}
            onPress={() => setIsWarningModalVisible(false)}
            // buttonStyle={commonStyles.dialogButton}
            containerStyle={commonStyles.buttonContainer}
          />
        </View>
      </StandardModal>
    );
  };

  const onAddDataset = async () => {
    await useProject.addDataset(datasetName);
    setIsAddDatasetModalVisible(false);
  };

  return (
    <React.Fragment>
      <ActiveProjectList/>
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
      <Text style={[commonStyles.standardDescriptionText, styles.subHeaderText]}>Select pencil to edit name</Text>
      <View style={[commonStyles.sectionContainer, {height: 200}]}>
        <DatasetList/>
      </View>
      <View style={{paddingBottom: 10}}>
        <Divider sectionText={'ACTIVE DATASETS'}/>
      </View>
      <View style={[commonStyles.sectionContainer, {height: 200}]}>
        {!isEmpty(activeDatasets) ? <ActiveDatasetsList/> : null}
      </View>
      <View style={{alignItems: 'center', margin: 10, marginTop: 0}}>
        <Text style={commonStyles.standardDescriptionText}>New Spots will be added to the check marked data set</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={'Download server version of project'}
          titleStyle={[styles.dialogContentImportantText, {fontSize: 15}]}
          type={'outline'}
          containerStyle={{padding: 10}}
          buttonStyle={{borderRadius: 10, padding: 15}}
          onPress={() => setIsWarningModalVisible(true)}
        />
        <View style={{alignItems: 'center', margin: 10, marginTop: 0}}>
          <Text style={commonStyles.standardDescriptionText}>This will overwrite anything that has not been uploaded to
            the server</Text>
        </View>
      </View>
      {renderAddDatasetModal()}
      {renderWarningModal()}
    </React.Fragment>
  );
};

export default ActiveProjectPanel;
