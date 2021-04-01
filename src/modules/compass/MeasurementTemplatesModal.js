import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, Platform, TextInput, View} from 'react-native';

import {Formik} from 'formik';
import {Button, ButtonGroup, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewUUID, isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {Form, formStyles, useFormHook} from '../form';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import styles from '../measurements/measurements.styles';
import {addedMeasurementTemplates, setActiveMeasurementTemplates} from '../project/projects.slice';

const MeasurementTemplatesModal = (props) => {
  const dispatch = useDispatch();
  const measurementTemplates = useSelector(state => state.project.project?.templates?.measurementTemplates);
  const activeMeasurementTemplates = useSelector(state => state.project.project?.templates?.activeMeasurementTemplates) || [];
  const [displayForm, setDisplayForm] = useState(false);
  const [formName, setFormName] = useState([]);
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState({values: {}});
  const [tabularOrientation, setTabularOrientation] = useState(false);
  const [useForm] = useFormHook();
  const formRef = useRef(null);

  useEffect(() => {
    if (selectedTemplate.subType === 'tabular_orientation') setTabularOrientation(true);
    else setTabularOrientation(false);
  }, [selectedTemplate]);

  useEffect(() => {
    tabularOrientation ? setFormName(['measurement_bulk', 'tabular_orientation']) : setFormName(
      ['measurement_bulk', props.type]);
  }, [tabularOrientation]);

  const clearTemplate = () => {
    props.type === 'linear_orientation' ? dispatch(setActiveMeasurementTemplates([activeMeasurementTemplates[0]]))
      : dispatch(setActiveMeasurementTemplates([, activeMeasurementTemplates[1]]));
    closeMeasurementTemplatesModal();
  };

  const closeMeasurementTemplatesModal = () => {
    if (displayForm) {
      setDisplayForm(false);
      props.type === 'planar_orientation' ? dispatch(
        setModalVisible({modal: MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_PLANAR}))
        : dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.MEASUREMENT_TEMPLATES_LINEAR}));
    }
    else dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.COMPASS}));
  };

  const confirmDeleteTemplate = () => {
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

  const createNewOrEditTemplate = (mode) => {
    setDisplayForm(true);
    if (mode === 'new') {
      setName('');
      setSelectedTemplate({values: {}});
    }
    if (tabularOrientation) setFormName(['measurement_bulk', 'tabular_orientation']);
    else setFormName(['measurement_bulk', props.type]);
    props.type === 'planar_orientation' ? dispatch(
      setModalVisible({modal: MODALS.NOTEBOOK_MODALS.MEASUREMENT_PLANAR_TEMPLATE_FORM})) : dispatch(
      setModalVisible({modal: MODALS.NOTEBOOK_MODALS.MEASUREMENT_LINEAR_TEMPLATE_FORM}));
  };

  const deleteTemplate = (template) => {
    const existingTemplatesButCurrentTemplate = measurementTemplates.filter(
      templateId => selectedTemplate.id != templateId.id);
    dispatch(addedMeasurementTemplates(existingTemplatesButCurrentTemplate));
    if ((!isEmpty(activeMeasurementTemplates[0]) && activeMeasurementTemplates[0].id === template.id) || (!isEmpty(
      activeMeasurementTemplates[1]) && activeMeasurementTemplates[1].id === template.id)) {
      clearTemplate();
    }
    closeMeasurementTemplatesModal();
  };

  const editTemplate = (template) => {
    setSelectedTemplate(template);
    setName(template.name);
    createNewOrEditTemplate('edit');
  };

  function getRelevantMeasurementTemplates(type) {
    return !isEmpty(measurementTemplates) ? measurementTemplates.filter(
      template => template.type === type) : [];
  }

  const onSwitchPlanarTabular = (i) => {
    const currentType = tabularOrientation ? 'tabular_orientation' : 'planar_orientation';
    if ((i === 0 && currentType === 'tabular_orientation') || (i === 1 && currentType === 'planar_orientation')) {
      const newType = currentType === 'tabular_orientation' ? 'planar_orientation' : 'tabular_orientation';

      const typeText = newType === 'tabular_orientation' ? 'Tabular Zone' : 'Planar Orientation';
      if (!isEmpty(selectedTemplate.id)) {
        const alertTextEnd = 'this measurement to a ' + typeText + '? You will '
          + 'lose all data for the current template.';
        Alert.alert('Switch to ' + typeText, 'Are you sure you want to switch ' + alertTextEnd,
          [{
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          }, {
            text: 'OK',
            onPress: () => newType === 'tabular_orientation' ? setTabularOrientation(true) : setTabularOrientation(
              false),
          }],
          {cancelable: false},
        );
      }
      else newType === 'tabular_orientation' ? setTabularOrientation(true) : setTabularOrientation(false);
    }
  };

  const renderFormFields = () => {
    return (
      <View style={{flex: 1}}>
        {props.type === 'planar_orientation'
        && <ButtonGroup
          onPress={i => onSwitchPlanarTabular(i)}
          selectedIndex={tabularOrientation ? 1 : 0}
          buttons={['Planar Feature', 'Tabular Zone']}
          containerStyle={styles.measurementDetailSwitches}
          selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
          textStyle={{color: PRIMARY_ACCENT_COLOR}}
        />}
        <TextInput
          style={[formStyles.fieldValue, {paddingLeft: 15, paddingTop: 5}]}
          placeholder={'Name of the Template ...'}
          onChangeText={value => setName(value)}
          value={name}
        />
        <Formik
          innerRef={formRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          children={(formProps) => (
            <Form {...formProps} {...{formName: formName}}/>
          )}
          initialValues={selectedTemplate.values}
          validateOnChange={true}
          enableReinitialize={true}
        />
        <Button
          titleStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
          title={'Save'}
          type={'save'}
          onPress={() => saveTemplate(formRef)}
        />
        {!isEmpty(selectedTemplate.id) && (
          <Button
            titleStyle={{color: themes.RED}}
            title={'Delete Template'}
            type={'clear'}
            onPress={() => confirmDeleteTemplate(selectedTemplate)}
          />
        )}
      </View>
    );
  };

  const renderTemplate = (template) => {
    return (
      <View style={{borderBottomWidth: 1}}>
        <ListItem onPress={() => setAsTemplate(template)} containerStyle={commonStyles.listItem}>
          <ListItem.Content>
            <ListItem.Title
              style={commonStyles.listItemTitle}>{template.name}</ListItem.Title>
          </ListItem.Content>
          <Button
            titleStyle={commonStyles.standardButtonText}
            title={'Edit'}
            type={'save'}
            onPress={() => editTemplate(template)}
          />
        </ListItem>
      </View>
    );
  };

  const renderTemplates = () => {
    return (
      <React.Fragment>
        <View>
          <FlatList
            data={getRelevantMeasurementTemplates(props.type)}
            keyExtractor={(item) => item.name}
            renderItem={({item}) => renderTemplate(item)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'There are no templates defined yet.'}/>}
          />
        </View>
        <Button
          titleStyle={commonStyles.standardButtonText}
          title={'Clear Template'}
          type={'clear'}
          onPress={() => clearTemplate()}
        />
        <Button
          titleStyle={commonStyles.standardButtonText}
          title={'Define New Template'}
          type={'clear'}
          onPress={() => createNewOrEditTemplate('new')}
        />
      </React.Fragment>
    );
  };

  const renderMeasurementTemplatesModalContent = () => {
    return (
      <Modal
        close={closeMeasurementTemplatesModal}
        textStyle={{fontWeight: 'bold'}}
        style={[uiStyles.modalPosition, {'width': 300}]}
      >
        {displayForm && (
          <FlatList
            ListHeaderComponent={
              <View>
                <View>
                  {!isEmpty(formName) && renderFormFields()}
                </View>
              </View>
            }
          />
        )}
        {!displayForm && renderTemplates()}
      </Modal>
    );
  };

  const saveTemplate = (formRef) => {
    let templateObject;
    if (isEmpty(name)) {
      Alert.alert('Template name empty', 'Provide a template name.');
      return false;
    }
    let existingTemplatesCopy = !isEmpty(measurementTemplates) ? JSON.parse(JSON.stringify(measurementTemplates)) : [];
    if (!isEmpty(selectedTemplate.id)) {
      templateObject = {
        'id': selectedTemplate.id,
        'name': name,
        'type': selectedTemplate.type,
        'values': formRef.current.values,
      };
      existingTemplatesCopy = existingTemplatesCopy.filter((templateId) => {
        return templateObject.id != templateId.id;
      });
    }
    else {
      templateObject = {
        'id': getNewUUID(),
        'name': name,
        'type': props.type,
        'values': formRef.current.values,
      };
    }
    props.type === 'planar_orientation' && tabularOrientation ? templateObject.subType = 'tabular_orientation'
      : templateObject.subType = '';
    existingTemplatesCopy.push(templateObject);
    existingTemplatesCopy = existingTemplatesCopy.sort(
      (templateA, templateB) => templateA.name.localeCompare(templateB.name));
    dispatch(addedMeasurementTemplates(existingTemplatesCopy));
    setAsTemplate(templateObject);
    closeMeasurementTemplatesModal();
  };

  const setAsTemplate = (template) => {
    let activeMeasurementTemplatesCopy = !isEmpty(activeMeasurementTemplates) ? JSON.parse(
      JSON.stringify(activeMeasurementTemplates)) : [];
    if (template.type === 'planar_orientation') activeMeasurementTemplatesCopy[0] = template;
    else activeMeasurementTemplatesCopy[1] = template;
    dispatch(setActiveMeasurementTemplates(activeMeasurementTemplatesCopy));
    closeMeasurementTemplatesModal();
  };

  if (Platform.OS === 'android') return renderMeasurementTemplatesModalContent();
  else return <DragAnimation>{renderMeasurementTemplatesModalContent()}</DragAnimation>;
};

export default MeasurementTemplatesModal;
