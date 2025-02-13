import React, {useRef, useState} from 'react';
import {FlatList, View} from 'react-native';

import {Formik} from 'formik';
import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {getNewUUID, isEmpty} from '../../shared/Helpers';
import alert from '../../shared/ui/alert';
import Modal from '../../shared/ui/modal/Modal';
import SaveButton from '../../shared/ui/SaveButton';
import {Form, MainButtons, useForm} from '../form';
import {setModalVisible} from '../home/home.slice';
import overlayStyles from '../home/overlays/overlay.styles';
import {PAGE_KEYS} from '../page/page.constants';
import {updatedProject} from '../project/projects.slice';

const ReportModal = () => {
  const dispatch = useDispatch();
  const reports = useSelector(state => state.project.project?.reports) || [];
  const report = useSelector(state => state.home.modalValues);

  const [choicesViewKey, setChoicesViewKey] = useState(null);

  const formRef = useRef(null);
  const {getChoices, getRelevantFields, getSurvey, isRelevant, showErrors, validateForm} = useForm();

  const initialValues = isEmpty(report) ? {} : report;

  const groupKey = 'general';
  const pageKey = PAGE_KEYS.REPORTS;
  const formName = [groupKey, pageKey];

  const survey = getSurvey(formName);
  const choices = getChoices(formName);

  const topButtonsKeys = ['report_type', 'privacy'];
  const mainFormKeys = ['subject', 'notes'];
  const mainFormKeysFields = mainFormKeys.map(k => survey.find(f => f.name === k));

  const closeModal = () => {
    dispatch(setModalVisible({modal: null}));
  };

  const confirmCloseModal = () => {
    if (formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      alert(
        'Unsaved Changes',
        'Would you like to save your report before continuing?',
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: closeModal,
          },
          {
            text: 'Yes',
            onPress: () => saveReport(formCurrent),
          },
        ],
        {cancelable: false},
      );
    }
    else closeModal();
  };

  const onMyChange = async (name, value) => {
    await formRef.current.setFieldValue(name, value);
    setChoicesViewKey(null);
  };

  const renderForm = (formProps) => {
    return (
      <>
        <View style={{width: 400, alignSelf: 'center'}}>
          <MainButtons
            mainKeys={topButtonsKeys}
            formName={formName}
            setChoicesViewKey={setChoicesViewKey}
            formProps={formProps}
          />
        </View>
        <Form {...{formName: formName, surveyFragment: mainFormKeysFields, ...formProps}}/>
      </>
    );
  };

  const renderSubform = (formProps) => {
    const relevantFields = getRelevantFields(survey, choicesViewKey);
    return (
      <Overlay overlayStyle={overlayStyles.overlayContainer}>
        <View style={{alignItems: 'flex-end'}}>
          <Button
            onPress={() => setChoicesViewKey(null)}
            type={'clear'}
            icon={{name: 'close', type: 'ionicon', size: 20}}
            buttonStyle={{padding: 0}}
          />
        </View>
        <Form {...{
          formName: [groupKey, pageKey],
          surveyFragment: relevantFields, ...formProps,
          onMyChange: onMyChange,
        }}/>
      </Overlay>
    );
  };

  const saveReport = async () => {
    try {
      console.log('Saving report ...');
      await formRef.current.submitForm();
      let editedReport = showErrors(formRef.current);
      if (!editedReport.id) editedReport.id = getNewUUID();
      if (!editedReport.created_timestamp) editedReport.created_timestamp = Date.now();
      editedReport.updated_timestamp = Date.now();
      let updatedReports = reports.filter(r => r.id !== editedReport.id);
      updatedReports.push({...editedReport});
      dispatch(updatedProject({field: 'reports', value: updatedReports}));
      closeModal();
    }
    catch (e) {
      console.log('Error saving report data', e);
    }
  };

  return (
    <Modal
      title={isEmpty(initialValues) ? 'Create New Report' : 'Update Report'}
      buttonTitleRight={'Close'}
      closeModal={confirmCloseModal}
    >
      <FlatList
        bounces={false}
        ListHeaderComponent={
          <View style={{flex: 1}}>
            <Formik
              innerRef={formRef}
              initialValues={initialValues}
              onSubmit={values => console.log('Submitting form...', values)}
              validate={values => validateForm({formName: formName, values: values})}
              validateOnChange={false}
            >
              {formProps => (
                <View style={{flex: 1}}>
                  {renderForm(formProps)}
                  {choicesViewKey && renderSubform(formProps)}
                </View>
              )}
            </Formik>
          </View>
        }
      />
      <SaveButton title={'Save Report'} onPress={saveReport}/>
    </Modal>
  );
};

export default ReportModal;
