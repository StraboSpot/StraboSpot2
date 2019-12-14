import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {ListItem} from 'react-native-elements';
import Divider from '../components/settings-panel/HomePanelDivider';
import styles from './Project.styles';
import DatasetList from './DatasetList';
import ActiveDatasetsList from './ActiveDatasetsList';
import ActiveProjectList from './ActiveProjectList';
import ProjectDescriptionPanel from './ProjectDescription';
import {isEmpty} from '../shared/Helpers';
import commonStyles from '../shared/common.styles';

const ActiveProjectPanel = (props) => {
  const [activeDatasets, setActiveDatasets] = useState(null);
  const datasets = useSelector(state => state.project.datasets);
  const settingsPageVisible = useSelector(state => state.settingsPanel.settingsPageVisible);
  const [showPanel, setShowPanel] = useState(null);


  useEffect(() => {
    const filteredDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    setActiveDatasets(filteredDatasets);
  }, [datasets]);

  const openProjectDescription = () => {
    setShowPanel('Project Description');

    renderPanel();
  };

  const renderPanel = () => {
    switch (showPanel) {
      case 'Project Description':
        return (
          <View style={styles.projectDescriptionPanel}>
            <ProjectDescriptionPanel onPress={() => setShowPanel(null)}/>
          </View>
        );
      default: return null;
    }
  }


  return (
    <React.Fragment>
      <ActiveProjectList onPress={() => openProjectDescription()}/>
      <Divider sectionText={'PROJECT DATASETS'}/>
      <View style={styles.datasetsContainer}>
      <DatasetList/>
      </View>
      <Divider sectionText={'CURRENT DATASETS'}/>
      <View style={[styles.listContainer, {height: 200}]}>
        {!isEmpty(activeDatasets) ? <ActiveDatasetsList/> : null}
      </View>
      <View style={{alignItems: 'center', margin: 10, marginTop: 0}}>
      <Text style={commonStyles.standardDescriptionText}>New Spots will be added to the current data set</Text>
      </View>
      {renderPanel()}
    </React.Fragment>
  );
};

export default ActiveProjectPanel;
