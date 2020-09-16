import React, {useEffect, useState} from 'react';
import {Platform, ScrollView, Text, TextInput, View} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import * as forms from '../../assets/forms/forms.index';
import commonStyles from '../../shared/common.styles';
import {truncateText, isEmpty} from '../../shared/Helpers';
import SaveAndCloseButtons from '../../shared/ui/SaveAndCloseButtons';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {projectReducers} from './project.constants';
import styles from './project.styles';
import EditingModal from './ProjectDescriptionEditModal';

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
    const generalFields = form.filter((field) => (
      ![...projectDescriptionFieldsGrouped.basic, ...projectDescriptionFieldsGrouped.notes,
        ...projectDescriptionFieldsGrouped.technical].includes(field.name) && !excludedFieldTypes.includes(field.type)
    ));
    return {
      basic: basicFields,
      technical: technicalFields,
      notes: notesFields,
      general: generalFields,
    };
  };

  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const [projectDescription, setProjectDescription] = useState({
    ...project.description,
    start_date: Date.parse(project.description.start_date) ? new Date(project.description.start_date) : new Date(),
    end_date: Date.parse(project.description.end_date) ? new Date(project.description.end_date) : new Date(),
    gps_datum: project.description.gps_datum || 'WGS84 (Default)',
    magnetic_declination: project.description.magnetic_declination || 0,
  });
  const [isValidMagneticDeclination, setIsValidMagneticDeclination] = useState(false);
  const [magneticDeclinationValidationMessage, setMagneticDeclinationValidationMessage] = useState('');
  const [selectedField, setSelectedField] = useState();
  const [showEditingModal, setShowEditingModal] = useState(false);
  const [pickerVisible, setPickerVisible] = useState();
  const fields = getInitialFields();

  useEffect(() => {
    console.log('UE, []');
    validateMagneticDeclination(projectDescription.magnetic_declination);
  }, []);

  const changeStartDate = (event, date) => {
    if (Platform.OS === 'android') setPickerVisible();
    setProjectDescription({...projectDescription, start_date: date || projectDescription.start_date});
  };

  const changeEndDate = (event, date) => {
    if (Platform.OS === 'android') setPickerVisible();
    setProjectDescription({...projectDescription, end_date: date || projectDescription.end_date});
  };

  const renderBasicInfo = () => {
    return (
      <React.Fragment>
        <View style={commonStyles.sectionContainer}>
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
            containerStyle={styles.projectDescriptionListContainer}
            onPress={() => setPickerVisible('startDate')}
            bottomDivider
          >
            <ListItem.Content>
              <ListItem.Title style={styles.listItemTitleAndValue}>{'Start Date'}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Content style={styles.listItemTitleAndValue}>
              <ListItem.Title>{moment(projectDescription.start_date).format('MM/DD/YYYY')}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron/>
          </ListItem>
          <ListItem
            containerStyle={styles.projectDescriptionListContainer}
            onPress={() => setPickerVisible('endDate')}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.listItemTitleAndValue}>{'End Date'}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Content style={styles.listItemTitleAndValue}>
              <ListItem.Title>{moment(projectDescription.end_date).format('MM/DD/YYYY')}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron/>
          </ListItem>
          {pickerVisible === 'startDate' && (
            <View>
              {Platform.OS === 'ios'
              && <Button type={'clear'} title={'Start Date Done'} onPress={() => setPickerVisible()}/>}
              <DateTimePicker
                mode={'date'}
                value={projectDescription.start_date || new Date()}
                onChange={changeStartDate}
                display='default'
              />
            </View>
          )}
          {pickerVisible === 'endDate' && (
            <View>
              {Platform.OS === 'ios'
              && <Button type={'clear'} title={'End Date Done'} onPress={() => setPickerVisible()}/>}
              <DateTimePicker
                mode={'date'}
                value={projectDescription.end_date || new Date()}
                minimumDate={projectDescription.start_date}
                onChange={changeEndDate}
                display='default'
              />
            </View>
          )}
        </View>
      </React.Fragment>
    );
  };

  const renderNotes = () => {
    return (
      <React.Fragment>
        <View style={commonStyles.sectionContainer}>
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
      return (
        <EditingModal
          visible={showEditingModal}
          dialogTitle={selectedField && selectedField.label}
          disabled={selectedField.name === 'magnetic_declination' && !isValidMagneticDeclination}
          confirm={() => setShowEditingModal(false)}
        >
          <View style={{flex: 1, alignItems: 'center'}}>
            <TextInput
              keyboardType={selectedField.name === 'magnetic_declination' ? 'number-pad' : 'default'}
              onChangeText={(val) => selectedField.name === 'magnetic_declination'
                ? validateMagneticDeclination(val)
                : setProjectDescription({...projectDescription, [selectedField.name]: val})
              }
              numberOfLines={selectedField.name === 'magnetic_declination' ? 1 : 4}
              multiline={selectedField.name !== 'magnetic_declination'}
              defaultValue={!isEmpty(projectDescription[selectedField.name])
              && projectDescription[selectedField.name].toString()}
              style={{backgroundColor: 'white', padding: 15, width: 250, maxHeight: 200}}
            />
          </View>
          {selectedField.name === 'magnetic_declination' && (
            <View style={styles.dialogConfirmText}>
              <Text style={styles.dialogContentImportantText}>{magneticDeclinationValidationMessage}</Text>
            </View>
          )}
        </EditingModal>
      );
    }
  };

  const renderListItemFields = (field, i, obj) => {
    const fieldName = projectDescription && !isEmpty(projectDescription[field.name])
      ? truncateText(projectDescription[field.name], 15).toString()
      : 'None';
    return (
      <ListItem
        key={field.name}
        containerStyle={styles.projectDescriptionListContainer}
        bottomDivider={i < obj.length - 1}
        onPress={() => toggleEditingModal(field)}
      >
        <ListItem.Content>
          <ListItem.Title style={styles.listItemTitleAndValue}>{field.label}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Content style={styles.listItemTitleAndValue}>
          <ListItem.Title>{fieldName}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
      </ListItem>
    );
  };
  const toggleEditingModal = (field) => {
    setShowEditingModal(true);
    setSelectedField(field);
  };

  const renderGeneralDetails = () => (
    <View style={commonStyles.sectionContainer}>
      {fields.general.map((field, i, obj) => renderListItemFields(field, i, obj))}
    </View>
  );

  const renderSaveAndCloseButtons = () => {
    return (
      <SaveAndCloseButtons
        cancel={() => {
          setProjectDescription(project.description);
          dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
        }}
        save={() => saveProjectDescriptionAndGo()}/>
    );
  };

  const renderTechnicalDetails = () => (
    <View style={commonStyles.sectionContainer}>
      {fields.technical.map((field, i, obj) => renderListItemFields(field, i, obj))}
    </View>
  );

  const saveProjectDescriptionAndGo = async () => {
    await dispatch({type: projectReducers.UPDATE_PROJECT, field: 'description', value: projectDescription});
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
  };

  const validateMagneticDeclination = (val) => {
    const magneticDeclination = parseFloat(val, 10);
    if (magneticDeclination >= -180 && magneticDeclination <= 180) {
      setIsValidMagneticDeclination(true);
      setMagneticDeclinationValidationMessage('');
      setProjectDescription({...projectDescription, magnetic_declination: magneticDeclination});
    }
    else {
      setIsValidMagneticDeclination(false);
      setMagneticDeclinationValidationMessage('Must be between -180 and 180');
    }
  };

  return (
    <React.Fragment>
      <SidePanelHeader
        title={'Active Project'}
        headerTitle={'Project Description'}
        backButton={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})}
      />
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
    </React.Fragment>
  );
};

export default ProjectDescription;
