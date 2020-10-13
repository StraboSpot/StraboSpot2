import React, {useRef} from 'react';
import {ScrollView, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import styles from '../../shared/ui/ui.styles';
import {Form, useFormHook} from '../form';
import {setProjectLoadSelectionModalVisible} from '../home/home.slice';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {mainMenuPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import useProjectHook from './useProject';

const NewProjectForm = (props) => {
  const [useForm] = useFormHook();
  const [useProject] = useProjectHook();
  const form = useRef(null);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const dispatch = useDispatch();

  const initialValues = {
    start_date: new Date(),
  };

  const onSubmitForm = () => {
    console.log('Form Submitted');

  };

  const saveForm = async () => {
    const formValues = form.current.values;
    return form.current.submitForm().then(async () => {
      console.log('Saved Form');
      if (useForm.hasErrors(form)) {
        useForm.showErrors(form);
        return Promise.reject('There was an error in the form');
      }
      else if (form.current.values.project_name === undefined) {
        useForm.showErrors(form);
        return Promise.reject('Project name is undefined');
      }
      else {
        const newProject = await useProject.initializeNewProject(formValues);
        console.log('New Project created', newProject);
        if (isProjectLoadSelectionModalVisible) {
          dispatch(
            {type: mainMenuPanelReducers.SET_MENU_SELECTION_PAGE, name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS});
          props.openMainMenu();
          dispatch(setProjectLoadSelectionModalVisible({bool: false}));
        }
        else {
          dispatch(
            {type: mainMenuPanelReducers.SET_MENU_SELECTION_PAGE, name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS});
        }
        return Promise.resolve();
      }
    });
  };

  const renderFormFields = () => {
    const formName = ['general', 'project_description'];
    console.log('Rendering form:', formName.join('.'), 'with values:', initialValues);
    return (
      <View style={{flex: 1}}>
        <View style={styles.sectionTitleContainer}>
          <Divider sectionText='Create a New Project'/>
        </View>
        <ScrollView>
          <Formik
            innerRef={form}
            onSubmit={onSubmitForm}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            component={(formProps) => Form({formName: formName, ...formProps})}
            initialValues={initialValues}
            validateOnChange={true}
            enableReinitialize={false}
          />
        </ScrollView>
        <View style={{paddingTop: 10}}>
          <Button
            title={'Save'}
            onPress={() => saveForm()}
          />
        </View>
      </View>
    );
  };

  return (
    <React.Fragment>
      {renderFormFields()}
    </React.Fragment>
  );
};

export default NewProjectForm;
