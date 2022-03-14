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
import useSpotsHook from '../../spots/useSpots';
import useMapsHook from '../useMaps';
import useStratSectionHook from './useStratSection';

const AddIntervalModal = () => {
  const dispatch = useDispatch();
  const stratSection = useSelector(state => state.map.stratSection);

  const [useForm] = useFormHook();
  const [useMaps] = useMapsHook();
  const [useSpots] = useSpotsHook();
  const useStratSection = useStratSectionHook();

  const formRef = useRef(null);
  const nameFormRef = useRef(null);

  const formName = ['sed', 'add_interval'];

  const initialValues = {thickness_units: stratSection.column_y_axis_units};

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
    return (
      <Formik
        initialValues={{}}
        onSubmit={() => console.log('Submitting form...')}
        innerRef={nameFormRef}
        validateOnChange={false}
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
        initialValues={initialValues}
        validateOnChange={false}
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
    if (useForm.hasErrors(formRef.current)) {
      useForm.showErrors(formRef.current, formName);
      return Promise.reject();
    }
    else {
      const intervalData = formRef.current?.values;
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
      }
    }
  };

  if (Platform.OS === 'android') return renderAddIntervalModal();
  else return <DragAnimation>{renderAddIntervalModal()}</DragAnimation>;
};

export default AddIntervalModal;
