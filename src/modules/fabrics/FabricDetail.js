import React, {useEffect, useRef} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {Form, useFormHook} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';

const FabricDetail = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  useEffect(() => {
    return () => confirmLeavePage();
  }, []);

  useEffect(() => {
    console.log('UE FabricDetail: props.selectedFabric changed to', props.selectedFabric);
    if (isEmpty(props.selectedFabric)) props.showFabricsOverview();
  }, [props.selectedFabric]);

  const cancelForm = async () => {
    await formRef.current.resetForm();
    props.showFabricsOverview();
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

  const deleteFabric = () => {
    let editedFabricsData = spot.properties.fabrics ? JSON.parse(JSON.stringify(spot.properties.fabrics)) : [];
    if (!editedFabricsData) editedFabricsData = [];
    editedFabricsData = editedFabricsData.filter(f => f.id !== props.selectedFabric.id);
    dispatch(editedSpotProperties({field: 'fabrics', value: editedFabricsData}));
    props.showFabricsOverview();
  };

  const deleteFabricConfirm = () => {
    const type = props.selectedFabric.type;
    Alert.alert('Delete ' + toTitleCase(type.replace('_', ' ')),
      'Are you sure you would like to delete this ' + type.replace('_', ' ') + '?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => deleteFabric(),
        },
      ],
      {cancelable: false},
    );
  };

  const renderFormFields = () => {
    const type = props.selectedFabric.type;
    const formName = ['fabrics', type];
    console.log('Rendering form:', formName[0] + '.' + formName[1]);
    console.log(toTitleCase(type) + ' Data:', props.selectedFabric);
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
          initialValues={props.selectedFabric}
          validateOnChange={false}
          enableReinitialize={true}
        />
        <Button
          titleStyle={{color: themes.RED}}
          title={'Delete ' + toTitleCase(type.replace('_', ' '))}
          type={'clear'}
          onPress={() => deleteFabricConfirm()}
        />
      </View>
    );
  };

  const saveForm = async (formCurrent) => {
    const type = props.selectedFabric.type;
    try {
      await formCurrent.submitForm();
      if (useForm.hasErrors(formCurrent)) {
        useForm.showErrors(formCurrent);
        throw Error;
      }
      let editedFabricData = formCurrent.values;
      console.log('Saving ' + type + ' data to Spot ...');
      let editedFabricsData = spot.properties.fabrics ? JSON.parse(JSON.stringify(spot.properties.fabrics)) : [];
      editedFabricsData = editedFabricsData.filter(f => f.id !== editedFabricData.id);
      editedFabricsData.push(editedFabricData);
      dispatch(editedSpotProperties({field: 'fabrics', value: editedFabricsData}));
      await formRef.current.resetForm();
      props.showFabricsOverview();
    }
    catch (err) {
      console.log('Error submitting form', err);
    }
  };

  return (
    <React.Fragment>
      {!isEmpty(props.selectedFabric) && (
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

export default FabricDetail;
