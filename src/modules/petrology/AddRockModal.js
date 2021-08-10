import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {Form, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import AddRockIgneousModal from './AddRockIgneousModal';
import usePetrologyHook from './usePetrology';

const AddRockModal = (props) => {
  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [survey, setSurvey] = useState({});
  const [choices, setChoices] = useState({});
  const [petKey, setPetKey] = useState(
    props.modalKey === PAGE_KEYS.ROCK_TYPE_IGNEOUS ? modalValues.igneous_rock_class || 'plutonic'
      : props.modalKey);
  const formRef = useRef(null);

  const [useForm] = useFormHook();
  const usePetrology = usePetrologyHook();


  useEffect(() => {
    return () => dispatch(setModalValues({}));
  }, []);

  useEffect(() => {
    const initialValues = !isEmpty(modalValues) ? modalValues
      : props.modalKey === PAGE_KEYS.ROCK_TYPE_IGNEOUS ? {id: getNewId(), igneous_rock_class: petKey}
        : {id: getNewId()};
    formRef.current?.setValues(initialValues);
    const formName = ['pet', petKey];
    setSurvey(useForm.getSurvey(formName));
    setChoices(useForm.getChoices(formName));
  }, [modalValues]);

  const renderAddRockModalContent = () => {
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
                  onSubmit={(values) => console.log('Submitting form...', values)}
                >
                  {(formProps) => (
                    <View style={{flex: 1}}>
                      {choicesViewKey ? renderSubform(formProps) : renderForm(formProps)}
                    </View>
                  )}
                </Formik>
              </View>
            }
          />
        </React.Fragment>
        {!choicesViewKey && <SaveButton title={'Save Rock'} onPress={saveRock}/>}
      </Modal>
    );
  };

  const renderForm = (formProps) => {
    return (
      <React.Fragment>
        {props.modalKey === PAGE_KEYS.ROCK_TYPE_IGNEOUS && (
          <AddRockIgneousModal
            formRef={formRef}
            survey={survey}
            choices={choices}
            setChoicesViewKey={setChoicesViewKey}
            formName={['pet', petKey]}
            formProps={formProps}
            setPetKey={setPetKey}
            setSurvey={setSurvey}
            setChoices={setChoices}
          />
        )}
        {props.modalKey !== PAGE_KEYS.ROCK_TYPE_IGNEOUS && (
          <Form
            {...{
              formName: ['pet', petKey],
              ...formProps,
            }}
          />
        )}
      </React.Fragment>
    );
  };

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return (
      <Form
        {...{
          formName: ['pet', petKey],
          surveyFragment: relevantFields, ...formProps,
        }}
      />
    );
  };

  const saveRock = () => {
    usePetrology.savePetFeature(props.modalKey, spot, formRef.current);
    dispatch(setModalValues({...formRef.current.values, id: getNewId()}));
  };

  if (Platform.OS === 'android') return renderAddRockModalContent();
  else return <DragAnimation>{renderAddRockModalContent()}</DragAnimation>;
};

export default AddRockModal;
