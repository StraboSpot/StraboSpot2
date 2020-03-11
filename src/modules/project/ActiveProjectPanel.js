import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {ListItem, Button} from 'react-native-elements';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import DatasetList from './DatasetList';
import ActiveDatasetsList from './ActiveDatasetsList';
import ActiveProjectList from './ActiveProjectList';
import ProjectDescriptionPanel from './ProjectDescription';
import {isEmpty} from '../../shared/Helpers';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';
// Styles
import styles from './project.styles';
import commonStyles from '../../shared/common.styles';

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
    setShowPanel(SettingsMenuItems.MANAGE.PROJECT_DESCRIPTION);
    renderPanel();
  };

  const renderPanel = () => {
    switch (showPanel) {
      case SettingsMenuItems.MANAGE.PROJECT_DESCRIPTION:
        return (
          <View style={styles.projectDescriptionPanel}>
            <ProjectDescriptionPanel onPress={() => setShowPanel(null)}/>
          </View>
        );
      default: return null;
    }
  };

  return (
    <React.Fragment>
      <ActiveProjectList onPress={() => openProjectDescription()}/>
      <Divider sectionText={'PROJECT DATASETS'}/>
      <View style={styles.listContainer}>
      <DatasetList/>
      </View>
      <Divider sectionText={'ACTIVE DATASETS'}/>
      <View style={[styles.listContainer, {height: 200}]}>
        {!isEmpty(activeDatasets) ? <ActiveDatasetsList/> : null}
      </View>
      <View style={{alignItems: 'center', margin: 10, marginTop: 0}}>
        <Text style={commonStyles.standardDescriptionText}>New Spots will be added to the check marked data set</Text>
      </View>
      {renderPanel()}
    </React.Fragment>
  );
};

export default ActiveProjectPanel;
