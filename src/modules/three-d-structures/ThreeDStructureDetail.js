import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {Form, useFormHook} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';

const ThreeDStructureDetail = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  useLayoutEffect(() => {
    return () => confirmLeavePage();
  }, []);

  useEffect(() => {
    console.log('UE ThreeDStructureDetail: props.selected3dStructure changed to', props.selected3dStructure);
    if (isEmpty(props.selected3dStructure)) props.show3dStructuresOverview();
  }, [props.selected3dStructure]);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    props.show3dStructuresOverview();
  };

  const confirmLeavePage = () => {
    if (formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      Alert.alert('Unsaved Changes',
        'Would you like to save your data before continuing?',
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

  const delete3dStructure = () => {
    let edited3dStructuresData = spot.properties._3d_structures ? JSON.parse(
      JSON.stringify(spot.properties._3d_structures)) : [];
    if (!edited3dStructuresData) edited3dStructuresData = [];
    edited3dStructuresData = edited3dStructuresData.filter(struct => struct.id !== props.selected3dStructure.id);
    dispatch(editedSpotProperties({field: '_3d_structures', value: edited3dStructuresData}));
    props.show3dStructuresOverview();
  };

  const delete3dStructureConfirm = () => {
    const type = props.selected3dStructure.type;
    Alert.alert('Delete ' + toTitleCase(type),
      'Are you sure you would like to delete this ' + type + '?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => delete3dStructure(),
        },
      ],
      {cancelable: false},
    );
  };

  const renderFormFields = () => {
    const type = props.selected3dStructure.type;
    const formName = ['_3d_structures', type];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    console.log(toTitleCase(type) + ' Data:', props.selected3dStructure);
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={() => console.log('Submitting form...')}
          onReset={() => console.log('Resetting form...')}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          children={(formProps) => (
            <Form {...formProps} {...{formName: formName}}/>
          )}
          initialValues={props.selected3dStructure}
          validateOnChange={false}
          enableReinitialize={true}
        />
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete ' + toTitleCase(type)}
          type={'clear'}
          onPress={() => delete3dStructureConfirm()}
        />
      </View>
    );
  };

  const saveForm = async (formCurrent) => {
    const type = props.selected3dStructure.type;
    try {
      await formCurrent.submitForm();
      if (useForm.hasErrors(formCurrent)) {
        useForm.showErrors(formCurrent);
        throw Error;
      }
      let edited3dStructureData = formCurrent.values;
      console.log('Saving ' + type + ' data to Spot ...');
      let edited3dStructuresData = spot.properties._3d_structures ? JSON.parse(
        JSON.stringify(spot.properties._3d_structures)) : [];
      edited3dStructuresData = edited3dStructuresData.filter(struct => struct.id !== edited3dStructureData.id);
      edited3dStructuresData.push(edited3dStructureData);
      dispatch(editedSpotProperties({field: '_3d_structures', value: edited3dStructuresData}));
      await formRef.current.resetForm();
      props.show3dStructuresOverview();
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  return (
    <React.Fragment>
      {!isEmpty(props.selected3dStructure) && (
        <React.Fragment>
          <SaveAndCloseButton
            cancel={() => cancelForm()}
            save={() => saveForm(formRef.current)}
          />
          <FlatList ListHeaderComponent={renderFormFields()}/>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default ThreeDStructureDetail;
