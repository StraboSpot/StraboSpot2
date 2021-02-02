import React, {useRef} from 'react';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import {Form, useFormHook} from '../../form';
import {updatedProject} from '../../project/projects.slice';

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
    dispatch(updatedProject({field: 'preferences', value: form.current.values}));
  };

  return (
    <Formik
      innerRef={form}
      onSubmit={(values) => console.log('Submitting form...', values)}
      validate={(values) => useForm.validateForm({formName: formName, values: values})}
      children={(formProps) => (
        <Form {...formProps} {...{formName: formName, onMyChange: onMyChange}}/>
      )}
      initialValues={preferences}
      validateOnChange={false}
      enableReinitialize={true}  // Update values if preferences change while form open, like when number incremented
    />
  );
};

export default NamingConventions;
