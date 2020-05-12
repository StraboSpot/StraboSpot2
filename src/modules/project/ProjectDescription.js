import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';

import {Button, Icon, ListItem} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';

// Assests
import * as forms from '../../assets/forms/forms.index';

// Components
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import EditingModal from './ProjectDescriptionEditModal';
import SaveAndCloseButtons from '../../shared/ui/SaveAndCloseButtons';

// Constants
import {projectReducers} from './project.constants';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';

// Utilities
import {truncateText} from '../../shared/Helpers';

// Styles
import styles from './project.styles';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';

const ProjectDescription = (props) => {
  const getInitialFields = () => {
    const projectDescriptionFieldsGrouped = {
      basic: ['project_name', 'start_date', 'end_date'],
      notes: ['notes'],
      technical: ['gps_datum', 'magnetic_declination'],
      // general: ['purpose_of_study', 'other_team_members', 'areas_of_interest', 'instruments'],
    };
    const form = forms.default.general.project_description.survey;
    const basicFields = form.filter((field) => projectDescriptionFieldsGrouped.basic.includes(field.name));
    const notesFields = form.filter((field) => projectDescriptionFieldsGrouped.notes.includes(field.name));
    const technicalFields = form.filter((field) => projectDescriptionFieldsGrouped.technical.includes(field.name));
    const excludedFieldTypes = ['start', 'end', 'begin_group', 'end_group', 'calculate'];
    const generalFields = form.filter((field) =>
      ![...projectDescriptionFieldsGrouped.basic, ...projectDescriptionFieldsGrouped.notes, ...projectDescriptionFieldsGrouped.technical].includes(
        field.name) && !excludedFieldTypes.includes(field.type));
    return {
      basic: basicFields,
      technical: technicalFields,
      notes: notesFields,
      general: generalFields,
    };
  };

  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const mainMenuPage = useSelector(state => state.settingsPanel.settingsPageVisible);
  const [projectDescription, setProjectDescription] = useState({
    project_name: project.description.project_name,
    start_date: project.description.start_date || new Date(),
    end_date: project.description.end_date || new Date(),
    notes: project.description.notes,
    gps_datum: project.description.gps_datum || 'WGS84 (Default)',
    magnetic_declination: project.description.magnetic_declination || 0,
    purpose_of_study: project.description.purpose_of_study,
    other_team_members: project.description.other_team_members,
    areas_of_interest: project.description.areas_of_interest,
    instruments: project.description.instruments,
  });
  const [magDecValidation, setMagDecValidation] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');
  const [selectedField, setSelectedField] = useState();
  const [showEditingModal, setShowEditingModal] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const fields = getInitialFields();

  useEffect(() => {
    // console.log('UE MagDec', magDecValidation, 'MagDec value', projectDescription.magnetic_declination);
  }, [magDecValidation, projectDescription.magnetic_declination]);

  const changeStartDate = (event, date) => {
    // date = date || projectDescription.start_date;
    setProjectDescription({...projectDescription, start_date: date});
  };

  const changeEndDate = (event, date) => {
    // date = date || projectDescription.end_date;
    setProjectDescription({...projectDescription, end_date: date});
  };

  const goBack = () => {
    props.closeSidePanel();
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
        title={mainMenuPage === SettingsMenuItems.MANAGE.MY_STRABOSPOT ? 'My StraboSpot' : 'Active Project'}
        type={'clear'}
        containerStyle={{flex: 0, padding: 4}}
        titleStyle={styles.buttonText}
        // onPress={() => goBack()}
        onPress={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})}
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

  const renderEditingModal = () => {
    if (selectedField) {
      if (selectedField.name === 'gps_datum' || selectedField.name === 'magnetic_declination') {
        return (
          <EditingModal
            visible={showEditingModal}
            dialogTitle={selectedField && selectedField.label}
            disabled={selectedField.name === 'magnetic_declination' && !magDecValidation}
            confirm={() => setShowEditingModal(false)}
          >
            <View style={{flex: 1, alignItems: 'center'}}>
              <TextInput
                keyboardType={selectedField.name === 'magnetic_declination' ? 'number-pad' : 'default'}
                onChangeText={(val) => selectedField.name === 'magnetic_declination' ? validateMagField(val) :
                  setProjectDescription({...projectDescription, [selectedField.name]: val})}
                defaultValue={projectDescription[selectedField.name].toString()}
                style={{backgroundColor: 'white', padding: 15, width: 250}}
              />
            </View>
            <View style={styles.dialogConfirmText}>
              <Text style={styles.dialogContentImportantText}>{validationErrorMessage}</Text>
            </View>
          </EditingModal>
        );
      }
      else {
        return (
          <EditingModal
            visible={showEditingModal}
            dialogTitle={selectedField && selectedField.label}
            confirm={() => setShowEditingModal(false)}
          >
            <View style={{}}>
              <TextInput
                numberOfLines={4}
                multiline={true}
                onChangeText={(val) => setProjectDescription({...projectDescription, [selectedField.name]: val})}
                value={projectDescription[selectedField.name]}
                style={{backgroundColor: 'white', maxHeight: 200, padding: 15, width: 250}}
              />
            </View>
          </EditingModal>
        );
      }
    }
  };

  const renderListItemFields = (field, i, obj) => {
    const fieldName = projectDescription && projectDescription[field.name] ?
      truncateText(projectDescription[field.name], 15).toString() : 'None';
    return (
      <ListItem
        key={field.name}
        title={field.label}
        titleStyle={styles.listItemTitleAndValue}
        rightTitle={fieldName}
        containerStyle={styles.projectDescriptionListContainer}
        rightContentContainerStyle={styles.listItemTitleAndValue}
        bottomDivider={i < obj.length - 1}
        onPress={() => toggleEditingModal(field)}
        chevron
      />
    );
  };
  const toggleEditingModal = (field) => {
    // console.log(value)
    console.log(field);
    setShowEditingModal(true);
    setSelectedField(field);
  };

  const renderGeneralDetails = () => (
    <View style={styles.sectionContainer}>
      {fields.general.map((field, i, obj) => renderListItemFields(field, i, obj))}
    </View>
  );

  const renderSaveAndCloseButtons = () => {
    return (
      <SaveAndCloseButtons
        cancel={() => {
          setProjectDescription(project.description);
          // goBack();
          dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
        }}
        save={() => saveProjectDescriptionAndGo()}/>
    );
  };

  const renderTechnicalDetails = () => (
    <View style={styles.sectionContainer}>
      {fields.technical.map((field, i, obj) => renderListItemFields(field, i, obj))}
    </View>
  );

  const saveProjectDescriptionAndGo = async () => {
    await dispatch({type: projectReducers.UPDATE_PROJECT, field: 'description', value: projectDescription});
    // goBack();
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
  };

  const regexTest = (value) => {
    const regex = /^([0-9]{1,2}|1[0-7][0-9]|180)$/g;
    return regex.test(value);
  };

  const validateMagField = (val) => {
    if (selectedField && selectedField.name === 'magnetic_declination') {
      if (regexTest(val)) {
        setMagDecValidation(true);
        setValidationErrorMessage('');
        setProjectDescription({...projectDescription, [selectedField.name]: val.trim()});
      }
      else {
        setMagDecValidation(false);
        setValidationErrorMessage('Must be between 0 and 180');
      }
    }
  };

  return (
    <React.Fragment>
      <View style={styles.settingsPanelContainer}>
        <View style={styles.sidePanelHeaderContainer}>
          <View style={{flex: 0}}>
            {renderBackButton()}
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Project Description</Text>
          </View>
        </View>
        {renderSaveAndCloseButtons()}
        <ScrollView contentInset={{bottom: 125}}>
          <Divider sectionText={'Basic Info'}/>
          {renderBasicInfo()}
          <Divider sectionText={'notes'}/>
          {renderNotes()}
          <Divider sectionText={'technical details'}/>
          {renderTechnicalDetails()}
          <Divider sectionText={'general details'}/>
          {renderGeneralDetails()}
        </ScrollView>
        {renderEditingModal()}
      </View>
    </React.Fragment>
  );
};

export default ProjectDescription;
