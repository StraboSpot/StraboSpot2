import React, {useEffect, useRef, useState} from 'react';
import {FlatList} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import ProjectOptionsDialogBox from './modals/project-options-modal/ProjectOptionsModal';
import {setSelectedProject} from './projects.slice';
import useProjectHook from './useProject';
import {isEmpty} from '../../shared/Helpers';
import {Form, useFormHook} from '../form';
import {setIsProjectLoadSelectionModalVisible} from '../home/home.slice';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';

const NewProjectForm = ({
                          openMainMenuPanel,
                          source,
                        }) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);

  const [isProjectOptionsModalVisible, setIsProjectOptionsModalVisible] = useState(false);

  const useForm = useFormHook();
  const useProject = useProjectHook();

  const formRef = useRef(null);

  useEffect(() => {
    console.log('UE NewProjectForm []');
    dispatch(setSelectedProject({project: '', source: source}));
    !isEmpty(currentProject) && setIsProjectOptionsModalVisible(true);
  }, []);

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
        validate={values => useForm.validateForm({formName: formName, values: values})}
        component={formProps => Form({formName: formName, ...formProps})}
        initialValues={initialValues}
        initialStatus={{formName: formName}}
        enableReinitialize={false}
      />
    );
  };

  const renderProjectOptionsModal = () => {
    return (
      <ProjectOptionsDialogBox
        currentProject={currentProject}
        visible={isProjectOptionsModalVisible}
        closeModal={() => setIsProjectOptionsModalVisible(false)}
        open={() => setIsProjectOptionsModalVisible(true)}
       />
    );
  };

  const saveForm = async () => {
    try {
      await formRef.current.submitForm();
      const formValues = useForm.showErrors(formRef.current);
      console.log('Saving form...');
      await useProject.initializeNewProject(formValues);
      console.log('New Project created', formValues.project_name);
      if (isProjectLoadSelectionModalVisible) dispatch(setIsProjectLoadSelectionModalVisible(false));
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
      openMainMenuPanel();
      return Promise.resolve();
    }
    catch (e) {
      console.log('Error submitting form', e);
      return Promise.reject();
    }
  };

  return (
    <>
      <FlatList ListHeaderComponent={renderFormFields()}/>
      <Button
        title={'Save New Project'}
        type={'clear'}
        onPress={() => saveForm()}
      />
      {renderProjectOptionsModal()}
    </>
  );
};

export default NewProjectForm;
