import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {Button, ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_ACCENT_COLOR, PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {Form, useFormHook} from '../form';
import {setModalValues} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import MineralsByRockClass from './MineralsByRockClass';
import MineralsGlossary from './MineralsGlossary';
import usePetrologyHook from './usePetrology';

const AddMineralModal = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [choicesViewKey, setChoicesViewKey] = useState(null);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(null);

  const formRef = useRef(null);

  const [useForm] = useFormHook();
  const usePetrology = usePetrologyHook();

  const [initialValues, setInitialValues] = useState({id: getNewId()});
  const petKey = PAGE_KEYS.MINERALS;
  const formName = ['pet', petKey];
  const survey = useForm.getSurvey(formName);

  useEffect(() => {
    return () => dispatch(setModalValues({}));
  }, []);

  const addMineralFromGlossary = (mineralInfo) => {
    setInitialValues({id: getNewId(), mineral_abbrev: mineralInfo.Abbreviation, full_mineral_name: mineralInfo.Label});
    setSelectedTypeIndex(null);
  };

  const onViewTypePress = (i) => {
    if (selectedTypeIndex === i) setSelectedTypeIndex(null);
    else setSelectedTypeIndex(i);
  };

  const renderAddMineralModalContent = () => {
    return (
      <Modal>
        <ButtonGroup
          selectedIndex={selectedTypeIndex}
          onPress={onViewTypePress}
          buttons={['Look up by\nRock Class', 'Look up in\nGlossary']}
          containerStyle={{height: 45, borderRadius: 10}}
          buttonStyle={{padding: 5}}
          textStyle={{color: PRIMARY_TEXT_COLOR}}
        />
        {isEmpty(selectedTypeIndex) && renderForms()}
        {selectedTypeIndex === 0 && <MineralsByRockClass/>}
        {selectedTypeIndex === 1 && <MineralsGlossary addMineral={addMineralFromGlossary}/>}
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
            formName: formName,
            onMyChange: (name, value) => usePetrology.onMineralChange(formRef.current, name, value),
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
        {choicesViewKey ? renderDoneButton() : renderSaveButton()}
      </React.Fragment>
    );
  };

  const renderSaveButton = () => (
    <SaveButton
      title={'Save Mineral'}
      onPress={saveMineral}
    />
  );

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
