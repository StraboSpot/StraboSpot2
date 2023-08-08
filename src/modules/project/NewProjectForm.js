import React, {useEffect, useRef, useState} from 'react';
import {FlatList} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import ProjectOptionsDialogBox from '../../shared/ui/modal/project-options-modal/ProjectOptionsModal';
import {Form, useFormHook} from '../form';
import {setProjectLoadSelectionModalVisible} from '../home/home.slice';
import {MAIN_MENU_ITEMS} from '../main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../main-menu-panel/mainMenuPanel.slice';
import {setSelectedProject} from './projects.slice';
import useProjectHook from './useProject';

const NewProjectForm = (props) => {
  const dispatch = useDispatch();
  const currentProject = useSelector(state => state.project.project);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const [isProjectOptionsModalVisible, setIsProjectOptionsModalVisible] = useState(false);

  const [useForm] = useFormHook();
  const [useProject] = useProjectHook();

  const formRef = useRef(null);

  useEffect(() => {
    console.log('UE NewProjectForm []', props);
    dispatch(setSelectedProject({project: '', source: props.source}));
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
        close={() => setIsProjectOptionsModalVisible(false)}
        open={() => setIsProjectOptionsModalVisible(true)}
      >
      </ProjectOptionsDialogBox>
    );
  };

  const saveForm = async () => {
    try {
      await formRef.current.submitForm();
      const formValues = useForm.showErrors(formRef.current);
      console.log('Saving form...');
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
    catch (e) {
      console.log('Error submitting form', e);
      return Promise.reject();
    }
  };

  return (
    <React.Fragment>
      <FlatList ListHeaderComponent={renderFormFields()}/>
      <Button
        title={'Save New Project'}
        type={'clear'}
        onPress={() => saveForm()}
      />
      {renderProjectOptionsModal()}
    </React.Fragment>
  );
};

export default NewProjectForm;
