import React, {useEffect, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import MineralsByRockClass from './MineralsByRockClass';
import MineralsGlossary from './MineralsGlossary';
import usePetrologyHook from './usePetrology';
import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR, SMALL_TEXT_SIZE} from '../../shared/styles.constants';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import Modal from '../../shared/ui/modal/Modal';
import {ChoiceButtons, Form, MainButtons, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import Templates from '../templates/Templates';

const AddMineralModal = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const templates = useSelector(state => state.project.project?.templates) || {};

  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [initialValues, setInitialValues] = useState({id: getNewId()});
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);
  const [isShowTemplates, setIsShowTemplates] = useState(false);

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

  const areMultipleTemplates = templates[petKey] && templates[petKey].isInUse && templates[petKey].active
    && templates[petKey].active.length > 1;
  let tempValues = {};

  useEffect(() => {
    console.log('UE AddMineralModal [templates]', templates);
    if (templates[petKey] && templates[petKey].isInUse && templates[petKey].active
      && templates[petKey].active[0] && templates[petKey].active[0].values) {
      setInitialValues({...templates[petKey].active[0].values, id: getNewId()});
    }
    return () => dispatch(setModalValues({}));
  }, [templates]);

  const addMineral = (mineralInfo) => {
    setInitialValues({
      ...tempValues,
      id: getNewId(),
      mineral_abbrev: mineralInfo.Abbreviation,
      full_mineral_name: mineralInfo.Label,
    });
    setSelectedTypeIndex(null);
  };

  const onCloseModalPressed = () => {
    if (choicesViewKey) setChoicesViewKey(null);
    else if (isShowTemplates) setIsShowTemplates(false);
    else dispatch(setModalVisible({modal: null}));
  };

  const onIgOrMetSelected = (choiceName) => {
    if (formRef.current?.values[igOrMetKey] && formRef.current?.values[igOrMetKey] === choiceName) {
      formRef.current?.setFieldValue(igOrMetKey, undefined);
    }
    else formRef.current?.setFieldValue(igOrMetKey, choiceName);

    // Remove relevant values
    const relevantIgMetFields = useForm.getRelevantFields(survey, igOrMetKey);
    relevantIgMetFields.map((f) => {
      if (f.name !== igOrMetKey && formRef.current?.values[f.name]) formRef.current?.setFieldValue(f.name, undefined);
    });
  };

  const onViewTypePress = (i) => {
    if (selectedTypeIndex === i) setSelectedTypeIndex(null);
    else setSelectedTypeIndex(i);
  };

  const renderAddMineral = () => {
    tempValues = formRef.current?.values || {};
    return (
      <React.Fragment>
        {!choicesViewKey && !areMultipleTemplates && (
          <ButtonGroup
            selectedIndex={selectedTypeIndex}
            onPress={onViewTypePress}
            buttons={['Look up by Rock Class', 'Look up in Glossary']}
            containerStyle={{height: 50, borderRadius: 10}}
            buttonStyle={{padding: 5}}
            selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
            textStyle={{color: PRIMARY_TEXT_COLOR, fontSize: SMALL_TEXT_SIZE, textAlign: 'center'}}
          />
        )}
        {isEmpty(selectedTypeIndex) && renderForms()}
        {selectedTypeIndex === 0 && <MineralsByRockClass addMineral={addMineral}/>}
        {selectedTypeIndex === 1 && <MineralsGlossary addMineral={addMineral}/>}
      </React.Fragment>
    );
  };

  const renderAddMineralModalContent = () => {
    return (
      <Modal
        close={onCloseModalPressed}
        buttonTitleRight={choicesViewKey ? 'Done' : isShowTemplates ? '' : null}
        onPress={props.onPress}
      >
        {!choicesViewKey && (
          <Templates
            isShowTemplates={isShowTemplates}
            setIsShowTemplates={bool => setIsShowTemplates(bool)}
          />
        )}
        {!isShowTemplates && renderAddMineral()}
      </Modal>
    );
  };

  const renderForm = (formProps) => {
    return (
      <React.Fragment>
        <Form {...{
          formName: formName,
          onMyChange: (name, value) => usePetrology.onMineralChange(formProps, name, value),
          surveyFragment: firstKeysFields,
          ...formProps,
        }}/>
        <LittleSpacer/>
        <ChoiceButtons
          choiceFieldKey={igOrMetKey}
          survey={survey}
          choices={choices}
          onPress={onIgOrMetSelected}
          size={'small'}
          formProps={formProps}
        />
        {!isEmpty(formProps.values[igOrMetKey]) && formProps.values[igOrMetKey] === 'ig_min' && (
          <MainButtons
            mainKeys={igButttonsKeys}
            formName={formName}
            setChoicesViewKey={setChoicesViewKey}
            formProps={formProps}
          />
        )}
        {!isEmpty(formProps.values[igOrMetKey]) && formProps.values[igOrMetKey] === 'met_min' && (
          <MainButtons
            mainKeys={metButttonsKeys}
            formName={formName}
            setChoicesViewKey={setChoicesViewKey}
            formProps={formProps}
          />
        )}
        <LittleSpacer/>
        <Form {...{formName: formName, surveyFragment: lastKeysFields, ...formProps}}/>
      </React.Fragment>
    );
  };

  const renderForms = () => {
    const saveMineralTitle = 'Save Mineral' + (areMultipleTemplates ? 's' : '');
    return (
      <React.Fragment>
        {!areMultipleTemplates && (
          <FlatList
            bounces={false}
            ListHeaderComponent={
              <View style={{flex: 1}}>
                <Formik
                  innerRef={formRef}
                  initialValues={initialValues}
                  onSubmit={values => console.log('Submitting form...', values)}
                  enableReinitialize={true}
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
        )}
        {!choicesViewKey && <SaveButton title={saveMineralTitle} onPress={saveMineral}/>}
      </React.Fragment>
    );
  };

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return <Form {...{formName: formName, surveyFragment: relevantFields, ...formProps}}/>;
  };

  const saveMineral = () => {
    if (areMultipleTemplates) usePetrology.savePetFeatureValuesFromTemplates(petKey, spot, templates[petKey].active);
    else usePetrology.savePetFeature(petKey, spot, formRef.current);
    formRef.current?.setFieldValue('id', getNewId());
  };

  return renderAddMineralModalContent();
};

export default AddMineralModal;
