import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import Modal from '../../shared/ui/modal/Modal';
import {ChoiceButtons, Form, MainButtons, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import MineralsByRockClass from './MineralsByRockClass';
import MineralsGlossary from './MineralsGlossary';
import usePetrologyHook from './usePetrology';

const AddMineralModal = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [initialValues, setInitialValues] = useState({id: getNewId()});
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);

  const [useForm] = useFormHook();
  const usePetrology = usePetrologyHook();

  const formRef = useRef(null);

  // Relevant keys for quick-entry modal
  const firstKeys = ['mineral_abbrev', 'full_mineral_name'];
  const igOrMetKey = 'igneous_or_metamorphic';
  const igButttonsKeys = ['habit', 'textural_setting_igneous'];
  const metButttonsKeys = ['habit_met', 'textural_setting_metamorphic'];
  const lastKeys = ['average_grain_size_mm', 'maximum_grain_size_mm', 'modal', 'mineral_notes'];

  // Relevant fields for quick-entry modal
  const petKey = PAGE_KEYS.MINERALS;
  const formName = ['pet', petKey];
  const survey = useForm.getSurvey(formName);
  const choices = useForm.getChoices(formName);
  const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

  useEffect(() => {
    return () => dispatch(setModalValues({}));
  }, []);

  const addMineral = (mineralInfo) => {
    setInitialValues({id: getNewId(), mineral_abbrev: mineralInfo.Abbreviation, full_mineral_name: mineralInfo.Label});
    setSelectedTypeIndex(null);
  };

  const onIgOrMetSelected = (choiceName) => {
    if (formRef.current?.values[igOrMetKey] && formRef.current?.values[igOrMetKey] === choiceName) {
      formRef.current?.setFieldValue(igOrMetKey, undefined);
    }
    else formRef.current?.setFieldValue(igOrMetKey, choiceName);

    // Remove relevant values
    const relevantIgMetFields = useForm.getRelevantFields(survey, igOrMetKey);
    relevantIgMetFields.map(f => {
      if (f.name !== igOrMetKey && formRef.current?.values[f.name]) formRef.current?.setFieldValue(f.name, undefined);
    });
  };

  const onViewTypePress = (i) => {
    if (selectedTypeIndex === i) setSelectedTypeIndex(null);
    else setSelectedTypeIndex(i);
  };

  const renderAddMineralModalContent = () => {
    return (
      <Modal
        close={() => choicesViewKey ? setChoicesViewKey(null) : dispatch(setModalVisible({modal: null}))}
        buttonTitleRight={choicesViewKey && 'Done'}
        onPress={props.onPress}
      >
        {!choicesViewKey && (
          <ButtonGroup
            selectedIndex={selectedTypeIndex}
            onPress={onViewTypePress}
            buttons={['Look up by\nRock Class', 'Look up in\nGlossary']}
            containerStyle={{height: 45, borderRadius: 10}}
            buttonStyle={{padding: 5}}
            textStyle={{color: PRIMARY_TEXT_COLOR}}
          />
        )}
        {isEmpty(selectedTypeIndex) && renderForms()}
        {selectedTypeIndex === 0 && <MineralsByRockClass addMineral={addMineral}/>}
        {selectedTypeIndex === 1 && <MineralsGlossary addMineral={addMineral}/>}
      </Modal>
    );
  };

  const renderForm = (formProps) => {
    return (
      <React.Fragment>
        <Form
          {...{
            formName: formName,
            onMyChange: (name, value) => usePetrology.onMineralChange(formRef.current, name, value),
            surveyFragment: firstKeysFields,
            ...formProps,
          }}
        />
        <LittleSpacer/>
        <ChoiceButtons {...{
          choiceFieldKey: igOrMetKey,
          survey: survey,
          choices: choices,
          formRef: formRef,
          onPress: onIgOrMetSelected,
          size: 'small',
        }}/>
        {!isEmpty(formRef.current?.values[igOrMetKey]) && formRef.current?.values[igOrMetKey] === 'ig_min' && (
          <MainButtons {...{
            mainKeys: igButttonsKeys,
            formName: formName,
            formRef: formRef,
            setChoicesViewKey: setChoicesViewKey,
          }}/>
        )}
        {!isEmpty(formRef.current?.values[igOrMetKey]) && formRef.current?.values[igOrMetKey] === 'met_min' && (
          <MainButtons {...{
            mainKeys: metButttonsKeys,
            formName: formName,
            formRef: formRef,
            setChoicesViewKey: setChoicesViewKey,
          }}/>
        )}
        <LittleSpacer/>
        <Form
          {...{
            formName: formName,
            surveyFragment: lastKeysFields,
            ...formProps,
          }}
        />
      </React.Fragment>
    );
  };

  const renderForms = () => {
    return (
      <React.Fragment>
        <FlatList
          bounces={false}
          ListHeaderComponent={
            <View style={{flex: 1}}>
              <Formik
                innerRef={formRef}
                initialValues={initialValues}
                onSubmit={(values) => console.log('Submitting form...', values)}
                enableReinitialize={true}
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
        {!choicesViewKey && <SaveButton title={'Save Mineral'} onPress={saveMineral}/>}
      </React.Fragment>
    );
  };

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return (
      <Form
        {...{
          formName: formName,
          surveyFragment: relevantFields, ...formProps,
        }}
      />
    );
  };

  const saveMineral = () => {
    usePetrology.savePetFeature(petKey, spot, formRef.current);
    formRef.current?.setFieldValue('id', getNewId());
  };

  if (Platform.OS === 'android') return renderAddMineralModalContent();
  else return <DragAnimation>{renderAddMineralModalContent()}</DragAnimation>;
};

export default AddMineralModal;