import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {ListItem} from 'react-native-elements';
import Divider from '../components/settings-panel/HomePanelDivider';
import styles from './Project.styles';
import DatasetList from './DatasetList';
import ActiveDatasetsList from './ActiveDatasetsList';
import ActiveProjectList from './ActiveProjectList';
import {isEmpty} from '../shared/Helpers';
import commonStyles from '../shared/common.styles';

const ActiveProjectPanel = (props) => {
  const [activeDatasets, setActiveDatasets] = useState(null);
  const datasets = useSelector(state => state.project.datasets);

  useEffect(() => {
    const filteredDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    setActiveDatasets(filteredDatasets);
  }, [datasets]);

  return (
    <React.Fragment>
      <ActiveProjectList/>
      <Divider sectionText={'PROJECT DATASETS'}/>
      <View style={styles.datasetsContainer}>
      <DatasetList/>
      </View>
      <Divider sectionText={'CURRENT DATASETS'}/>
      <View style={[styles.datasetsContainer, {height: 200}]}>
        {!isEmpty(activeDatasets) ? <ActiveDatasetsList/> : null}
      </View>
      <View style={{alignItems: 'center', margin: 10, marginTop: 0}}>
      <Text style={commonStyles.standardDescriptionText}>New Spots will be added to the current data set</Text>
      </View>
    </React.Fragment>
  );
};

export default ActiveProjectPanel;
