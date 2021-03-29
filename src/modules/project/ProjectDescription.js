import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {Alert, View} from 'react-native';

import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';

import {toTitleCase} from '../../shared/Helpers';
import {Form, LABEL_DICTIONARY, useFormHook} from '../form';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {updatedProject} from './projects.slice';

const ProjectDescription = () => {
  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);

  const [useForm] = useFormHook();

  const formRef = useRef(null);

  const formName = ['general', 'project_description'];
  const projectDescription = {
    ...project.description,
    gps_datum: project.description.gps_datum || 'WGS84 (Default)',
    magnetic_declination: project.description.magnetic_declination || 0,
  };

  useLayoutEffect(() => {
      console.log('UE ProjectDescription []');
      console.log('Project Description', projectDescription);
      return () => saveForm();
  },[])

  // Given a name, get the label for it
  const getLabel = (key) => {
    return LABEL_DICTIONARY[key] || toTitleCase(key.replace(/_/g, ' '));
  };

  const saveForm = async () => {
    const formCurrent = formRef.current;
    await formRef.current.submitForm();
    let newValues = JSON.parse(JSON.stringify(formCurrent.values));
    if (useForm.hasErrors(formCurrent)) {
      const errorMessages = Object.entries(formCurrent.errors).map(([key, value]) => getLabel(key) + ': ' + value);
      Alert.alert('Project Description Errors!', 'Changes in the following fields were not saved.'
        + ' Please fix the errors:\n\n' + errorMessages.join('\n'));
      const newValuesWithoutErrors = Object.keys(formCurrent.values).reduce((acc, key) => {
        return Object.keys(formCurrent.errors).includes(key) ? acc : {...acc, [key]: formCurrent.values[key]};
      }, {});
      const erroredFieldsInitialValues = Object.keys(projectDescription).reduce((acc, key) => {
        return Object.keys(formCurrent.errors).includes(key) ? {...acc, [key]: projectDescription[key]} : acc;
      }, {});
      newValues = {...newValuesWithoutErrors, ...erroredFieldsInitialValues};
    }
    console.log('Saving project description to Project ...', newValues);
    dispatch(updatedProject({field: 'description', value: newValues}));
  };

  return (
    <View style={{flex: 1}}>
      <SidePanelHeader
        title={'Active Project'}
        headerTitle={'Project Description'}
        backButton={() => dispatch(setSidePanelVisible({bool: false}))}
      />
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={(values) => console.log('Submitting form...', values)}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          component={(formProps) => Form({formName: formName, ...formProps})}
          initialValues={projectDescription}
          validateOnChange={true}
          enableReinitialize={true}  // Update values if preferences change while form open, like when number incremented
        />
      </View>

    </View>
  );
};

export default ProjectDescription;
