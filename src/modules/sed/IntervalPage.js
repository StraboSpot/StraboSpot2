import React, {useLayoutEffect, useRef} from 'react';
import {Alert, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import useSedHook from '../sed/useSed';
import {editedSpotProperties} from '../spots/spots.slice';

const IntervalPage = (props) => {
  const dispatch = useDispatch();

  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();
  const useSed = useSedHook();

  const intervalRef = useRef(null);

  const character = spot.properties?.sed?.character || undefined;
  const interval = spot.properties?.sed?.interval || {};

  const formName = ['sed', 'interval'];

  useLayoutEffect(() => {
    console.log('UE Rendered IntervalPage\nSpot:', spot);
    console.log('Interval:', interval);
    console.log('Character:', character);

    if (spot.properties?.sed?.interval_type) {
      let editedSedData = JSON.parse(JSON.stringify(spot.properties.sed));
      editedSedData.character = spot.properties?.sed?.interval_type;
      delete spot.properties?.sed?.interval_type;
      dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
    }
    return () => confirmLeavePage();
  }, []);

  const confirmLeavePage = () => {
    if (intervalRef.current && intervalRef.current.dirty) {
      const formCurrent = intervalRef.current;
      Alert.alert('Unsaved Changes',
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
    await useSed.saveSedFeature(props.page.key, spot, formCurrent);
    await formCurrent.resetForm();
    dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
  };

  return (
    <React.Fragment>
      <View style={{flex: 1, justifyContent: 'flex-start'}}>
        <ReturnToOverviewButton/>
        <SectionDivider dividerText={props.page.label}/>
        <SaveAndCloseButton
          cancel={() => dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW))}
          save={() => saveInterval(intervalRef.current)}
        />
        <Formik
          innerRef={intervalRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          children={(formProps) => <Form {...{...formProps, formName: formName}}/>}
          initialValues={{...interval, character}}
          validateOnChange={false}
          enableReinitialize={true}
        />
      </View>
    </React.Fragment>
  );
};

export default IntervalPage;