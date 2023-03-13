import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {Form, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {updatedModifiedTimestampsBySpotId} from '../project/projects.slice';
import {editedSpotProperties} from '../spots/spots.slice';
import {FABRIC_TYPES} from './fabric.constants';
import FaultRockFabric from './FaultRockFabric';
import IgneousRockFabric from './IgneousRockFabric';
import MetamRockFabric from './MetamRockFabric';

const AddFabricModal = (props) => {
  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);
  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [survey, setSurvey] = useState({});
  const [choices, setChoices] = useState({});

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  const types = Object.keys(FABRIC_TYPES);
  const groupKey = 'fabrics';

  useEffect(() => {
    console.log('UE AddFabricModal []');
    return () => dispatch(setModalValues({}));
  }, []);

  useEffect(() => {
    console.log('UE AddFabricModal [modalValues]', modalValues);
    const initialValues = isEmpty(modalValues) ? {id: getNewId(), type: 'fault_rock'} : modalValues;
    formRef.current?.setValues(initialValues);
    setSelectedTypeIndex(types.indexOf(initialValues.type));
    const formName = [groupKey, initialValues.type];
    formRef.current?.setStatus({formName: formName});
    setSurvey(useForm.getSurvey(formName));
    setChoices(useForm.getChoices(formName));
  }, [modalValues]);

  const onFabricTypePress = (i) => {
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
    return (
      <React.Fragment>
        <ButtonGroup
          selectedIndex={selectedTypeIndex}
          onPress={onFabricTypePress}
          buttons={Object.values(FABRIC_TYPES)}
          containerStyle={{height: 40, borderRadius: 10}}
          buttonStyle={{padding: 5}}
          selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
          textStyle={{color: PRIMARY_TEXT_COLOR}}
        />
        {types[selectedTypeIndex] === 'fault_rock' && (
          <FaultRockFabric
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={formProps.status.formName}
            formProps={formProps}
          />
        )}
        {types[selectedTypeIndex] === 'igneous_rock' && (
          <IgneousRockFabric
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={formProps.status.formName}
            formProps={formProps}
          />
        )}
        {types[selectedTypeIndex] === 'metamorphic_rock' && (
          <MetamRockFabric
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={formProps.status.formName}
            formProps={formProps}
          />
        )}
      </React.Fragment>
    );
  };

  const renderNotebookFabricModalContent = () => {
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
        {!choicesViewKey && <SaveButton title={'Save Fabric'} onPress={saveFabric}/>}
      </Modal>
    );
  };

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return (
      <Form {...{formName: [groupKey, formRef.current?.values?.type], surveyFragment: relevantFields, ...formProps}}/>
    );
  };

  const saveFabric = async () => {
    try {
      await formRef.current.submitForm();
      const editedFabricData = useForm.showErrors(formRef.current);
      console.log('Saving fabic data to Spot ...');
      let editedFabricsData = spot.properties.fabrics ? JSON.parse(JSON.stringify(spot.properties.fabrics)) : [];
      editedFabricsData.push({...editedFabricData, id: getNewId()});
      dispatch(editedSpotProperties({field: groupKey, value: editedFabricsData}));
      dispatch(updatedModifiedTimestampsBySpotId(spot.properties.id));
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  if (Platform.OS === 'android') return renderNotebookFabricModalContent();
  else return <DragAnimation>{renderNotebookFabricModalContent()}</DragAnimation>;
};

export default AddFabricModal;
