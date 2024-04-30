import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import overlayStyles from '../home/overlays/overlay.styles';

const ProjectTypesButtons = ({
                               onLoadProjectsFromDevice,
                               onLoadProjectsFromDownloadsFolder,
                               onLoadProjectsFromServer,
                               onStartNewProject,
                             }) => {
  const user = useSelector(state => state.user);
  const deviceBackUpDirectoryExists = useSelector(state => state.project.deviceBackUpDirectoryExists);

  return (
    <View>
      <Button
        title={'Start a New Project'}
        containerStyle={commonStyles.standardButtonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => onStartNewProject()}
      />
      {!isEmpty(user.name) && (
        <Button
          title={'Projects From Server'}
          containerStyle={commonStyles.standardButtonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onLoadProjectsFromServer()}
        />
      )}
        <Button
          title={'Projects From Device'}
          containerStyle={commonStyles.standardButtonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onLoadProjectsFromDevice()}
        />
      <View>
        <Text style={{...overlayStyles.statusMessageText, fontWeight: 'bold'}}>When importing, select the data.json
          file
          before selecting any images or maps.</Text>
        <Button
          title={'Import Project'}
          containerStyle={commonStyles.standardButtonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onLoadProjectsFromDownloadsFolder()}
        />
      </View>
    </View>
  );
};

export default ProjectTypesButtons;
