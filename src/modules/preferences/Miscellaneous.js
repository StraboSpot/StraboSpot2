import React, {useEffect, useRef, useState} from 'react';
import {Alert, Switch, Text} from 'react-native';

import {Field, Formik} from 'formik';
import {Input, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';
import StandardModal from '../../shared/ui/StandardModal';
import {TextInputField} from '../form';
import {setDatabaseEndpoint, setTestingMode} from '../project/projects.slice';

const Miscellaneous = () => {
  const dispatch = useDispatch();
  const databaseEndpoint = useSelector(state => state.project.databaseEndpoint);
  const isTestingMode = useSelector(state => state.project.isTestingMode);

  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const [isTestingModalVisible, setIsTestingModalVisible] = useState(false);
  const [password, setPassword] = useState('');

  const formRef = useRef('null');

  const initialValues = {database_endpoint: databaseEndpoint.url};
  const testingModePassword = 'Strab0R0cks';
  const errorMessage = 'Wrong Password!';

  useEffect(() => {
    if (isEmpty(password)) setIsErrorMessage(false);
  }, [password]);

  useEffect(() => {
    isTestingMode ? setIsTestingModalVisible(true) : setIsTestingModalVisible(false);
  }, [isTestingMode]);

  const closeModal = () => {
    dispatch(setTestingMode(false));
    setIsTestingModalVisible(false);
    setIsErrorMessage(false);
  };

  const onMyChange = async (name, value) => {
    const trimmedValue = value.trim();
    if (!isEmpty(trimmedValue)) {
      await formRef.current.setFieldValue(name, trimmedValue);
      await formRef.current.submitForm();
      console.log('Saving naming convention preferences to Project ...', formRef.current.values);
      dispatch(setDatabaseEndpoint({...databaseEndpoint, url: formRef.current.values.database_endpoint}));
    }
    else {
      await formRef.current.setFieldValue(name, trimmedValue);
      await formRef.current.submitForm();
      dispatch(setDatabaseEndpoint(formRef.current.values.database_endpoint.databaseEndpoint.url));
    }
  };

  const onEndpointSwitchChange = (value) => {
    dispatch(setDatabaseEndpoint({...databaseEndpoint, isSelected: value}));
  };

  const onTestingSwitchChange = (value) => {
    dispatch(setTestingMode(value));
  };

  const userEntry = (value) => {
    setPassword(value);
  };

  const renderPrompt = () => (
    <StandardModal
      visible={isTestingModalVisible}
      dialogTitle={'Enter Password'}
      footerButtonsVisible={true}
      onPress={verifyPassword}
      close={closeModal}
    >
      <Text style={commonStyles.dialogContentImportantText}>
        Data saved under pages that are in testing may NOT be compatible with future versions of StraboSpot.
      </Text>
      <Input
        placeholder='Password'
        secureTextEntry={true}
        defaultValue={''}
        onChangeText={userEntry}
        errorMessage={isErrorMessage && errorMessage}
      />
    </StandardModal>
  );

  const renderInfoAlert = (label, ip) => {
    console.log(label, ip);
    return (
      Alert.alert('Note:', `If using StraboSpot Offline the URL must be an "http:" URL 
      and NOT an "https:" URL. 
      Also, make sure that there is a trailing "/db".`)
    );
  };

  const renderEndpointFieldContent = () => (
    <React.Fragment>
      <SectionDivider dividerText={'Custom Database Endpoint'}/>
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>Use Custom Endpoint?</ListItem.Title>
        </ListItem.Content>
        <Switch
          value={databaseEndpoint.isSelected}
          onValueChange={onEndpointSwitchChange}
        />
      </ListItem>
      {databaseEndpoint.isSelected && (
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            <Field
              autoCapitalize={'none'}
              onMyChange={onMyChange}
              component={TextInputField}
              key={'database_endpoint'}
              name={'database_endpoint'}
              placeholder={'http://'}
              onShowFieldInfo={renderInfoAlert}
              keyboardType={'url'}
            />
          </ListItem.Content>
        </ListItem>
      )}
    </React.Fragment>

  );

  const renderTestingModeField = () => (
    <React.Fragment>
      <SectionDivider dividerText={'Testing Mode'}/>
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>Use Testing Mode?</ListItem.Title>
        </ListItem.Content>
        <Switch
          value={isTestingMode}
          onValueChange={onTestingSwitchChange}
        />
      </ListItem>
    </React.Fragment>
  );

  const verifyPassword = () => {
    if (password === testingModePassword) {
      dispatch(setTestingMode(true));
      setIsTestingModalVisible(false);
    }
    else setIsErrorMessage(true);
  };

  return (
    <Formik
      innerRef={formRef}
      onSubmit={(values, actions) => console.log('Submitting Form', values)}
      initialValues={initialValues}
      enableReinitialize
    >
      <React.Fragment>
        {renderEndpointFieldContent()}
        {renderTestingModeField()}
        {renderPrompt()}
      </React.Fragment>
    </Formik>
  );
};

export default Miscellaneous;
