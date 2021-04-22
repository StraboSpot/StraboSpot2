import React, {useEffect, useRef} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import {setBackupOverwriteModalVisible, setProjectLoadSelectionModalVisible} from '../home/home.slice';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import useProjectHook from './useProject';

const NewProjectForm = (props) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);

  const [useForm] = useFormHook();
  const [useProject] = useProjectHook();

  const formRef = useRef(null);

  useEffect(() => {
    if (!isEmpty(currentProject)) {
      dispatch(setBackupOverwriteModalVisible(true));
    }
  },[]);

  const initialValues = {
    start_date: new Date().toISOString(),
    gps_datum: 'WGS84 (Default)',
    magnetic_declination: 0,
  };

  const renderFormFields = () => {
    const formName = ['general', 'project_description'];
    console.log('Rendering form:', formName.join('.'), 'with values:', initialValues);
    return (
      <Formik
        innerRef={formRef}
        onSubmit={() => console.log('Submitting form...')}
        validate={(values) => useForm.validateForm({formName: formName, values: values})}
        component={(formProps) => Form({formName: formName, ...formProps})}
        initialValues={initialValues}
        validateOnChange={true}
        enableReinitialize={false}
      />
    );
  };

  const saveForm = async () => {
    const formValues = formRef.current.values;
    return formRef.current.submitForm().then(async () => {
      console.log('Saved Form');
      if (useForm.hasErrors(formRef.current)) {
        useForm.showErrors(formRef.current);
        return Promise.reject('There was an error in the form');
      }
      else if (formRef.current.values.project_name === undefined) {
        useForm.showErrors(formRef.current);
        return Promise.reject('Project name is undefined');
      }
      else {
        const newProject = await useProject.initializeNewProject(formValues);
        console.log('New Project created', newProject);
        if (isProjectLoadSelectionModalVisible) {
          dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
          props.openMainMenu();
          dispatch(setProjectLoadSelectionModalVisible(false));
        }
        else dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
        return Promise.resolve();
      }
    });
  };

  return (
    <React.Fragment>
      <View style={{alignSelf: 'center'}}>
        <SectionDivider dividerText='Create a New Project'/>
      </View>
      <FlatList ListHeaderComponent={renderFormFields()}/>
      <Button
        title={'Save New Project'}
        type={'clear'}
        onPress={() => saveForm()}
      />
    </React.Fragment>
  );
};

export default NewProjectForm;
