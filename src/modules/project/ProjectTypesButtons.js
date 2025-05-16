import React from 'react';
import {Text, Platform, View} from 'react-native';

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
  const importLocation = Platform.OS === 'ios' ? 'Documents/Strabofield/Distribution'  :  'Downloads/StraboSpot2/Backups';
  const user = useSelector(state => state.user);

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
        <Button
          title={'Import Project'}
          containerStyle={commonStyles.standardButtonContainer}
          buttonStyle={commonStyles.standardButton}
          titleStyle={commonStyles.standardButtonText}
          onPress={() => onLoadProjectsFromDownloadsFolder()}
        />
        <Text
          style={{...overlayStyles.statusMessageText, fontWeight: 'bold'}}
        >
          The imported project should only be a .zip file in the {importLocation} folder.
        </Text>
      </View>
    </View>
  );
};

export default ProjectTypesButtons;
