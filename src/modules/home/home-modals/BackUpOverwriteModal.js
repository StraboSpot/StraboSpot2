import React from 'react';
import {Text} from 'react-native';

import Dialog, {
  DialogButton,
  DialogContent,
  DialogFooter,
  DialogTitle,
  SlideAnimation,
} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import {setMenuSelectionPage} from '../../main-menu-panel/mainMenuPanel.slice';
import * as ProjectActions from '../../project/project.constants';
import styles from '../../project/project.styles';
import {setSelectedProject} from '../../project/projects.slice';
import {setBackupOverwriteModalVisible} from '../home.slice';


const BackUpOverwriteModal = (props) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const isBackupOverwriteModalVisible = useSelector(state => state.home.isBackupOverwriteModalVisible);
  const isOnline = useSelector(state => state.home.isOnline);
  const selectedProject = useSelector(state => state.project.selectedProject);
  const user = useSelector(state => state.user);

  const cancel = () => {
    dispatch(setSelectedProject({project: '', source: ''}));
    dispatch(setMenuSelectionPage({name: undefined}));
    dispatch(setBackupOverwriteModalVisible(false));
  };

  return (
    <React.Fragment>
      <Dialog
        dialogStyle={styles.dialogBox}
        width={275}
        visible={isBackupOverwriteModalVisible}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        useNativeDriver={true}
        footer={
          <DialogFooter>
            <DialogButton
              text={'Backup Project to Device'}
              onPress={() => props.onPress(ProjectActions.BACKUP_TO_DEVICE)}
              style={styles.dialogButton}
              textStyle={styles.dialogButtonText}
            />
            {isOnline.isConnected && user.email && <DialogButton
              text={'Backup Project to Server'}
              onPress={() => props.onPress(ProjectActions.BACKUP_TO_SERVER)}
              style={styles.dialogButton}
              textStyle={styles.dialogButtonText}
            />}
            <DialogButton
              text={'Overwrite Project'}
              onPress={() => props.onPress(ProjectActions.OVERWRITE)}
              style={styles.dialogButton}
              textStyle={styles.dialogButtonText}
            />
            <DialogButton
              text={'CANCEL'}
              onPress={() => cancel()}
              style={styles.dialogButton}
              textStyle={[styles.dialogButtonText, {color: 'red'}]}
            />
          </DialogFooter>
        }
        dialogTitle={
          <DialogTitle
            style={styles.dialogTitleContainer}
            textStyle={styles.dialogTitleText}
            // title={props.dialogTitle}
            title={'Delete Local Project Warning!'}
          />
        }
      >
        <DialogContent style={styles.dialogContent}>
          {/*{props.children}*/}
          <Text>Switching projects will
            <Text style={{color: 'red'}}> DELETE </Text>
            the local copy of the current project:
          </Text>
          <Text style={{color: 'red', textTransform: 'uppercase', marginTop: 5, marginBottom: 10, textAlign: 'center'}}>
            {currentProject.description
            && !isEmpty(currentProject.description) ? currentProject.description.project_name : 'UN-NAMED'}
          </Text>
          <Text>Including all datasets and Spots contained within this project. Make sure you have already
            uploaded the project to the server if you wish to preserve the data. Continue?
          </Text>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default BackUpOverwriteModal;
