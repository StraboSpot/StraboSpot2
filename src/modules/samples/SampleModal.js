import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Alert, Platform, View} from 'react-native';

import {Formik} from 'formik';
import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_TEXT_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {Form, FormSlider, useFormHook} from '../form';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import useMapsHook from '../maps/useMaps';
import {updatedProject} from '../project/projects.slice';
import {editedSpotProperties} from '../spots/spots.slice';

const SampleModal = (props) => {
    const dispatch = useDispatch();
    const modalVisible = useSelector(state => state.home.modalVisible);
    const preferences = useSelector(state => state.project.project.preferences) || {};
    const spot = useSelector(state => state.spot.selectedSpot);

    const [useMaps] = useMapsHook();
    const [useForm] = useFormHook();

    const [namePrefix, setNamePrefix] = useState(null);
    const [startingNumber, setStartingNumber] = useState(null);

    const formRef = useRef(null);

    const formName = ['general', 'samples'];

    // Relevant keys for quick-entry modal
    const firstKeys = ['sample_id_name', 'label', 'sample_description'];
    const inplacenessKey = 'inplaceness_of_sample';
    const orientedKey = 'oriented_sample';
    const lastKeys = ['sample_notes'];

    // Relevant fields for quick-entry modal
    const survey = useForm.getSurvey(formName);
    const choices = useForm.getChoices(formName);
    const firstKeysFields = firstKeys.map(k => survey.find(f => f.name === k));
    const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));

    useLayoutEffect(() => {
      return () => confirmLeavePage();
    }, []);

    useEffect(() => {
      console.log('UE SamplesModal Updating Default Sample Name on Spot Changed...');
      setNamePrefix(preferences.sample_prefix || 'Unnamed');
      setStartingNumber(preferences.starting_sample_number || (spot.properties?.samples?.length + 1) || 1);
    }, [spot]);

    const confirmLeavePage = () => {
      if (formRef.current && formRef.current.dirty) {
        const formCurrent = formRef.current;
        Alert.alert('Unsaved Changes',
          'Would you like to save your sample before continuing?',
          [
            {
              text: 'No',
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => saveForm(formCurrent),
            },
          ],
          {cancelable: false},
        );
      }
    };

    const onOrientedButtonPress = (i) => {
      if (i === 0 && formRef.current?.values[orientedKey] === 'yes') {
        formRef.current?.setFieldValue(orientedKey, undefined);
      }
      else if (i === 0) formRef.current?.setFieldValue(orientedKey, 'yes');
      else if (i === 1 && formRef.current?.values[orientedKey] === 'no') {
        formRef.current?.setFieldValue(orientedKey, undefined);
      }
      else formRef.current?.setFieldValue(orientedKey, 'no');
    };

    const renderForm = (formProps) => {
      return (
        <React.Fragment>
          <Form {...{
            formName: props.formName,
            surveyFragment: firstKeysFields,
            ...props.formProps,
          }}
          />
          <FormSlider {...{
            fieldKey: inplacenessKey,
            formRef: formRef,
            survey: survey,
            choices: choices,
            labels: ['In Place', 'Float'],
            ...formProps,
          }}
          />
          <ButtonGroup
            selectedIndex={formRef.current?.values[orientedKey] === 'yes' ? 0
              : formRef.current?.values[orientedKey] === 'no' ? 1
                : undefined}
            onPress={onOrientedButtonPress}
            buttons={['Oriented', 'Unoriented']}
            containerStyle={{height: 40, borderRadius: 10}}
            buttonStyle={{padding: 5}}
            textStyle={{color: PRIMARY_TEXT_COLOR}}
          />
          <Form {...{
            formName: props.formName,
            surveyFragment: lastKeysFields,
            ...props.formProps,
          }}
          />
        </React.Fragment>
      );
    };

    const renderSamplesModal = () => {
      return (
        <Modal
          close={() => dispatch(setModalVisible({modal: null}))}
          textStyle={{fontWeight: 'bold'}}
          onPress={props.onPress}
          style={props.type === MODALS.NOTEBOOK_MODALS.SAMPLE ? uiStyles.modalPosition : uiStyles.modalPositionShortcutView}
        >
          <React.Fragment>
            <Formik
              innerRef={formRef}
              initialValues={{sample_id_name: namePrefix + startingNumber, inplaceness_of_sample: '5___definitely'}}
              onSubmit={(values) => console.log('Submitting form...', values)}
              enableReinitialize={true}
            >
              {(formProps) => (
                <View style={{flex: 1}}>
                  {renderForm(formProps)}
                </View>
              )}
            </Formik>
            <SaveButton title={'Save Sample'} onPress={() => saveForm(formRef.current)}/>
          </React.Fragment>
        </Modal>
      );
    };

    const saveForm = async (currentForm) => {
      if (modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE) {
        const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
        console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
      }
      let newSample = currentForm.values;
      newSample.id = getNewId();
      const samples = spot.properties?.samples ? [...spot.properties.samples, newSample] : [newSample];
      dispatch(editedSpotProperties({field: 'samples', value: samples}));

      const updatedPreferences = {
        ...preferences,
        sample_prefix: namePrefix,
        starting_sample_number: startingNumber + 1,
      };
      dispatch(updatedProject({field: 'preferences', value: updatedPreferences}));
      await currentForm.resetForm();
    };

    if (Platform.OS === 'android') return renderSamplesModal();
    else return <DragAnimation>{renderSamplesModal()}</DragAnimation>;
  }
;

export default SampleModal;
