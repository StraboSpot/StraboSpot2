import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Switch, Text, TextInput, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewUUID, isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {COMPASS_TOGGLE_BUTTONS} from '../compass/compass.constants';
import {setCompassMeasurementTypes} from '../compass/compass.slice';
import {formStyles} from '../form';
import {MODAL_KEYS, MODALS} from '../home/home.constants';
import MeasurementDetail from '../measurements/MeasurementDetail';
import BasicPageDetail from '../page/BasicPageDetail';
import {PET_PAGES, SED_PAGES} from '../page/page.constants';
import {addedTemplates, setActiveTemplates, setUseTemplate} from '../project/projects.slice';

const Templates = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const templates = useSelector(state => state.project.project?.templates) || {};

  const [activeTemplatesForKey, setActiveTemplatesForKey] = useState([]);
  const [isShowForm, setIsShowForm] = useState(false);
  const [isShowNameInput, setIsShowNameInput] = useState(false);
  const [isTemplateInUse, setIsTemplateInUse] = useState(null);
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState({values: {}});
  const [templateType, setTemplateType] = useState(null);
  const [templatesForKey, setTemplatesForKey] = useState([]);

  const page = MODALS.find(p => p.key === modalVisible);
  const measurementKey = 'measurementTemplates';
  const templateKey = modalVisible === MODAL_KEYS.NOTEBOOK.MEASUREMENTS
  || modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT ? measurementKey
    : modalVisible === MODAL_KEYS.NOTEBOOK.ROCK_TYPE_IGNEOUS
    || modalVisible === MODAL_KEYS.NOTEBOOK.ROCK_TYPE_SEDIMENTARY ? props.rockKey
      : modalVisible;

  useEffect(() => {
    if (templateKey === measurementKey) {
      setIsTemplateInUse(templates.useMeasurementTemplates);
      setTemplatesForKey(templates.measurementTemplates);
      setActiveTemplatesForKey(templates.activeMeasurementTemplates);
      if (templates.useMeasurementTemplates && !isEmpty(templates.activeMeasurementTemplates)) {
        const activePlanarTabularTemplates = templates.activeMeasurementTemplates.filter(
          template => template.values?.type === 'planar_orientation' || template.values?.type === 'tabular_orientation'
            || template.type === 'planar_orientation');
        const activeLinearTemplates = templates.activeMeasurementTemplates.filter(
          template => template.values?.type === 'linear_orientation' || template.type === 'linear_orientation');
        if (!isEmpty(activeLinearTemplates) && !isEmpty(activePlanarTabularTemplates)) {
          dispatch(setCompassMeasurementTypes([COMPASS_TOGGLE_BUTTONS.LINEAR, COMPASS_TOGGLE_BUTTONS.PLANAR]));
        }
        else if (!isEmpty(activeLinearTemplates)) {
          dispatch(setCompassMeasurementTypes([COMPASS_TOGGLE_BUTTONS.LINEAR]));
        }
        else if (!isEmpty(activePlanarTabularTemplates)) {
          dispatch(setCompassMeasurementTypes([COMPASS_TOGGLE_BUTTONS.PLANAR]));
        }
      }
    }
    else {
      setIsTemplateInUse(templates[templateKey] && templates[templateKey].isInUse);
      setTemplatesForKey((templates[templateKey] && templates[templateKey].templates) || []);
      setActiveTemplatesForKey((templates[templateKey] && templates[templateKey].active) || []);
    }
  }, [templates, templateKey]);

  const clearTemplate = () => {
    if (templateType === 'planar_orientation') {
      const activeLinearTemplates = activeTemplatesForKey.filter(template => template.values?.type !== templateType
        && template.values?.type !== 'tabular_orientation' && template.type !== templateType);
      dispatch(setActiveTemplates({key: templateKey, templates: activeLinearTemplates}));
    }
    else if (templateType === 'linear_orientation') {
      const activePlanarTabularTemplates = activeTemplatesForKey.filter(
        template => template.values?.type !== templateType && template.type !== templateType);
      dispatch(setActiveTemplates({key: templateKey, templates: activePlanarTabularTemplates}));
    }
    else dispatch(setActiveTemplates({key: templateKey, templates: []}));
    closeTemplates();
  };

  const closeTemplates = () => {
    setIsShowForm(false);
    props.setIsShowTemplates(false);
  };

  const continueToTemplateForm = () => {
    setIsShowNameInput(false);
    setIsShowForm(true);
  };

  const createNewTemplate = () => {
    setIsShowNameInput(true);
    setName('');
    if (templateKey === measurementKey) setSelectedTemplate({values: {type: templateType}});
    else if (modalVisible === MODAL_KEYS.NOTEBOOK.ROCK_TYPE_IGNEOUS) {
      setSelectedTemplate({values: {igneous_rock_class: templateType}});
    }
    else setSelectedTemplate({values: {}});
  };

  const deleteTemplate = (template) => {
    clearTemplate();
    const updatedTemplates = templatesForKey.filter(t => t.id !== template.id);
    dispatch(addedTemplates({key: templateKey, templates: updatedTemplates}));
  };

  const deleteTemplateConfirm = () => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete ' + selectedTemplate.name + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => deleteTemplate(selectedTemplate),
        },
      ],
      {cancelable: false},
    );
  };

  const editTemplate = (template) => {
    setIsShowNameInput(true);
    setSelectedTemplate(template);
    setName(template.name);
  };

  const renderFormFields = () => {
    return (
      <FlatList ListHeaderComponent={
        <View style={{flex: 1}}>
          {templateKey === measurementKey ? renderMeasurementsForm() : renderNonMeasurementsForm()}
        </View>}
      />
    );
  };

  const renderMeasurementsForm = () => {
    let values = JSON.parse(JSON.stringify(selectedTemplate.values));
    if (!values.type && selectedTemplate.subType) values.type = selectedTemplate.subType;
    else if (!values.type && selectedTemplate.type) values.type = selectedTemplate.type;
    return (
      <MeasurementDetail
        closeDetailView={() => setIsShowForm(false)}
        selectedAttitudes={[values]}
        saveTemplate={saveTemplate}
        deleteTemplate={deleteTemplateConfirm}
      />
    );
  };

  const renderNonMeasurementsForm = () => {
    const isPet = PET_PAGES.find(p => p.key === page.key);
    const isSed = SED_PAGES.find(p => p.key === page.key);
    const groupKey = isPet ? 'pet' : isSed ? 'sed' : 'general';
    return (
      <BasicPageDetail
        closeDetailView={() => setIsShowForm(false)}
        selectedFeature={selectedTemplate.values}
        page={page}
        groupKey={groupKey}
        saveTemplate={saveTemplate}
        deleteTemplate={deleteTemplateConfirm}
      />
    );
  };

  const renderTemplateListItem = (template) => {
    const isActive = activeTemplatesForKey.map(t => t.id).includes(template.id);
    return (
      <View>
        <ListItem
          onPress={() => setAsTemplate(template)}
          containerStyle={isActive ? commonStyles.listItemInverse : commonStyles.listItem}
        >
          <ListItem.Content>
            <ListItem.Title style={isActive ? commonStyles.listItemTitleInverse : commonStyles.listItemTitle}>
              {template.name}
            </ListItem.Title>
          </ListItem.Content>
          <Button
            titleStyle={isActive ? commonStyles.standardButtonTextInverse : commonStyles.standardButtonText}
            title={'Edit'}
            type={'save'}
            onPress={() => editTemplate(template)}
          />
        </ListItem>
      </View>
    );
  };

  const renderTemplatesList = () => {
    let label = modalVisible === MODAL_KEYS.NOTEBOOK.ROCK_TYPE_IGNEOUS ? toTitleCase(templateKey)  + ' Rock'
      : page.label_singular || toTitleCase(page.label).slice(0, -1) || 'Unknown';

    let relevantTemplates = [];
    if (templateType === 'planar_orientation') {
      relevantTemplates = !isEmpty(templatesForKey)
        && templatesForKey.filter(
          t => t.values?.type === templateType || t.values?.type === 'tabular_orientation' || t.type === templateType);
      label = 'Planar';
    }
    else if (templateType === 'linear_orientation') {
      relevantTemplates = !isEmpty(templatesForKey) && templatesForKey.filter(
        t => t.values?.type === templateType || t.type === templateType);
      label = 'Linear';
    }
    else if (!isEmpty(templatesForKey)) relevantTemplates = templatesForKey;

    return (
      <React.Fragment>
        <FlatList
          data={relevantTemplates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => renderTemplateListItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={'There are no templates defined yet.'}/>}
        />
        <Button
          titleStyle={commonStyles.standardButtonText}
          title={'Done'}
          type={'clear'}
          onPress={closeTemplates}
        />
        {!isEmpty(relevantTemplates) && (
          <Button
            titleStyle={commonStyles.standardButtonText}
            title={'Clear Selected Template'}
            type={'clear'}
            onPress={clearTemplate}
          />
        )}
        <Button
          titleStyle={commonStyles.standardButtonText}
          title={'Define New ' + label + ' Template'}
          type={'clear'}
          onPress={createNewTemplate}
        />
      </React.Fragment>
    );
  };

  const renderTemplateNameInput = () => {
    return (
      <React.Fragment>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button
            titleStyle={commonStyles.standardButtonText}
            title={'Cancel'}
            type={'clear'}
            onPress={() => setIsShowNameInput(false)}
          />
          <Button
            titleStyle={commonStyles.standardButtonText}
            title={'Continue'}
            type={'clear'}
            disabled={isEmpty(name)}
            onPress={() => continueToTemplateForm()}
          />
        </View>
        <View style={[commonStyles.listItemFormField, {backgroundColor: themes.SECONDARY_BACKGROUND_COLOR}]}>
          <View style={formStyles.fieldLabelContainer}>
            <Text style={formStyles.fieldLabel}>{'Template Name'}</Text>
          </View>
          <TextInput
            style={formStyles.fieldValue}
            onChangeText={value => setName(value)}
            value={name}
            autoFocus={isEmpty(name)}
          />
        </View>
      </React.Fragment>
    );
  };

  const renderTemplatesSelected = () => {
    if (templateKey === measurementKey) {
      return (
        <React.Fragment>
          {renderTemplateSelection('planar_orientation')}
          {renderTemplateSelection('linear_orientation')}
        </React.Fragment>
      );
    }
    else {
      return (
        <React.Fragment>
          {renderTemplateSelection(templateKey)}
        </React.Fragment>
      );
    }
  };

  const renderTemplateSelection = (type) => {
    let activeTemplates = templates[type] && templates[type].active && !isEmpty(templates[type].active)
      && templates[type].active || [];
    let label = page.label_singular || toTitleCase(page.label).slice(0, -1) || 'Unknown';
    if (type === 'planar_orientation') {
      activeTemplates = activeTemplatesForKey?.find(
        t => t.values?.type === type || t.values?.type === 'tabular_orientation' || t.type === type);
      activeTemplates = isEmpty(activeTemplates) ? [] : [activeTemplates];
      label = 'Planar';
    }
    else if (type === 'linear_orientation') {
      activeTemplates = activeTemplatesForKey?.find(t => t.values?.type === type || t.type === type);
      activeTemplates = isEmpty(activeTemplates) ? [] : [activeTemplates];
      label = 'Linear';
    }
    else if (modalVisible === MODAL_KEYS.NOTEBOOK.ROCK_TYPE_IGNEOUS) label = toTitleCase(type);

    const title = templateKey === measurementKey ? 'Select ' + label + ' Template' : 'Select ' + label + ' Template(s)';

    return (
      <View>
        {isEmpty(activeTemplates) ? (
            <ListItem containerStyle={{padding: 0, flex: 1, width: '100%', justifyContent: 'center'}}>
              <Button
                titleStyle={commonStyles.standardButtonText}
                title={title}
                type={'clear'}
                onPress={() => {
                  props.setIsShowTemplates(true);
                  setTemplateType(type);
                }}
              />
            </ListItem>
          )
          : (
            <FlatList
              data={activeTemplates}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({item}) =>
                <ListItem containerStyle={{padding: 0, paddingLeft: 10, paddingRight: 10}}>
                  <ListItem.Content>
                    <ListItem.Title style={commonStyles.listItemTitle}>
                      {item.name}
                    </ListItem.Title>
                  </ListItem.Content>
                  <Button
                    titleStyle={commonStyles.standardButtonText}
                    title={'Change'}
                    type={'clear'}
                    onPress={() => {
                      props.setIsShowTemplates(true);
                      setTemplateType(type);
                    }}
                  />
                </ListItem>
              }
            />
          )}
      </View>
    );
  };

  const renderTemplateToggle = () => {
    return (
      <View>
        <ListItem containerStyle={{padding: 0, paddingLeft: 10, paddingRight: 10}}>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>
              {'Use Template(s)?'}
            </ListItem.Title>
          </ListItem.Content>
          <Switch
            onValueChange={toggleUseTemplateSwitch}
            value={isTemplateInUse}
          />
        </ListItem>
        {isTemplateInUse && renderTemplatesSelected()}
      </View>
    );
  };

  const saveTemplate = (values) => {
    let templateObject;
    if (isEmpty(name)) Alert.alert('Template name empty', 'Provide a template name.');
    else {
      let existingTemplatesCopy = !isEmpty(templatesForKey) ? JSON.parse(JSON.stringify(templatesForKey)) : [];
      if (!isEmpty(selectedTemplate.id)) {
        templateObject = {
          'id': selectedTemplate.id,
          'name': name,
          'values': values,
        };
        existingTemplatesCopy = existingTemplatesCopy.filter((templateId) => templateObject.id !== templateId.id);
      }
      else {
        templateObject = {
          'id': getNewUUID(),
          'name': name,
          'values': values,
        };
      }
      existingTemplatesCopy.push(templateObject);
      existingTemplatesCopy = existingTemplatesCopy.sort(
        (templateA, templateB) => templateA.name.localeCompare(templateB.name));
      dispatch(addedTemplates({key: templateKey, templates: existingTemplatesCopy}));
      setAsTemplate(templateObject);
      closeTemplates();
    }
  };

  const setAsTemplate = (template) => {
    let activeTemplatesForKeyCopy = !isEmpty(activeTemplatesForKey) ? JSON.parse(JSON.stringify(activeTemplatesForKey))
      : [];
    if (templateKey === measurementKey) {
      const type = template.values.type || template.type;
      let activeTemplatesForKeyCopyFiltered = activeTemplatesForKeyCopy.filter(t => t.type !== type
        && t.values.type !== type);
      if (type === 'planar_orientation' || type === 'tabular_orientation') {
        activeTemplatesForKeyCopyFiltered = activeTemplatesForKeyCopy.filter(t => t.type !== 'planar_orientation'
          && t.values.type !== 'planar_orientation' && t.values.type !== 'tabular_orientation');
      }
      activeTemplatesForKeyCopyFiltered.push(template);
      dispatch(setActiveTemplates({key: templateKey, templates: activeTemplatesForKeyCopyFiltered}));
    }
    else {
      const foundTemplate = activeTemplatesForKeyCopy.find(t => t.id === template.id);
      if (foundTemplate) {
        const templatesUpdated = activeTemplatesForKeyCopy.filter(t => t.id !== template.id);
        dispatch(setActiveTemplates({key: templateKey, templates: templatesUpdated}));
      }
      else dispatch(setActiveTemplates({key: templateKey, templates: [...activeTemplatesForKeyCopy, template]}));
    }
  };

  const toggleUseTemplateSwitch = (value) => {
    setIsTemplateInUse(value);
    dispatch(setUseTemplate({key: templateKey, bool: value}));
  };

  return (
    <React.Fragment>
      {props.isShowTemplates && isShowNameInput ? renderTemplateNameInput()
        : props.isShowTemplates && isShowForm ? renderFormFields()
          : props.isShowTemplates ? renderTemplatesList()
            : renderTemplateToggle()}
    </React.Fragment>
  );
};

export default Templates;
