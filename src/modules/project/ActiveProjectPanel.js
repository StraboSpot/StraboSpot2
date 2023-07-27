import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useDownloadHook from '../../services/useDownload';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import TextInputModal from '../../shared/ui/GeneralTextInputModal';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import StandardModal from '../../shared/ui/StandardModal';
import ActiveDatasetsList from './ActiveDatasetsList';
import ActiveProjectList from './ActiveProjectList';
import CustomFeatureTypes from './CustomFeatureTypes';
import DatasetList from './DatasetList';
import {setActiveDatasets, setSelectedDataset} from './projects.slice';
import useProjectHook from './useProject';

const ActiveProjectPanel = () => {
  const dispatch = useDispatch();
  const [useProject] = useProjectHook();
  const useDownload = useDownloadHook();
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [datasetName, setDatasetName] = useState(null);
  const [isAddDatasetModalVisible, setIsAddDatasetModalVisible] = useState(false);
  const project = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);
  const datasets = useSelector(state => state.project.datasets);
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);

  useEffect(() => {
    console.log('UE ActiveProjectPanel [datasets]', datasets);
    if (Object.values(datasets).length > 0 && !isEmpty(Object.values(datasets)[0])) {
      if (activeDatasetsIds.length === 0) {
        dispatch(setActiveDatasets({bool: true, dataset: Object.values(datasets)[0].id}));
        dispatch(setSelectedDataset(Object.values(datasets)[0].id));
      }
      else if (!selectedDatasetId) dispatch(setSelectedDataset(activeDatasetsIds[0]));
    }
  }, [datasets]);

  const onAddDataset = async () => {
    const addDataset = await useProject.addDataset(datasetName);
    console.log(addDataset);
    setIsAddDatasetModalVisible(false);
  };

  const confirm = async () => {
    setIsWarningModalVisible(false);
    await useDownload.initializeDownload(project);
  };

  const renderAddDatasetModal = () => {
    return (
      <TextInputModal
        visible={isAddDatasetModalVisible}
        dialogTitle={'Add a Dataset'}
        onPress={() => onAddDataset()}
        close={() => setIsAddDatasetModalVisible(false)}
        value={datasetName}
        onChangeText={text => setDatasetName(text)}
      />
    );
  };

  const renderWarningModal = () => {
    return (
      <StandardModal
        visible={isWarningModalVisible}
        dialogTitleStyle={commonStyles.dialogError}
        dialogTitle={'Warning!'}
      >
        <View style={[commonStyles.dialogContent]}>
          <Text style={[commonStyles.standardDescriptionText, {textAlign: 'center'}]}>
            This will overwrite anything that has not been uploaded to the server
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', paddingTop: 10}}>
          <Button
            title={'OK'}
            type={'clear'}
            onPress={() => confirm()}
          />
          <Button
            title={'Cancel'}
            type={'clear'}
            onPress={() => setIsWarningModalVisible(false)}
          />
        </View>
      </StandardModal>
    );
  };

  return (
    <React.Fragment>
      <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
        {/*Active Projects*/}
        <ActiveProjectList/>

        <View style={{flex: 1}}>
          {/*Project Datasets*/}
          <View style={{flex: 1, flexGrow: 1, overflow: 'hidden'}}>
            <SectionDividerWithRightButton
              dividerText={'Project Datasets'}
              buttonTitle={'Add'}
              onPress={() => setIsAddDatasetModalVisible(true)}
            />
            <DatasetList/>
          </View>
          {/*Active Datasets*/}
          <View style={{flex: 1, flexGrow: 1, overflow: 'hidden'}}>
            <SectionDivider dividerText={'Active Datasets*'}/>
            <ActiveDatasetsList/>
          </View>
          <View style={{alignItems: 'center', paddingBottom: 10}}>
            <Text style={commonStyles.standardDescriptionText}>*New Spots will be added to the checked dataset.</Text>
          </View>
          <View style={{flex: 1, flexGrow: 1, overflow: 'hidden'}}>
            <SectionDivider dividerText={'Custom Feature Types'}/>
            <CustomFeatureTypes/>
          </View>
        </View>

        {/*Footer*/}
        <View style={{padding: 10}}>
          {user.name && (
            <View>
              <Button
                title={'Download server version of project'}
                titleStyle={commonStyles.standardButtonText}
                type={'outline'}
                onPress={() => setIsWarningModalVisible(true)}
              />
              <View style={{alignItems: 'center', paddingTop: 10}}>
                <Text style={commonStyles.standardDescriptionText}>
                  This will overwrite anything that has not been uploaded to the server
                </Text>
              </View>
            </View>
          )}
        </View>

      </View>
      {renderAddDatasetModal()}
      {renderWarningModal()}
    </React.Fragment>
  );
};

export default ActiveProjectPanel;
