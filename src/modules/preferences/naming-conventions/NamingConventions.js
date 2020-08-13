import React, {useRef} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import {Form, formStyles, useFormHook} from '../../form';
import {projectReducers} from '../../project/project.constants';

const NamingConventions = () => {
  const dispatch = useDispatch();
  const formName = ['preferences', 'naming_conventions'];
  const [useForm] = useFormHook();
  const form = useRef(null);
  const preferences = useSelector(state => state.project.project.preferences) || {};

  const onMyChange = async (name, value) => {
    await form.current.setFieldValue(name, value);
    await form.current.submitForm();
    console.log('Saving naming convention preferences to Project ...', form.current.values);
    dispatch({type: projectReducers.UPDATE_PROJECT, field: 'preferences', value: form.current.values});
  };

  const onSubmitForm = (values) => {
    console.log('In onSubmitForm', values);
  };

  return (
    <React.Fragment>
      <FlatList style={formStyles.formContainer}
                ListHeaderComponent={
                  <View style={{flex: 1}}>
                    <Formik
                      innerRef={form}
                      onSubmit={onSubmitForm}
                      validate={(values) => useForm.validateForm({formName: formName, values: values})}
                      children={(formProps) => <Form {...formProps} {...{
                        formName: formName,
                        onMyChange: onMyChange,
                      }} />}
                      initialValues={preferences}
                      validateOnChange={false}
                      enableReinitialize={true}  // Update values if preferences change while form open, like when number incremented
                    />
                  </View>
                }/>
    </React.Fragment>
  );
};

export default NamingConventions;
