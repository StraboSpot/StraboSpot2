import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-elements';
import {connect} from 'react-redux';

// Styles
import commonStyles from '../shared/common.styles';

const ProjectTypesButtons = (props) => {
  return (
    <View>
      <Button
        title={'Start a New Project'}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onStartNewProject()}
      />
      {props.isOnline && <Button
        title={'Load a Project from Server'}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromServer()}
      />}
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    isOnline: state.home.isOnline,
  };
};

export default connect(mapStateToProps)(ProjectTypesButtons);
