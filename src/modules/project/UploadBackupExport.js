import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import Spacer from '../../shared/ui/Spacer';
import {setBackupModalVisible, setUploadModalVisible} from '../home/home.slice';
import Divider from '../main-menu-panel/MainMenuPanelDivider';

const UploadBackAndExport = () => {

  const dispatch = useDispatch();
  const isOnline = useSelector(state => state.home.isOnline);

  const onShareProjectAsCSV = () => {
    console.log('onShareProjectAsCSV');
  };

  const onShareNotebookAsPDF = () => {
    console.log('onShareNotebookAsPDF');
  };

  const onShareProjectAsShapefile = () => {
    console.log('onShareProjectAsShapefile');
  };

  const renderUploadAndBackupButtons = () => {
    return (
      <View>
        <Button
          title={isOnline ? 'Upload project to StraboSpot' : 'Need to be ONLINE to upload'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => dispatch(setUploadModalVisible(true))}
          disabled={!isOnline}
        />
        <Button
          title={'Backup project to device'}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => dispatch(setBackupModalVisible(true))}
        />
      </View>
    );
  };

  return (
    <React.Fragment>
      <Divider sectionText={'upload and backup'}/>
      <Spacer/>
      {renderUploadAndBackupButtons()}
      {/*<Divider sectionText={'export'}/>*/}
      {/*{renderExportButtons()}*/}
      {/*<Divider sectionText={'restore project from backup'}/>*/}
    </React.Fragment>
  );
};

export default UploadBackAndExport;
