import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {Form, useFormHook} from '../form';
import {setModalValues} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import usePetrologyHook from './usePetrology';

const AddRockModal = (props) => {
  const dispatch = useDispatch();
  const modalValues = useSelector(state => state.home.modalValues);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [survey, setSurvey] = useState({});
  const [choices, setChoices] = useState({});

  const formRef = useRef(null);

  const [useForm] = useFormHook();
  const usePetrology = usePetrologyHook();

  const petKey = props.modalKey === PAGE_KEYS.ROCK_TYPE_IGNEOUS ? modalValues.igneous_rock_class || 'plutonic'
    : props.modalKey;

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
      <Modal>
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
        {choicesViewKey ? renderDoneButton() : renderSaveButton()}
      </Modal>
    );
  };

  const renderDoneButton = () => (
    <Button
      titleStyle={{color: PRIMARY_ACCENT_COLOR}}
      title={'Done'}
      type={'save'}
      onPress={() => setChoicesViewKey(null)}
    />
  );

  const renderForm = (formProps) => {
    return (
      <React.Fragment>
        <Form
          {...{
            formName: ['pet', petKey],
            ...formProps,
          }}
        />
      </React.Fragment>
    );
  };

  const renderSaveButton = () => (
    <SaveButton
      title={'Save Rock'}
      onPress={saveRock}
    />
  );

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
