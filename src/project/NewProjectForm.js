import React, {useRef} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';
import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {getForm, setForm, validateForm} from '../components/form/form.container';
import FormView from '../components/form/Form.view';
import {isEmpty} from '../shared/Helpers';
import styles from '../shared/ui/ui.styles';
import Divider from '../components/settings-panel/HomePanelDivider';
const NewProjectForm = (props) => {
  const form = useRef(null);

  const initialValues = {
    project_name: '',
    start_date: '',
    end_date: null,
    purpose_of_study: '',
    other_team_members: '',
    area_of_interest: '',
    instruments: '',
    gps_datum: '',
    magnetic_declination: null,
    Grant_ID: '',
    Funding_Agency: '',
    ORCID: '',
    notes: '',
  };

  const onSubmitForm = () => {
    console.log('Form Submitted!');
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
                component={FormView}
                initialValues={initialValues}
                validateOnChange={false}
                enableReinitialize={true}
              />
            </ScrollView>
            <View style={{paddingTop: 10}}>
              <Button
                title={'Save'}
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
