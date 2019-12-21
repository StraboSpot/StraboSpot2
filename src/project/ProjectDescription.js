import React, {useState, useEffect} from 'react';
import {Text, TextInput, View} from 'react-native';
import Divider from '../components/settings-panel/HomePanelDivider';
import styles from './Project.styles';
import {Icon, Button, Input, ListItem} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import SaveAndCloseButtons from '../shared/ui/SaveAndCloseButtons';
import {projectReducers} from './Project.constants';

const ProjectDescription = (props) => {
  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const [projectDescription, setProjectDescription] = useState({
    project_name: project.description.project_name,
    start_date: project.description.start_date || new Date(),
    end_date: project.description.end_date || new Date(),
    notes: project.description.notes,
  });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    console.log('Description Updated', projectDescription);
  }, [projectDescription]);

  const changeStartDate = (event, date) => {
    // date = date || projectDescription.start_date;
    setProjectDescription({...projectDescription, start_date: date});
  };

  const changeEndDate = (event, date) => {
    // date = date || projectDescription.end_date;
    setProjectDescription({...projectDescription, end_date: date});
  };

  const showDatPickerHandler = (type) => {
    if (type === 'startDate') {
      setShowStartPicker(!showStartPicker);
      setShowEndPicker(false);
    }
    else if (type === 'endDate') {
      setShowEndPicker(!showEndPicker);
      setShowStartPicker(false);
    }
  };

  const renderSaveAndCloseButtons = () => {
    return (
      <SaveAndCloseButtons cancel={props.onPress} save={() => {saveChanges(); props.onPress()}}/>
    );
  };

  const saveChanges =  () => {
     dispatch({type: projectReducers.UPDATE_PROJECT, field: 'description', value: projectDescription});
  };

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
                size={30}
              />
            }
            title={'Active Project'}
            type={'clear'}
            containerStyle={styles.sidePanelHeaderTextContainer}
            titleStyle={styles.headerText}
            onPress={props.onPress}
          />
        </View>
      </View>
      {renderSaveAndCloseButtons()}
      <Divider sectionText={'basic info'}/>
      <View style={{backgroundColor: 'white', borderRadius: 10, margin: 10}}>
        <View style={styles.basicInfoContainer}>
          <Text>Project Name:</Text>
          <TextInput
            placeholder={project.description.project_name}
            placeholderTextColor={'dimgrey'}
            style={styles.basicInfoInputText}
            onChangeText={(text) => setProjectDescription({...projectDescription, project_name: text})}
            // value={projectDescription.project_name}
          />
        </View>
        <View style={styles.basicInfoContainer}>
          <Text>Start Date:</Text>
          <View>
            <ListItem
              title={moment(projectDescription.start_date).format('MM/DD/YYYY')}
              containerStyle={{width: 150, padding: 0,  paddingRight: 5,}}
              contentContainerStyle={styles.basicInfoListItemContent}
              onPress={() => showDatPickerHandler('startDate')}
              chevron
            />
          </View>
        </View>
        <View style={styles.basicInfoContainer}>
          <Text>End Date:</Text>
          <ListItem
            title={moment(projectDescription.end_date).format('MM/DD/YYYY')}
            containerStyle={{width: 150, padding: 0, paddingRight: 5}}
            contentContainerStyle={styles.basicInfoListItemContent}
            onPress={() => showDatPickerHandler('endDate')}
            chevron
          />
        </View>
        {showStartPicker ?
          <View>
            <Button type={'clear'} title={'Start Date Done'} onPress={() => setShowStartPicker(false)}/>
            <DateTimePicker
              mode={'date'}
              value={projectDescription.start_date || new Date()}
              onChange={changeStartDate}
              display='default'
            />
          </View> : null}
        {showEndPicker ?
          <View>
            <Button type={'clear'} title={'End Date Done'} onPress={() => setShowEndPicker(false)}/>
            <DateTimePicker
              mode={'date'}
              value={projectDescription.end_date || new Date()}
              onChange={changeEndDate}
              display='default'
            />
          </View> : null}
      </View>
      <Divider sectionText={'notes'}/>
      <View style={styles.notesContainer}>
        <TextInput
          placeholder={'Notes'}
          onChangeText={noteText => setProjectDescription({...projectDescription, notes: noteText})}
          style={{height: 100}}
          multiline={true}
          numberOfLines={10}
          inputStyle={{fontSize: 18}}
          value={projectDescription.notes}
        />
    </View>
      <Divider sectionText={'technical details'}/>
      <Divider sectionText={'general details'}/>
    </React.Fragment>
  );
};

export default ProjectDescription;
