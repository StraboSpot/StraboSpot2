import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform} from 'react-native';

import {Formik} from 'formik';
import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import Modal from '../../shared/ui/modal/Modal';
import {setCompassMeasurementTypes} from '../compass/compass.slice';
import {Form, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import AddLine from './AddLine';
import AddPlane from './AddPlane';
import {MEASUREMENT_KEYS, MEASUREMENT_TYPES} from './measurements.constants';

const AddMeasurementModal = (props) => {
  const dispatch = useDispatch();
  const compassMeasurementTypes = useSelector(state => state.compass.measurementTypes);
  const modalValues = useSelector(state => state.home.modalValues);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [assocChoicesViewKey, setAssocChoicesViewKey] = useState(null);
  const [survey, setSurvey] = useState({});
  const [choices, setChoices] = useState({});
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  const groupKey = 'measurement';

  useEffect(() => {
    console.log('UE AddMeasurementModal [modalValues]', modalValues);
    const typeObj = MEASUREMENT_TYPES.find(t => equalsIgnoreOrder(t.compass_toggles, compassMeasurementTypes));
    setSelectedTypeIndex(MEASUREMENT_TYPES.findIndex(t => t.key === typeObj.key));
    const initialValues = {
      id: getNewId(),
      type: typeObj.key === MEASUREMENT_KEYS.PLANAR_LINEAR ? MEASUREMENT_KEYS.PLANAR : typeObj.key,
    };
    formRef.current?.setValues(initialValues);
    const formName = [groupKey, typeObj.form_keys[0]];
    formRef.current?.setStatus({formName: formName});
    setSurvey(useForm.getSurvey(formName));
    setChoices(useForm.getChoices(formName));
  }, [modalValues]);

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

  const onCloseButton = () => {
    if (choicesViewKey || assocChoicesViewKey) {
      setChoicesViewKey(null);
      setAssocChoicesViewKey(null);
    }
    else dispatch(setModalVisible({modal: null}));
  };

  const onMeasurementTypePress = (i) => {
    if (i !== selectedTypeIndex) {
      setSelectedTypeIndex(i);
      formRef.current?.resetForm();
      const typeObj = MEASUREMENT_TYPES[i];
      formRef.current?.setFieldValue('type', MEASUREMENT_KEYS.PLANAR_LINEAR ? MEASUREMENT_KEYS.PLANAR : typeObj.key,);
      const formType = typeObj.form_keys[0];
      const formName = [groupKey, formType];
      formRef.current?.setStatus({formName: formName});
      setSurvey(useForm.getSurvey(formName));
      setChoices(useForm.getChoices(formName));
      dispatch(setCompassMeasurementTypes(typeObj.compass_toggles));
    }
  };

  const onSetChoicesViewKey = (key) => {
    setChoicesViewKey(key);
    setAssocChoicesViewKey(null);
  };

  const onSetChoicesAssocViewKey = (key) => {
    setChoicesViewKey(null);
    setAssocChoicesViewKey(key);
  };

  const renderForm = (formProps) => {
    const assocFormName = [groupKey, 'linear_orientation'];
    const assocSurvey = useForm.getSurvey(assocFormName);
    const assocChoices = useForm.getChoices(assocFormName);
    let assocFormProps = JSON.parse(JSON.stringify(formProps));
    assocFormProps.values = {};
    if (MEASUREMENT_TYPES[selectedTypeIndex] && (MEASUREMENT_TYPES[selectedTypeIndex].key === MEASUREMENT_KEYS.PLANAR_LINEAR)) {
      return (
        <React.Fragment>
          <ButtonGroup
            selectedIndex={selectedTypeIndex}
            onPress={onMeasurementTypePress}
            buttons={Object.values(MEASUREMENT_TYPES).map(t => t.add_title)}
            containerStyle={{height: 40, borderRadius: 10}}
            buttonStyle={{padding: 5}}
            selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
            textStyle={{color: PRIMARY_TEXT_COLOR}}
          />
          <AddPlane
            survey={survey}
            choices={choices}
            setChoicesViewKey={onSetChoicesViewKey}
            formName={formProps.status.formName}
            formProps={formProps}
          />
          <LittleSpacer/>
          <AddLine
            survey={assocSurvey}
            choices={assocChoices}
            setChoicesViewKey={onSetChoicesAssocViewKey}
            formName={assocFormName}
            formProps={formProps}
            subkey={'associated_orientation'}
          />
        </React.Fragment>
      );
    }
    else {
      return (
        <React.Fragment>
          <ButtonGroup
            selectedIndex={selectedTypeIndex}
            onPress={onMeasurementTypePress}
            buttons={Object.values(MEASUREMENT_TYPES).map(t => t.add_title)}
            containerStyle={{height: 40, borderRadius: 10}}
            buttonStyle={{padding: 5}}
            selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
            textStyle={{color: PRIMARY_TEXT_COLOR}}
          />
          {MEASUREMENT_TYPES[selectedTypeIndex] && (MEASUREMENT_TYPES[selectedTypeIndex].key === MEASUREMENT_KEYS.PLANAR) && (
            <AddPlane
              survey={survey}
              choices={choices}
              setChoicesViewKey={onSetChoicesViewKey}
              formName={formProps.status.formName}
              formProps={formProps}
            />
          )}
          {MEASUREMENT_TYPES[selectedTypeIndex] && (MEASUREMENT_TYPES[selectedTypeIndex].key === MEASUREMENT_KEYS.LINEAR) && (
            <AddLine
              survey={survey}
              choices={choices}
              setChoicesViewKey={onSetChoicesViewKey}
              formName={formProps.status.formName}
              formProps={formProps}
            />
          )}
        </React.Fragment>
      );
    }
  };

  const renderMeasurementModalContent = () => {
    const typeObj = MEASUREMENT_TYPES.find(t => equalsIgnoreOrder(t.compass_toggles, compassMeasurementTypes));
    const formName = [groupKey, typeObj.form_keys[0]];
    return (
      <Modal
        close={onCloseButton}
        buttonTitleRight={(choicesViewKey || assocChoicesViewKey) && 'Done'}
        onPress={props.onPress}
      >
        <React.Fragment>
          <FlatList
            bounces={false}
            ListHeaderComponent={
              <Formik
                innerRef={formRef}
                initialValues={{}}
                onSubmit={(values) => console.log('Submitting form...', values)}
                validate={(values) => useForm.validateForm({formName: formName, values: values})}
                validateOnChange={false}
                children={(formProps) => choicesViewKey ? renderSubform(formProps)
                  : assocChoicesViewKey ? renderSubformAssoc(formProps) : renderForm(formProps)}
              />
            }
          />
          {!choicesViewKey && !assocChoicesViewKey && (
            <SaveButton title={'Save ' + typeObj.save_title} onPress={saveMeasurement}/>
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
    try {
      await formRef.current.submitForm();
      const editedMeasurementData = useForm.showErrors(formRef.current);
      let editedMeasurementsData = spot.properties.orientation_data
        ? JSON.parse(JSON.stringify(spot.properties.orientation_data)) : [];
      if (editedMeasurementData.associated_orientation) editedMeasurementData.associated_orientation.id = getNewId();
      editedMeasurementsData.push({...editedMeasurementData, id: getNewId()});
      console.log('editedMeasurementData', editedMeasurementData);
      console.log('Saving Measurement data to Spot ...');
      // dispatch(editedSpotProperties({field: 'orientation_data', value: editedMeasurementsData}));
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  if (Platform.OS === 'android') return renderMeasurementModalContent();
  else return <DragAnimation>{renderMeasurementModalContent()}</DragAnimation>;
};

export default AddMeasurementModal;
