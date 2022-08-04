import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty, toTitleCase} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {Form, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {editedSpotProperties} from '../spots/spots.slice';
import AddOther from './AddOther';
import AddTensor from './AddTensor';
import {AddFold, FoldGeometryChoices} from './fold-geometry';
import {THREE_D_STRUCTURE_TYPES} from './threeDStructures.constants';

const AddThreeDStructureModal = (props) => {
  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [survey, setSurvey] = useState({});
  const [choices, setChoices] = useState({});
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  const types = Object.values(THREE_D_STRUCTURE_TYPES);
  const groupKey = '_3d_structures';

  useEffect(() => {
    console.log('UE AddThreeDStructureModal []');
    return () => dispatch(setModalValues({}));
  }, []);

  useEffect(() => {
    console.log('UE AddThreeDStructureModal [modalValues]', modalValues);
    const initialValues = isEmpty(modalValues) ? {id: getNewId(), type: THREE_D_STRUCTURE_TYPES.FOLD} : modalValues;
    formRef.current?.setValues(initialValues);
    setSelectedTypeIndex(types.indexOf(initialValues.type));
    const formName = [groupKey, initialValues.type];
    formRef.current?.setStatus({formName: formName});
    setSurvey(useForm.getSurvey(formName));
    setChoices(useForm.getChoices(formName));
  }, [modalValues]);

  const on3DStructureTypePress = (i) => {
    if (i !== selectedTypeIndex) {
      setSelectedTypeIndex(i);
      formRef.current?.resetForm();
      const type = types[i];
      formRef.current?.setFieldValue('type', type);
      const formName = [groupKey, type];
      formRef.current?.setStatus({formName: formName});
      setSurvey(useForm.getSurvey(formName));
      setChoices(useForm.getChoices(formName));
    }
  };

  const renderForm = (formProps) => {
    if (formProps && formProps.status && formProps.status.formName) {
      return (
        <React.Fragment>
          <ButtonGroup
            selectedIndex={selectedTypeIndex}
            onPress={on3DStructureTypePress}
            buttons={Object.values(THREE_D_STRUCTURE_TYPES).map(v => toTitleCase(v))}
            containerStyle={{height: 40, borderRadius: 10}}
            buttonStyle={{padding: 5}}
            selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
            textStyle={{color: PRIMARY_TEXT_COLOR}}
          />
          {types[selectedTypeIndex] === THREE_D_STRUCTURE_TYPES.FOLD && (
            <AddFold
              survey={survey}
              choices={choices}
              setChoicesViewKey={setChoicesViewKey}
              formName={formProps.status.formName}
              formProps={formProps}
            />
          )}
          {types[selectedTypeIndex] === THREE_D_STRUCTURE_TYPES.TENSOR && (
            <AddTensor
              survey={survey}
              choices={choices}
              setChoicesViewKey={setChoicesViewKey}
              formName={formProps.status.formName}
              formProps={formProps}
            />
          )}
          {types[selectedTypeIndex] === THREE_D_STRUCTURE_TYPES.OTHER && (
            <AddOther
              survey={survey}
              choices={choices}
              setChoicesViewKey={setChoicesViewKey}
              formName={formProps.status.formName}
              formProps={formProps}
            />
          )}
        </React.Fragment>
      );
    }
  };

  const renderNotebookThreeDStructureModalContent = () => {
    const formName = [groupKey, types[selectedTypeIndex]];
    return (
      <Modal
        close={() => choicesViewKey ? setChoicesViewKey(null) : dispatch(setModalVisible({modal: null}))}
        buttonTitleRight={choicesViewKey && 'Done'}
        onPress={props.onPress}
      >
        <React.Fragment>
          <FlatList
            bounces={false}
            ListHeaderComponent={
              <View style={{flex: 1}}>
                <Formik
                  innerRef={formRef}
                  initialValues={{}}
                  onSubmit={values => console.log('Submitting form...', values)}
                  validate={values => useForm.validateForm({formName: formName, values: values})}
                  validateOnChange={false}
                >
                  {formProps => (
                    <View style={{flex: 1}}>
                      {choicesViewKey ? renderSubform(formProps) : renderForm(formProps)}
                    </View>
                  )}
                </Formik>
              </View>
            }
          />
        </React.Fragment>
        {!choicesViewKey && <SaveButton title={'Save 3D Structure'} onPress={save3DStructure}/>}
      </Modal>
    );
  };

  const renderSubform = (formProps) => {
    if (choicesViewKey === 'fold_geometry') {
      return <FoldGeometryChoices formProps={formProps} survey={survey} choices={choices}/>;
    }
    else {
      let relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
      if (formProps.values.type === 'other' && choicesViewKey === 'feature_type') {
        relevantFields = [survey.find(f => f.name === choicesViewKey)];
      }
      return (
        <Form {...{formName: [groupKey, formRef.current?.values?.type], surveyFragment: relevantFields, ...formProps}}/>
      );
    }
  };

  const save3DStructure = async () => {
    try {
      await formRef.current.submitForm();
      const edited3DStructureData = useForm.showErrors(formRef.current);
      console.log('Saving 3D Structure data to Spot ...');
      let edited3DStructuresData = spot.properties[groupKey] ? JSON.parse(JSON.stringify(spot.properties[groupKey]))
        : [];
      edited3DStructuresData.push({...edited3DStructureData, id: getNewId()});
      dispatch(editedSpotProperties({field: groupKey, value: edited3DStructuresData}));
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  if (Platform.OS === 'android') return renderNotebookThreeDStructureModalContent();
  else return <DragAnimation>{renderNotebookThreeDStructureModalContent()}</DragAnimation>;
};

export default AddThreeDStructureModal;
