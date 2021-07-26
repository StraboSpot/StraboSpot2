import React, {useRef, useState} from 'react';
import {Alert, Switch, Text} from 'react-native';

import {Field, Formik} from 'formik';
import {Input, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import StandardModal from '../../shared/ui/StandardModal';
import {TextInputField} from '../form';
import {setDatabaseEndpoint, setTestingMode} from '../project/projects.slice';

const Miscellaneous = () => {
  const dispatch = useDispatch();
  const databaseEndpoint = useSelector(state => state.project.databaseEndpoint);
  const isTestingMode = useSelector(state => state.project.isTestingMode);

  const [password, setPassword] = useState('');
  const [isTestingModalVisible, setIsTestingModalVisible] = useState(false);
  const [switchValue, setSwitchValue] = useState(isTestingMode);

  const formRef = useRef('null');

  const defaultEndpoint = 'http://strabospot.org/db';
  const initialValues = {database_endpoint: isEmpty(databaseEndpoint) ? defaultEndpoint : databaseEndpoint};
  const testingModePassword = '123';

  const onMyChange = async (name, value) => {
    const trimmedValue = value.trim();
    if (!isEmpty(trimmedValue)) {
      await formRef.current.setFieldValue(name, trimmedValue);
      await formRef.current.submitForm();
      console.log('Saving naming convention preferences to Project ...', formRef.current.values);
      dispatch(setDatabaseEndpoint(formRef.current.values.database_endpoint));
    }
    else {
      await formRef.current.setFieldValue(name, trimmedValue);
      await formRef.current.submitForm();
      dispatch(setDatabaseEndpoint(formRef.current.values.database_endpoint));
    }
  };

  const onSwitchChange = (value) => {
    setSwitchValue(value);
    if (value) setIsTestingModalVisible(true);
    else {
      dispatch(setTestingMode(false));
      setPassword('');
      setIsTestingModalVisible(false);
    }
  };

  const renderPrompt = () => (
    <StandardModal
      visible={isTestingModalVisible}
      dialogTitle={'Enter Password'}
      footerButtonsVisible={true}
      onPress={() => verifyPassword()}
      close={() => {
        setSwitchValue(false);
        setIsTestingModalVisible(false);
      }}
    >
      <Text style={commonStyles.dialogContentImportantText}>
        Data saved under pages that are in testing may NOT be compatible with future versions of StraboSpot.
      </Text>
      <Input
        placeholder='Password'
        secureTextEntry={true}
        onChangeText={value => setPassword(value)}
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
    <ListItem style={commonStyles.listItemFormField}>
      <ListItem.Content>
        <Field
          onMyChange={onMyChange}
          component={TextInputField}
          key={'database_endpoint'}
          name={'database_endpoint'}
          label={'Specify Database Endpoint'}
          onShowFieldInfo={renderInfoAlert}
        />
      </ListItem.Content>
    </ListItem>
  );

  const renderTestingModeField = () => (
    <ListItem style={commonStyles.listItem}>
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>Testing Mode</ListItem.Title>
      </ListItem.Content>
      <Switch
        value={switchValue}
        onValueChange={(value) => onSwitchChange(value)}
      />
    </ListItem>
  );

  const verifyPassword = () => {
    if (password === testingModePassword) {
      dispatch(setTestingMode(true));
      setIsTestingModalVisible(false);
    }
    else {
      Alert.alert('Wrong Password', 'Try again.');
      setSwitchValue(false);
    }
  };

  return (
    <Formik
      innerRef={formRef}
      onSubmit={(values, actions) => console.log('Submitting Form', values)}
      initialValues={initialValues}
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
