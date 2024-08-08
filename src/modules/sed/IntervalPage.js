import React, {useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import alert from '../../shared/ui/alert';
import SaveAndCancelButtons from '../../shared/ui/SaveAndCancelButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import useSedHook from '../sed/useSed';
import {editedSpotProperties} from '../spots/spots.slice';

const IntervalPage = ({page}) => {
  const dispatch = useDispatch();

  const spot = useSelector(state => state.spot.selectedSpot);

  const useForm = useFormHook();
  const useSed = useSedHook();

  const intervalRef = useRef(null);

  const character = spot.properties?.sed?.character || undefined;
  const interval = spot.properties?.sed?.interval || {};

  const formName = ['sed', 'interval'];

  useLayoutEffect(() => {
    // console.log('ULE IntervalPage []');
    // console.log('Spot:', spot);
    // console.log('Interval:', interval);
    // console.log('Character:', character);

    if (spot.properties?.sed?.interval_type) {
      let editedSedData = JSON.parse(JSON.stringify(spot.properties.sed));
      editedSedData.character = spot.properties?.sed?.interval_type;
      delete spot.properties?.sed?.interval_type;
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
    }
    return () => confirmLeavePage();
  }, []);

  const confirmLeavePage = () => {
    if (intervalRef.current && intervalRef.current.dirty) {
      const formCurrent = intervalRef.current;
      alert('Unsaved Changes',
        'Would you like to save your interval before continuing?',
        [
          {text: 'No', style: 'cancel'},
          {text: 'Yes', onPress: () => saveInterval(formCurrent, false)},
        ],
        {cancelable: false},
      );
    }
  };

  const saveInterval = async (formCurrent) => {
    await useSed.saveSedFeature(page.key, spot, formCurrent);
    await formCurrent.resetForm();
    dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
  };

  return (
    <View style={{flex: 1, justifyContent: 'flex-start'}}>
      <ReturnToOverviewButton/>
      <SectionDivider dividerText={page.label}/>
      <SaveAndCancelButtons
        cancel={() => dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW))}
        save={() => saveInterval(intervalRef.current)}
      />
      <Formik
        innerRef={intervalRef}
        onSubmit={() => console.log('Submitting form...')}
        onReset={() => console.log('Resetting form...')}
        validate={values => useForm.validateForm({formName: formName, values: values})}
        initialValues={{...interval, character}}
        validateOnChange={false}
        enableReinitialize={true}
      >
        {formProps => <Form {...{...formProps, formName: formName}}/>}
      </Formik>
    </View>
  );
};

export default IntervalPage;
