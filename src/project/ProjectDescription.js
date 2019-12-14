import React from 'react';
import {Text, TextInput,  View} from 'react-native';
import Divider from '../components/settings-panel/HomePanelDivider';
import styles from './Project.styles';
import {Icon, Button, Input} from 'react-native-elements';
import {useSelector} from 'react-redux';

const ProjectDescription = (props) => {
  const project = useSelector(state => state.project.project);

  return (
    <React.Fragment>
      <View style={styles.sidePanelHeaderContainer}>
        <View style={styles.sidePanelHeaderTextContainer}>
          <Button
            icon={
              <Icon
                name={'ios-arrow-back'}
                type={'ionicon'}
                color={'black'}
                iconStyle={styles.buttons}
                size={20}
              />
            }
            title={'Active Project'}
            type={'clear'}
            containerStyle={styles.sidePanelHeaderTextContainer}
            titleStyle={styles.headerText}
            onPress={() => props.onPress()}
          />
          {/*<Text style={styles.headerText}>Active Project</Text>*/}
        </View>
        {/*<View style={{flex: 1}}></View>*/}
      </View>
      <Divider sectionText={'basic info'}/>
      <View style={{margin: 10, backgroundColor: 'white'}}>
        {/*<Text>Project Name:</Text>*/}
        <Input
          placeholder='BASIC INPUT'
          inputStyle={{fontSize: 18}}
          label={'Project Name:'}
          labelStyle={{fontSize: 12}}
          containerStyle={{margin: 10}}
          value={project.description.project_name}
        />
        <Input
          placeholder='BASIC INPUT'
          inputStyle={{fontSize: 18}}
          label={'Project Name:'}
          labelStyle={{fontSize: 12}}
          containerStyle={{margin: 10}}
          value={project.description.project_name}
        />
      </View>
      <Divider sectionText={'notes'}/>
      <Divider sectionText={'technical details'}/>
      <Divider sectionText={'general details'}/>
    </React.Fragment>
  );
};

export default ProjectDescription;
