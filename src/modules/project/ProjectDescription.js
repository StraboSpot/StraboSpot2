import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
// import SectionDivider from '../../shared/ui/SectionDivider';
import styles from './project.styles';
// import mainMenuStyles from '../main-menu-panel/mainMenuPanel.styles'
import {Button, Icon, ListItem} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import SaveAndCloseButtons from '../../shared/ui/SaveAndCloseButtons';
import {projectReducers} from './project.constants';
import {truncateText} from '../../shared/Helpers';
import StatusDialogBox from '../../shared/ui/StatusDialogBox';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';

const ProjectDescription = (props) => {
  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const [projectDescription, setProjectDescription] = useState({
    project_name: project.description.project_name,
    start_date: project.description.start_date || new Date(),
    end_date: project.description.end_date || new Date(),
    notes: project.description.notes,
    gps_datum: project.description.gps_datum,
    magnetic_declination: project.description.magnetic_declination,
    purpose_of_study: project.description.purpose_of_study,
    other_team_members: project.description.other_team_members,
    areas_of_interest: project.description.areas_of_interest,
    instruments: project.description.instruments,
  });
  // const [startDate, setStartDate] = useState(new Date());
  // const [endDate, setEndDate] = useState(new Date());
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

  const goBack = () => {
    props.closeSidePanel()
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})
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

  const renderBackButton = () => {
    return (
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
        containerStyle={{flex: 0, padding: 4}}
        titleStyle={styles.buttonText}
        onPress={() => goBack()}
      />
    );
  };

  const renderBasicInfo = () => {
    return (
      <React.Fragment>
        <View style={styles.sectionContainer}>
          <View style={styles.projectNameContainer}>
            <View style={styles.projectNameLabel}>
              <Text style={{fontSize: 16}}>Project Name:</Text>
            </View>
            <View style={styles.projectNameValue}>
              <TextInput
                placeholder={project.description.project_name}
                placeholderTextColor={'dimgrey'}
                style={styles.basicInfoInputText}
                onChangeText={(text) => setProjectDescription({...projectDescription, project_name: text})}
                value={projectDescription.project_name}
              />
            </View>
          </View>
          <ListItem
            title={'Start Date'}
            titleStyle={styles.listItemTitleAndValue}
            rightTitle={moment(projectDescription.start_date).format('MM/DD/YYYY')}
            rightContentContainerStyle={styles.listItemTitleAndValue}
            containerStyle={styles.projectDescriptionListContainer}
            onPress={() => showDatPickerHandler('startDate')}
            bottomDivider
            chevron
          />
          <ListItem
            title={'End Date'}
            titleStyle={styles.listItemTitleAndValue}
            rightTitle={moment(projectDescription.end_date).format('MM/DD/YYYY')}
            rightContentContainerStyle={styles.listItemTitleAndValue}
            containerStyle={styles.projectDescriptionListContainer}
            onPress={() => showDatPickerHandler('endDate')}
            chevron
          />
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
              <Text style={{textAlign: 'center', fontSize: 12}}>End Date cannot be before Start Date</Text>
              <DateTimePicker
                mode={'date'}
                value={projectDescription.end_date || new Date()}
                minimumDate={projectDescription.start_date}
                onChange={changeEndDate}
                display='default'
              />
            </View> : null}
        </View>

      </React.Fragment>
    );
  };

  const renderNotes = () => {
    return (
      <React.Fragment>
        <View style={styles.sectionContainer}>
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
      </React.Fragment>
    );
  };

  const renderGeneralDetails = () => {
    return (
      <View style={styles.sectionContainer}>
        <ListItem
              title={'Purpose of Study'}
              titleStyle={styles.listItemTitleAndValue}
              rightTitle={project.description.purpose_of_study ? truncateText(project.description.purpose_of_study, 10) : 'None'}
              rightTitleStyle={styles.listItemTitleAndValue}
              containerStyle={styles.projectDescriptionListContainer}
              // rightContentContainerStyle={styles.listItemTitleAndValue}
              bottomDivider
              onPress={() => console.log(project.description.purpose_of_study)}
              chevron
            />
            <ListItem
              title={'Other Team Members'}
              titleStyle={styles.listItemTitleAndValue}
              rightTitle={project.description.other_team_members ? truncateText(project.description.other_team_members, 10) : 'None'}
              rightTitleStyle={styles.listItemTitleAndValue}
              containerStyle={styles.projectDescriptionListContainer}
              // rightContentContainerStyle={styles.listItemTitleAndValue}
              onPress={() => console.log(project.description.other_team_members)}
              bottomDivider
              chevron
            />
            <ListItem
              title={'Areas of Interest'}
              titleStyle={styles.listItemTitleAndValue}
              rightTitle={project.description.areas_of_interest ? truncateText(project.description.areas_of_interest, 10) : 'None'}
              rightTitleStyle={styles.listItemTitleAndValue}
              containerStyle={styles.projectDescriptionListContainer}
              // rightContentContainerStyle={styles.listItemTitleAndValue}
              bottomDivider
              onPress={() => console.log('GPS Datum')}
              chevron
            />
            <ListItem
              title={'Instruments Used'}
              titleStyle={styles.listItemTitleAndValue}
              rightTitle={projectDescription.instruments ? truncateText(projectDescription.instruments, 10) : 'None'}
              rightTitleStyle={styles.listItemTitleAndValue}
              containerStyle={styles.projectDescriptionListContainer}
              rightContentContainerStyle={styles.listItemTitleAndValue}
              onPress={() => setProjectDescription({...projectDescription, instruments: 'Hello There Govna'})}
              chevron
            />
        </View>
    );
  };

  const renderSaveAndCloseButtons = () => {
    return (
      <SaveAndCloseButtons
        cancel={() => goBack()}
        save={() => saveAndGo()}/>
    );
  };

  const renderTechnicalDetails = () => {
    return (
        <View style={{}}>
        <ListItem
              title={'GPS Datum'}
              titleStyle={styles.listItemTitleAndValue}
              rightTitle={projectDescription.gps_datum ? truncateText(projectDescription.gps_datum, 10) : 'None'}
              containerStyle={styles.projectDescriptionListContainer}
              rightContentContainerStyle={styles.listItemTitleAndValue}
              bottomDivider
              onPress={() => setProjectDescription({...projectDescription, gps_datum: 'Hello There Govna'})}
              chevron
            />
            <ListItem
              title={'Magnetic Declination'}
              titleStyle={styles.listItemTitleAndValue}
              rightTitle={project.description.magnetic_declination ? project.description.magnetic_declination : 'AUTO'}
              containerStyle={styles.projectDescriptionListContainer}
              rightContentContainerStyle={styles.listItemTitleAndValue}
              onPress={() => console.log('Mag Dec')}
              chevron
            />
        </View>
    );
  };

  const saveAndGo = async () => {
    await dispatch({type: projectReducers.UPDATE_PROJECT, field: 'description', value: projectDescription});
    goBack();
  };

  return (
    <React.Fragment>
      <View style={styles.settingsPanelContainer}>
        <View style={styles.sidePanelHeaderContainer}>
          <View style={{flex: 0}} >
            {renderBackButton()}
          </View>
          <View style={styles.headerTextContainer} >
            <Text style={styles.headerText}>Project Description</Text>
          </View>
        </View>
        {renderSaveAndCloseButtons()}
          <ScrollView>
            <Divider sectionText={'Basic Info'}/>
            {renderBasicInfo()}
            <Divider sectionText={'notes'}/>
            {renderNotes()}
            <Divider sectionText={'technical details'}/>
            {renderTechnicalDetails()}
            <Divider sectionText={'general details'}/>
            {renderGeneralDetails()}
          </ScrollView>
      </View>
    </React.Fragment>
  );
};

export default ProjectDescription;
