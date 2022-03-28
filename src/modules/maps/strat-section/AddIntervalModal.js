import React, {useRef} from 'react';
import {Alert, FlatList, Platform} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import DragAnimation from '../../../shared/ui/DragAmination';
import Modal from '../../../shared/ui/modal/Modal';
import {Form, TextInputField, useFormHook} from '../../form';
import {setModalValues, setModalVisible} from '../../home/home.slice';
import {updatedProject} from '../../project/projects.slice';
import useSpotsHook from '../../spots/useSpots';
import useMapsHook from '../useMaps';
import useStratSectionHook from './useStratSection';

const AddIntervalModal = () => {
  const dispatch = useDispatch();
  const preferences = useSelector(state => state.project.project.preferences) || {};
  const stratSection = useSelector(state => state.map.stratSection);

  const [useForm] = useFormHook();
  const [useMaps] = useMapsHook();
  const [useSpots] = useSpotsHook();
  const useStratSection = useStratSectionHook();

  const formRef = useRef(null);
  const nameFormRef = useRef(null);

  const formName = ['sed', 'add_interval'];

  const getInitialValues = () => {
    const initialValues = {};
    if (stratSection.column_profile && stratSection.column_profile === 'clastic') {
      initialValues.interval_type = 'bed';
      initialValues.primary_lithology = 'siliciclastic';
    }
    else if (stratSection.column_profile && stratSection.column_profile === 'carbonate') {
      initialValues.interval_type = 'bed';
    }
    else if (stratSection.column_profile && stratSection.column_profile === 'mixed_clastic') {
      initialValues.interval_type = 'bed';
    }
    else if (stratSection.column_profile && stratSection.column_profile === 'basic_lithologies') {
      initialValues.interval_type = 'bed';
    }
    if (stratSection.column_y_axis_units) {
      initialValues.thickness_units = stratSection.column_y_axis_units;
      initialValues.package_thickness_units = stratSection.column_y_axis_units;
      initialValues.interbed_thickness_units = stratSection.column_y_axis_units;
    }

    // Testing Data
    /*      vm.intervalName = 'Interval Inserting';
     initialValues.interval_thickness = 2;
     // initialValues.character = 'bed';
     initialValues.primary_lithology = 'volcaniclastic';
     initialValues.interval_type = 'interbedded';
     //   initialValues.siliciclastic_type = 'claystone';
     initialValues.primary_lithology_1 = 'chert';
     initialValues.interbed_proportion = 30;
     initialValues.interbed_proportion_change = 'no_change';
     initialValues.avg_thickness = 5;
     initialValues.avg_thickness_1 = 8;*/

    return initialValues;
  };

  const close = () => {
    dispatch(setModalValues({}));
    dispatch(setModalVisible({modal: null}));
  };

  const doUnitsFieldsMatch = (data) => {
    if (stratSection.column_y_axis_units) {
      const unitsFields = ['thickness_units', 'interbed_thickness_units', 'package_thickness_units'];
      const mismatchUnitsField = unitsFields.find((unitsField) => {
        return data[unitsField] && stratSection.column_y_axis_units !== data[unitsField];
      });
      if (mismatchUnitsField) {
        Alert.alert(
          'Units Mismatch',
          'The units for the Y Axis are ' + stratSection.column_y_axis_units + ' but '
          + data[mismatchUnitsField] + ' have been designated for '
          + useForm.getLabel(mismatchUnitsField, formName) + '. Please fix the units for '
          + useForm.getLabel(mismatchUnitsField, formName) + '. Unit conversions may be added to a'
          + ' future version of the app.',
        );
        return false;
      }
    }
    return true;
  };

  const renderAddIntervalNameField = () => {
    const initialIntervalName = {
      intervalName: (preferences.spot_prefix || '') + (preferences.starting_number_for_spot || ''),
    };
    return (
      <Formik
        initialValues={initialIntervalName}
        onSubmit={() => console.log('Submitting form...')}
        innerRef={nameFormRef}
        enableReinitialize={false}
      >
        {() => (
          <ListItem containerStyle={commonStyles.listItemFormField}>
            <ListItem.Content>
              <Field
                component={TextInputField}
                name={'intervalName'}
                label={'Interval Name'}
                key={'intervalName'}
              />
            </ListItem.Content>
          </ListItem>
        )}
      </Formik>
    );
  };

  const renderAddIntervalFormFields = () => {
    return (
      <Formik
        innerRef={formRef}
        onSubmit={() => console.log('Submitting form...')}
        onReset={() => console.log('Resetting form...')}
        validate={(values) => useForm.validateForm({formName: formName, values: values})}
        children={(formProps) => <Form {...{...formProps, formName: formName}}/>}
        initialValues={getInitialValues()}
        initialStatus={{formName: formName}}
        enableReinitialize={false}
      />
    );
  };

  const renderAddIntervalModal = () => {
    return (
      <Modal
        title={'Add Interval'}
        buttonTitleLeft={'Cancel'}
        buttonTitleRight={'Save'}
        cancel={() => close()}
        close={() => saveInterval(formRef?.current?.values)}
      >
        <FlatList
          ListHeaderComponent={renderAddIntervalNameField()}
          ListFooterComponent={renderAddIntervalFormFields()}
        />
      </Modal>
    );
  };

  const saveInterval = async () => {
    await formRef.current.submitForm();
    const intervalData = useForm.showErrors(formRef.current);
    if (doUnitsFieldsMatch(intervalData)) {
      const newInterval = useStratSection.createInterval(stratSection.strat_section_id, intervalData);
      if (nameFormRef.current?.values?.intervalName) newInterval.properties.name = nameFormRef.current.values.intervalName;
      // if (vm.intervalToCopy && vm.intervalToCopy.properties && vm.intervalToCopy.properties.sed) {
      //   newInterval = copyRestOfInterval(newInterval);
      // }
      const newSpot = await useSpots.createSpot({type: 'Feature', ...newInterval});
      useMaps.setSelectedSpotOnMap(newSpot);
      dispatch(setModalValues({}));
      dispatch(setModalVisible({modal: null}));
      if (preferences.starting_number_for_spot) {
        const updatedPreferences = {
          ...preferences,
          starting_number_for_spot: preferences.starting_number_for_spot + 1,
        };
        dispatch(updatedProject({field: 'preferences', value: updatedPreferences}));
      }
    }
  };

  if (Platform.OS === 'android') return renderAddIntervalModal();
  else return <DragAnimation>{renderAddIntervalModal()}</DragAnimation>;
};

export default AddIntervalModal;
