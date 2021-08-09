import React, {useEffect, useState} from 'react';

import {ButtonGroup} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {getNewId} from '../../shared/Helpers';
import {PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import {Form, useFormHook} from '../form';
import {setModalValues} from '../home/home.slice';
import {IGNEOUS_ROCK_TYPES} from './petrology.constants';

const AddRockIgneousModal = (props) => {
  const dispatch = useDispatch();

  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);
  const [formName, setFormName] = useState(props.formName);
  const [survey, setSurvey] = useState(props.survey);
  const [choices, setChoices] = useState(props.choices);

  const [useForm] = useFormHook();

  const types = Object.keys(IGNEOUS_ROCK_TYPES);

  useEffect(() => {
    const type = props.formName[1];
    setSelectedTypeIndex(types.indexOf(type));
    return () => dispatch(setModalValues({}));
  }, []);

  const onIgneousRockTypePress = (i) => {
    if (i !== selectedTypeIndex) {
      setSelectedTypeIndex(i);
      const type = types[i];
      props.formRef.current?.resetForm();
      props.formRef.current?.setFieldValue('id', getNewId());
      props.formRef.current?.setFieldValue('igneous_rock_class', type);
      const formNameSwitched = ['pet', type];
      setFormName(formNameSwitched);
      props.setPetKey(formNameSwitched);
      setSurvey(useForm.getSurvey(formNameSwitched));
      setChoices(useForm.getChoices(formNameSwitched));
    }
  };

  return (
    <React.Fragment>
      <ButtonGroup
        selectedIndex={selectedTypeIndex}
        onPress={onIgneousRockTypePress}
        buttons={Object.values(IGNEOUS_ROCK_TYPES)}
        containerStyle={{height: 40, borderRadius: 10}}
        buttonStyle={{padding: 5}}
        textStyle={{color: PRIMARY_TEXT_COLOR}}
      />
      <Form
        {...{
          formRef: props.formRef,
          formName: formName,
          survey: survey,
          choices: choices,
          setChoicesViewKey: props.setChoicesViewKey,
          ...props.formProps,
        }}
      />
    </React.Fragment>
  );
};

export default AddRockIgneousModal;
