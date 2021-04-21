import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Alert, FlatList, Platform, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ButtonGroup, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import {PRIMARY_TEXT_COLOR, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import Modal from '../../shared/ui/modal/Modal';
import Slider from '../../shared/ui/Slider';
import uiStyles from '../../shared/ui/ui.styles';
import {TextInputField, useFormHook} from '../form';
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

    const formName = ['general', 'sample'];
    // Keys of fields to display in order
    const keys = ['sample_id_name', 'label', 'sample_description', 'inplaceness_of_sample', 'oriented_sample', 'sample_notes'];

    const survey = useForm.getSurvey(formName);
    const choices = useForm.getChoices(formName);
    const fields = keys.map(k => survey.find(f => f.name === k));
    const inplacenessChoices = useForm.getChoicesByKey(survey, choices, 'inplaceness_of_sample').reverse();

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

    const renderField = (f) => {
      if (['sample_id_name', 'label', 'sample_description', 'sample_notes'].includes(f.name)) {
        return (
          <ListItem containerStyle={commonStyles.listItemFormField}>
            <ListItem.Content>
              <Field
                component={TextInputField}
                name={f.name}
                label={f.label}
                key={f.name}
                appearance={f.appearance}
              />
            </ListItem.Content>
          </ListItem>
        );
      }
      else if (f.name === 'inplaceness_of_sample') {
        return (
          <React.Fragment>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <ListItem.Title
                  style={{...commonStyles.listItemTitle, fontWeight: 'bold'}}>
                  {fields[3].label}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
            <View
              style={{backgroundColor: SECONDARY_BACKGROUND_COLOR, paddingLeft: 10, paddingRight: 10}}>
              <Slider
                onSlidingComplete={(value) => formRef.current?.setFieldValue(fields[3].name,
                  inplacenessChoices.map(c => c.name)[value])}
                value={inplacenessChoices.map(c => c.name).indexOf(formRef.current?.values[fields[3].name]) || undefined}
                step={1}
                minimumValue={0}
                maximumValue={4}
                labels={['Float', 'In Place']}
              />
            </View>
          </React.Fragment>
        );
      }
      else if (f.name === 'oriented_sample') {
        return (
          <ButtonGroup
            selectedIndex={formRef.current?.values[fields[4].name] === 'yes' ? 0
              : formRef.current?.values[fields[4].name] === 'no' ? 1
                : undefined}
            onPress={(i) => formRef.current?.setFieldValue([fields[4].name], i === 0 ? 'yes' : 'no')}
            buttons={['Oriented', 'Unoriented']}
            containerStyle={{height: 40, borderRadius: 10}}
            buttonStyle={{padding: 5}}
            textStyle={{color: PRIMARY_TEXT_COLOR}}
          />
        );
      }
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
                <FlatList
                  bounces={false}
                  keyExtractor={(item) => item.name}
                  data={fields}
                  renderItem={({item}) => renderField(item)}
                  ItemSeparatorComponent={FlatListItemSeparator}
                />
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
