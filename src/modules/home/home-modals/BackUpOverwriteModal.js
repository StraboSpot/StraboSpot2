import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import {setMenuSelectionPage} from '../../main-menu-panel/mainMenuPanel.slice';
import * as ProjectActions from '../../project/project.constants';
import styles from '../../project/project.styles';
import {setSelectedProject} from '../../project/projects.slice';
import {setBackupOverwriteModalVisible} from '../home.slice';
import homeStyles from '../home.style';

const BackUpOverwriteModal = (props) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const isBackupOverwriteModalVisible = useSelector(state => state.home.isBackupOverwriteModalVisible);
  const isOnline = useSelector(state => state.home.isOnline);
  // const selectedProject = useSelector(state => state.project.selectedProject);
  const user = useSelector(state => state.user);

  const cancel = () => {
    dispatch(setSelectedProject({project: '', source: ''}));
    dispatch(setMenuSelectionPage({name: undefined}));
    dispatch(setBackupOverwriteModalVisible(false));
  };

  return (
    <Overlay
      animationType={'slide'}
      isVisible={isBackupOverwriteModalVisible}
      overlayStyle={[styles.dialogBox, {width: 275}]}
    >
      <View style={[homeStyles.dialogTitleContainer, styles.dialogTitleContainer]}>
        <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>Delete Local Project Warning!</Text>
      </View>
      <View style={styles.dialogContent}>
        <Text>Switching projects will
          <Text style={{color: 'red'}}> DELETE </Text>
          the local copy of the current project:
        </Text>
        <Text
          style={{color: 'red', textTransform: 'uppercase', marginTop: 5, marginBottom: 10, textAlign: 'center'}}>
          {currentProject.description
          && !isEmpty(currentProject.description) ? currentProject.description.project_name : 'UN-NAMED'}
        </Text>
        <Text>Including all datasets and Spots contained within this project. Make sure you have already
          uploaded the project to the server if you wish to preserve the data. Continue?
        </Text>
      </View>
      <Button
        title={'Backup Project to Device'}
        buttonStyle={styles.dialogButton}
        titleStyle={styles.dialogButtonText}
        onPress={() => props.onPress(ProjectActions.BACKUP_TO_DEVICE)}
      />
      {isOnline.isConnected && user.email && (
        <Button
          title={'Backup Project to Server'}
          buttonStyle={styles.dialogButton}
          titleStyle={styles.dialogButtonText}
          onPress={() => props.onPress(ProjectActions.BACKUP_TO_SERVER)}
        />
      )}
      <Button
        title={'Overwrite Project'}
        buttonStyle={styles.dialogButton}
        titleStyle={styles.dialogButtonText}
        onPress={() => props.onPress(ProjectActions.OVERWRITE)}
      />
      <Button
        title={'CANCEL'}
        buttonStyle={styles.dialogButton}
        titleStyle={[styles.dialogButtonText, {color: 'red'}]}
        onPress={() => cancel()}
      />
    </Overlay>
  );
};

export default BackUpOverwriteModal;
