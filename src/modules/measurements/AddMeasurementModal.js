import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {FlatList, Platform} from 'react-native';

import {Formik} from 'formik';
import {Button, ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewUUID, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import Compass from '../compass/Compass';
import {setCompassMeasurementTypes} from '../compass/compass.slice';
import {Form, formStyles, useFormHook} from '../form';
import {MODAL_KEYS} from '../home/home.constants';
import {setModalValues, setModalVisible} from '../home/home.slice';
import useMapsHook from '../maps/useMaps';
import {editedSpotProperties} from '../spots/spots.slice';
import Templates from '../templates/Templates';
import AddLine from './AddLine';
import AddManualMeasurements from './AddManualMeasurements';
import AddPlane from './AddPlane';
import {MEASUREMENT_KEYS, MEASUREMENT_TYPES} from './measurements.constants';

const AddMeasurementModal = (props) => {
  const dispatch = useDispatch();
  const compassMeasurementTypes = useSelector(state => state.compass.measurementTypes);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const spot = useSelector(state => state.spot.selectedSpot);
  const templates = useSelector(state => state.project.project?.templates) || {};

  const [assocChoicesViewKey, setAssocChoicesViewKey] = useState(null);
  const [choices, setChoices] = useState({});
  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [initialValues, setInitialValues] = useState({id: getNewUUID()});
  const [isManualMeasurement, setIsManualMeasurement] = useState(Platform.OS === 'android');
  const [isShowTemplates, setIsShowTemplates] = useState(false);
  const [measurementTypeForForm, setMeasurementTypeForForm] = useState(null);
  const [relevantTemplates, setRelevantTemplates] = useState([]);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [survey, setSurvey] = useState({});

  const [useForm] = useFormHook();
  const [useMaps] = useMapsHook();

  const formRef = useRef(null);

  const groupKey = 'measurement';

  useLayoutEffect(() => {
    console.log('UE AddMeasurementModal [compassMeasurementTypes, templates]', compassMeasurementTypes, templates);
    const typeObj = MEASUREMENT_TYPES.find(t => equalsIgnoreOrder(t.compass_toggles, compassMeasurementTypes));
    setSelectedTypeIndex(MEASUREMENT_TYPES.findIndex(t => t.key === typeObj.key));

    // Get the templates for the measurement type
    const gotRelevantTemplates = templates.measurementTemplates && templates.useMeasurementTemplates
      && templates.activeMeasurementTemplates && templates.activeMeasurementTemplates.filter(
        t => typeObj.form_keys.includes(t.values?.type || t.type)) || [];
    setRelevantTemplates(gotRelevantTemplates);

    let initialValuesTemp = {
      id: getNewUUID(),
      type: typeObj.key === MEASUREMENT_KEYS.PLANAR_LINEAR ? MEASUREMENT_KEYS.PLANAR : typeObj.key,
    };

    // Set the initial form values if not multiple templates
    if (gotRelevantTemplates.length <= 1 || (typeObj.key === MEASUREMENT_KEYS.PLANAR_LINEAR
      && getPlanarTemplates(gotRelevantTemplates).length <= 1
      || getLinearTemplates(gotRelevantTemplates).length <= 1)) {
      if (typeObj.key === MEASUREMENT_KEYS.PLANAR_LINEAR) {
        if (getPlanarTemplates(gotRelevantTemplates).length === 1) {
          initialValuesTemp = {...initialValuesTemp, ...getPlanarTemplates(gotRelevantTemplates)[0].values};
        }
        if (getLinearTemplates(gotRelevantTemplates).length === 1) {
          if (!initialValuesTemp.associated_orientation) initialValuesTemp.associated_orientation = [];
          initialValuesTemp.associated_orientation[0] = {
            ...getLinearTemplates(gotRelevantTemplates)[0].values,
            id: getNewUUID(),
            type: MEASUREMENT_KEYS.LINEAR,
          };
        }
      }
      else if (gotRelevantTemplates.length === 1) {
        initialValuesTemp = {...initialValuesTemp, ...gotRelevantTemplates[0].values};
      }
    }
    setInitialValues(initialValuesTemp);
    setMeasurementTypeForForm(initialValuesTemp.type);
    const formName = [groupKey, initialValuesTemp.type];
    formRef.current?.setStatus({formName: formName});
    setSurvey(useForm.getSurvey(formName));
    setChoices(useForm.getChoices(formName));

  }, [compassMeasurementTypes, templates]);

  useEffect(() => {
    console.log('UE AddMeasurementModal []');
    return () => dispatch(setModalValues({}));
  }, []);

  const equalsIgnoreOrder = (a, b) => {
    if (a.length !== b.length) return false;
    const uniqueValues = new Set([...a, ...b]);
    for (const v of uniqueValues) {
      const aCount = a.filter(e => e === v).length;
      const bCount = b.filter(e => e === v).length;
      if (aCount !== bCount) return false;
    }
    return true;
  };

  const getPlanarTemplates = (templatesToFilter) => templatesToFilter.filter(
    t => t.values?.type === 'planar_orientation' || t.values?.type === 'tabular_orientation' || t.type === 'planar_orientation');

  const getLinearTemplates = (templatesToFilter) => templatesToFilter.filter(
    t => t.values?.type === 'linear_orientation' || t.type === 'linear_orientation');

  const onCloseButton = () => {
    if (choicesViewKey || assocChoicesViewKey) {
      setChoicesViewKey(null);
      setAssocChoicesViewKey(null);
    }
    else if (isShowTemplates) setIsShowTemplates(false);
    else dispatch(setModalVisible({modal: null}));
  };

  const onMeasurementTypePress = (i) => {
    if (i !== selectedTypeIndex) {
      setSelectedTypeIndex(i);
      formRef.current?.resetForm();
      const typeObj = MEASUREMENT_TYPES[i];
      setMeasurementTypeForForm(typeObj.form_keys[0]);
      const formType = typeObj.form_keys[0];
      const formName = [groupKey, formType];
      setSurvey(useForm.getSurvey(formName));
      setChoices(useForm.getChoices(formName));
      dispatch(setCompassMeasurementTypes(typeObj.compass_toggles));
    }
  };

  const onSetChoicesAssocViewKey = (key) => {
    setChoicesViewKey(null);
    setAssocChoicesViewKey(key);
  };

  const onSetChoicesViewKey = (key) => {
    setChoicesViewKey(key);
    setAssocChoicesViewKey(null);
  };

  const renderForm = (formProps) => {
    const assocFormName = [groupKey, 'linear_orientation'];
    const assocSurvey = useForm.getSurvey(assocFormName);
    const assocChoices = useForm.getChoices(assocFormName);
    let assocFormProps = JSON.parse(JSON.stringify(formProps));
    assocFormProps.values = {};
    const typeKey = MEASUREMENT_TYPES[selectedTypeIndex]
    && MEASUREMENT_TYPES[selectedTypeIndex].key === MEASUREMENT_KEYS.PLANAR_LINEAR ? MEASUREMENT_KEYS.PLANAR_LINEAR
      : measurementTypeForForm;
    return (
      <React.Fragment>
        {!isShowTemplates && (
          <ButtonGroup
            selectedIndex={selectedTypeIndex}
            onPress={onMeasurementTypePress}
            buttons={Object.values(MEASUREMENT_TYPES).map(t => t.add_title)}
            containerStyle={{height: 40, borderRadius: 10}}
            buttonStyle={{padding: 5}}
            selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
            textStyle={{color: PRIMARY_TEXT_COLOR}}
          />
        )}
        <Templates
          isShowTemplates={isShowTemplates}
          setIsShowTemplates={bool => setIsShowTemplates(bool)}
          typeKey={typeKey}
        />
        {!isShowTemplates && (
          <React.Fragment>
            {Platform.OS !== 'android' && (
              <Button
                buttonStyle={formStyles.formButtonSmall}
                titleProps={formStyles.formButtonTitle}
                title={isManualMeasurement ? 'Switch to Compass Input' : 'Manually Add Measurement'}
                type={'clear'}
                onPress={() => setIsManualMeasurement(!isManualMeasurement)}
              />
            )}
            {isManualMeasurement ? <AddManualMeasurements formProps={formProps} measurementType={typeKey}/>
              : <Compass setMeasurements={setMeasurements} formValues={formProps.values}/>}
            {measurementTypeForForm === MEASUREMENT_KEYS.PLANAR
              && getPlanarTemplates(relevantTemplates).length <= 1 && (
                <React.Fragment>
                  <AddPlane
                    survey={survey}
                    choices={choices}
                    setChoicesViewKey={onSetChoicesViewKey}
                    formName={[groupKey, MEASUREMENT_KEYS.PLANAR]}
                    formProps={formProps}
                    isManualMeasurement={isManualMeasurement}
                  />
                </React.Fragment>
              )}
            {(measurementTypeForForm === MEASUREMENT_KEYS.LINEAR || typeKey === MEASUREMENT_KEYS.PLANAR_LINEAR)
              && getLinearTemplates(relevantTemplates).length <= 1 && (
                <React.Fragment>
                  <AddLine
                    survey={assocSurvey}
                    choices={assocChoices}
                    setChoicesViewKey={typeKey === MEASUREMENT_KEYS.PLANAR_LINEAR ? onSetChoicesAssocViewKey : onSetChoicesViewKey}
                    formName={[groupKey, MEASUREMENT_KEYS.LINEAR]}
                    formProps={formProps}
                    isManualMeasurement={isManualMeasurement}
                    isPlanarLinear={typeKey === MEASUREMENT_KEYS.PLANAR_LINEAR}
                  />
                </React.Fragment>
              )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  const renderMeasurementModalContent = () => {
    const typeObj = MEASUREMENT_TYPES.find(t => equalsIgnoreOrder(t.compass_toggles, compassMeasurementTypes));
    const formName = [groupKey, measurementTypeForForm];
    const saveTitle = 'Save ' + typeObj.save_title + (relevantTemplates.length > 1 ? 's' : '');
    return (
      <Modal
        close={onCloseButton}
        buttonTitleRight={(choicesViewKey || assocChoicesViewKey) ? 'Done' : isShowTemplates ? '' : null}
        onPress={props.onPress}
      >
        <React.Fragment>
          {measurementTypeForForm && (
            <FlatList
              bounces={false}
              listKey={'form'}
              ListHeaderComponent={
                <Formik
                  innerRef={formRef}
                  initialValues={initialValues}
                  initialStatus={{formName: formName}}
                  onSubmit={(values) => console.log('Submitting form...', values)}
                  validate={(values) => useForm.validateForm({formName: formName, values: values})}
                  validateOnChange={false}
                  enableReinitialize={true}
                  children={(formProps) => choicesViewKey ? renderSubform(formProps)
                    : assocChoicesViewKey ? renderSubformAssoc(formProps) : renderForm(formProps)}
                />
              }
            />
          )}
          {!choicesViewKey && !assocChoicesViewKey && !isShowTemplates && isManualMeasurement && (
            <SaveButton title={saveTitle} onPress={saveMeasurement}/>
          )}
        </React.Fragment>
      </Modal>
    );
  };

  const renderSubform = (formProps) => {
    let relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    if (choicesViewKey === 'feature_type') {
      relevantFields = survey.filter(f => f.name === choicesViewKey || f.name === 'other_feature');
    }
    return <Form {...{formName: formProps.status.formName, surveyFragment: relevantFields, ...formProps}}/>;
  };

  const renderSubformAssoc = (formProps) => {
    let assocFormProps = JSON.parse(JSON.stringify(formProps));
    assocFormProps.values = {};
    const assocFormName = [groupKey, 'linear_orientation'];
    assocFormProps.status = {formName: assocFormName};
    const assocSurvey = useForm.getSurvey(assocFormName);
    let relevantFields = useForm.getRelevantFields(assocSurvey, assocChoicesViewKey);
    if (assocChoicesViewKey === 'feature_type') {
      relevantFields = assocSurvey.filter(f => f.name === assocChoicesViewKey || f.name === 'other_feature');
    }
    return (
      <Form {...{
        ...formProps,
        formName: assocFormProps.status.formName,
        surveyFragment: relevantFields,
        subkey: 'associated_orientation',
      }}
      />
    );
  };

  const saveMeasurement = async () => {
    const typeKey = MEASUREMENT_TYPES[selectedTypeIndex]
    && MEASUREMENT_TYPES[selectedTypeIndex].key === MEASUREMENT_KEYS.PLANAR_LINEAR ? MEASUREMENT_KEYS.PLANAR_LINEAR
      : measurementTypeForForm;
    // If plane with associated line copy label from plane data to line data
    if (typeKey === MEASUREMENT_KEYS.PLANAR_LINEAR) {
      if (formRef.current?.values?.label) {
        formRef.current.setFieldValue('associated_orientation[0].label', formRef.current.values.label);
      }
    }
    try {
      await formRef.current.submitForm();
      const editedMeasurementData = useForm.showErrors(formRef.current);
      // If plane with associated line validate associated line data
      if (typeKey === MEASUREMENT_KEYS.PLANAR_LINEAR && editedMeasurementData.associated_orientation) {
        useForm.validateForm({
          formName: [groupKey, MEASUREMENT_KEYS.LINEAR],
          values: editedMeasurementData.associated_orientation[0],
        });
      }
      const spotToUpdate = modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT ? await useMaps.setPointAtCurrentLocation()
        : spot;
      let editedMeasurementsData = spotToUpdate.properties.orientation_data
        ? JSON.parse(JSON.stringify(spotToUpdate.properties.orientation_data)) : [];
      if (editedMeasurementData.associated_orientation) {
        editedMeasurementData.associated_orientation[0].id = getNewUUID();
        editedMeasurementData.associated_orientation[0].type = MEASUREMENT_KEYS.LINEAR;
      }

      // If multiple templates then make all linear measurements associated to every planar and tabular meausurement
      if (relevantTemplates.length > 1) {
        if (typeKey === MEASUREMENT_KEYS.PLANAR_LINEAR) {
          let planarTabularTemplates = getPlanarTemplates(relevantTemplates);
          if (planarTabularTemplates.length === 0) planarTabularTemplates = [editedMeasurementData];
          let linearTemplates = getLinearTemplates(relevantTemplates);
          if (linearTemplates.length === 0) linearTemplates = editedMeasurementData.associated_orientation;
          planarTabularTemplates.forEach((t) => {
            const associatedMeasurements = linearTemplates.map(
              lT => ({...lT.values, ...editedMeasurementData.associated_orientation[0], id: getNewUUID()}));
            editedMeasurementsData.push(
              {
                ...t.values,
                ...editedMeasurementData,
                id: getNewUUID(),
                associated_orientation: associatedMeasurements,
              });
          });
        }
        else {
          relevantTemplates.forEach(
            t => editedMeasurementsData.push({...t.values, ...editedMeasurementData, id: getNewUUID()}));
        }
        console.log('editedMeasurementData', editedMeasurementsData);
        dispatch(editedSpotProperties({field: 'orientation_data', value: editedMeasurementsData}));
      }
      else {
        editedMeasurementsData.push({...editedMeasurementData, id: getNewUUID()});
        console.log('editedMeasurementData', editedMeasurementData);
        console.log('Saving Measurement data to Spot ...', editedMeasurementsData);
        dispatch(editedSpotProperties({field: 'orientation_data', value: editedMeasurementsData}));
      }
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  const setMeasurements = (compassData) => {
    const typeKey = MEASUREMENT_TYPES[selectedTypeIndex]
    && MEASUREMENT_TYPES[selectedTypeIndex].key === MEASUREMENT_KEYS.PLANAR_LINEAR ? MEASUREMENT_KEYS.PLANAR_LINEAR
      : measurementTypeForForm;
    const planarCompassFields = ['strike', 'dip_direction', 'dip', 'quality'];
    const linearCompassFields = ['trend', 'plunge', 'rake', 'quality'];
    const compassFields = measurementTypeForForm === MEASUREMENT_KEYS.PLANAR ? planarCompassFields : linearCompassFields;
    compassFields.forEach(compassFieldKey => {
      if (!isEmpty(compassData[compassFieldKey])) {
        formRef.current.setFieldValue(compassFieldKey, compassData[compassFieldKey]);
      }
    });
    if (typeKey === MEASUREMENT_KEYS.PLANAR_LINEAR) {
      linearCompassFields.forEach(compassFieldKey => {
        formRef.current.setFieldValue('associated_orientation[0]' + [compassFieldKey], compassData[compassFieldKey]);
      });
    }
    saveMeasurement().catch(console.error);
  };

  if (Platform.OS === 'android') return renderMeasurementModalContent();
  else return <DragAnimation>{renderMeasurementModalContent()}</DragAnimation>;
};

export default AddMeasurementModal;