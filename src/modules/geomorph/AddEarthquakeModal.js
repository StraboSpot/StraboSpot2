import React, {useEffect, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import {getNewUUID} from '../../shared/Helpers';
import SaveButton from '../../shared/SaveButton';
import LittleSpacer from '../../shared/ui/LittleSpacer';
import Modal from '../../shared/ui/modal/Modal';
import {Form, FormSlider, MainButtons, useFormHook} from '../form';
import {setModalValues, setModalVisible} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotProperties} from '../spots/spots.slice';

const AddEarthquakeModal = ({onPress}) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [choicesViewKey, setChoicesViewKey] = useState(null);

  const formRef = useRef(null);
  const useForm = useFormHook();

  const groupKey = 'general';
  const pageKey = PAGE_KEYS.EARTHQUAKES;
  const formName = [groupKey, pageKey];

  // Relevant keys for quick-entry modal
  const mainButttonsKeys = ['earthquake_feature', 'liquefaction_area_affected', 'date_of_movement',
    'time_of_movement', 'landslide_feat', 'slide_type', 'material_type', 'slope_movement_area_affected',
    'cause_of_damage', 'date_of_damage', 'time_of_damage', 'utility_affected', 'facility_affected', 'damage_severity',
    'rupture_expression', 'mode_of_observation', 'fault_slip_meas'];
  const confidenceInFeatureIdKey = 'confidence_in_feature_id';
  const lastKeys = ['diameter_m', 'height_of_material_m', 'max_vert_movement_m', 'est_dir_of_slope_m',
    'displacement_amt_cm', 'depth_m', 'max_drop_in_elevation_m', 'length_exposed_downslope_m', 'slip_preferred_cm',
    'slip_min_cm', 'slip_max_cm', 'horiz_separation_preferred_cm', 'horiz_separation_min_cm', 'horiz_separation_max_cm',
    'vert_separation_preferred', 'vert_separation_min_cm', 'vertical_separation_max_cm', 'slip_azimuth',
    'heave_preferred_cm', 'heave_min_cm', 'rupture_width_preferred_m', 'rupture_width_min_m', 'rupture_width_max_m',
    'notes'];

  // Relevant fields for quick-entry modal
  const survey = useForm.getSurvey(formName);
  const choices = useForm.getChoices(formName);
  const lastKeysFields = lastKeys.map(k => survey.find(f => f.name === k));


  useEffect(() => {
    console.log('UE AddEarthquakeModal []');
    return () => dispatch(setModalValues({}));
  }, []);

  const renderForm = (formProps) => {
    const mainButttonsKeysRelevant = mainButttonsKeys.filter((k) => {
      const field = survey.find(f => f.name === k);
      return useForm.isRelevant(field, formProps.values);
    });

    return (
      <>
        <LittleSpacer/>
        <MainButtons
          mainKeys={mainButttonsKeysRelevant}
          formName={formName}
          setChoicesViewKey={setChoicesViewKey}
          formProps={formProps}
        />
        <LittleSpacer/>
        <FormSlider
          fieldKey={confidenceInFeatureIdKey}
          formProps={formProps}
          survey={survey}
          choices={choices}
          labels={['Low', 'High']}
        />
        <LittleSpacer/>
        <Form {...{formName: formName, surveyFragment: lastKeysFields, ...formProps}}/>
      </>

    );
  };

  const renderNotebookEarthquakeModal = () => {
    return (
      <Modal
        closeModal={() => choicesViewKey ? setChoicesViewKey(null) : dispatch(setModalVisible({modal: null}))}
        buttonTitleRight={choicesViewKey && 'Done'}
        onPress={onPress}
      >
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
        {!choicesViewKey && <SaveButton title={'Save Earthquake'} onPress={saveEarthquake}/>}
      </Modal>
    );
  };

  const renderSubform = (formProps) => {
    const relevantFields = useForm.getRelevantFields(survey, choicesViewKey);
    return (
      <Form {...{formName: [groupKey, pageKey], surveyFragment: relevantFields, ...formProps}}/>
    );
  };

  const saveEarthquake = async () => {
    try {
      await formRef.current.submitForm();
      const editedEarthquakeData = useForm.showErrors(formRef.current);
      console.log('Saving earthquake data to Spot ...');
      let editedEarthquakesData = spot.properties.earthquakes ? JSON.parse(
        JSON.stringify(spot.properties.earthquakes)) : [];
      editedEarthquakesData.push({...editedEarthquakeData, id: getNewUUID()});
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: pageKey, value: editedEarthquakesData}));
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  return renderNotebookEarthquakeModal();
};

export default AddEarthquakeModal;
