import React, {useRef} from 'react';
import {ScrollView, View} from 'react-native';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import {Formik} from 'formik';

import {getForm, hasErrors, setForm, showErrors, validateForm} from '../form/form.container';
import {isEmpty} from '../../shared/Helpers';
import Divider from '../main-menu-panel/MainMenuPanelDivider';
import Form from '../form/Form';
import useProjectHook from './useProject';

// Constants
import {homeReducers} from '../home/home.constants';

// Styles
import styles from '../../shared/ui/ui.styles';

const NewProjectForm = (props) => {
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
    const formValues = form.current.state.values;
    if (!isEmpty(getForm())) {
      return form.current.submitForm().then(async () => {
        console.log('Saved Form')
        if (hasErrors(form)) {
          showErrors(form);
          return Promise.reject('There was an error in the form');
        }
        else if (form.current.state.values.project_name === undefined) {
          showErrors(form);
          return Promise.reject('Project name is undefined');
        }
        else {
         const newProject = await useProject.createProject(formValues);
         console.log('New Project created', newProject);
            if (isProjectLoadSelectionModalVisible) {
              dispatch({type: homeReducers.SET_PROJECT_LOAD_SELECTION_MODAL_VISIBLE, value: false});
            }
            else {
              props.closeHomePanel();
            }
            return Promise.resolve();
        }
      });
    }
    else {
        console.log('No form to save');
        return Promise.reject();
      }
  };

  const renderFormFields = () => {
  setForm('project_description');
    if (!isEmpty(getForm())) {
      return (
          <View style={{flex: 1}}>
            <View style={styles.sectionTitleContainer}>
              <Divider sectionText= 'Create a New Project'/>
            </View>
            <ScrollView>
              <Formik
                ref={form}
                onSubmit={onSubmitForm}
                validate={validateForm}
                component={Form}
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
    }
  };

  return (
    <React.Fragment>
      {renderFormFields()}
    </React.Fragment>
  );
};

export default NewProjectForm;
