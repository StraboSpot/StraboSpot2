import React, {useEffect, useState} from 'react';

import {ButtonGroup} from 'react-native-elements';

import {getNewId, isEmpty} from '../../shared/Helpers';
import {PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import {Form, MainButtons, useFormHook} from '../form';
import {IGNEOUS_ROCK_TYPES} from './petrology.constants';

const AddRockIgneousModal = (props) => {
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [formName, setFormName] = useState([]);

  const [useForm] = useFormHook();

  const types = Object.keys(IGNEOUS_ROCK_TYPES);

  useEffect(() => {
    const type = props.formName[1];
    setSelectedTypeIndex(types.indexOf(type));
    setFormName(props.formName);
  }, []);

  const onIgneousRockTypePress = (i) => {
    if (i !== selectedTypeIndex) {
      setSelectedTypeIndex(i);
      props.formRef.current?.resetForm();
      const type = types[i];
      props.setPetKey(type);
      const formNameSwitched = ['pet', type];
      props.formRef.current?.setValues({id: getNewId(), igneous_rock_class: type});
      setFormName(formNameSwitched);
      props.setSurvey(useForm.getSurvey(formNameSwitched));
      props.setChoices(useForm.getChoices(formNameSwitched));
    }
  };

  const renderSpecificIgneousRock = () => {
    // Relevant keys for quick-entry modal
    let firstKeys, mainButttonsKeys, lastKeys;
    if (types[selectedTypeIndex] === 'plutonic') {
      firstKeys = ['plutonic_rock_type'];
      mainButttonsKeys = ['occurence_plutonic', 'texture_plutonic', 'color_index_pluton', 'alteration_plutonic'];
      lastKeys = ['pluton_characteristic_size_of', 'notes_plutonic'];
    }
    else {
      firstKeys = ['volcanic_rock_type'];
      mainButttonsKeys = ['occurence_volcanic', 'texture_volcanic', 'color_index_volc', 'alteration_volcanic'];
      lastKeys = ['vol_characteristic_size_of_cry', 'notes_volcanic'];
    }

    // Relevant fields for quick-entry modal
    const lastKeysFields = lastKeys.map(k => props.survey.find(f => f.name === k)).filter(k => !isEmpty(k));

    return (
      <React.Fragment>
        <MainButtons {...{
          mainKeys: firstKeys,
          formName: formName,
          formRef: props.formRef,
          setChoicesViewKey: props.setChoicesViewKey,
        }}/>
        <MainButtons {...{
          mainKeys: mainButttonsKeys,
          formName: formName,
          formRef: props.formRef,
          setChoicesViewKey: props.setChoicesViewKey,
        }}/>
        {!isEmpty(lastKeysFields) && (
          <Form {...{
            surveyFragment: lastKeysFields,
            ...props.formProps,
          }}/>
        )}
      </React.Fragment>
    );
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
      {!isEmpty(props.survey) && renderSpecificIgneousRock()}
    </React.Fragment>
  );
};

export default AddRockIgneousModal;
