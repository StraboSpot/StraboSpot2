import React, {useEffect, useRef, useState} from 'react';
import {Alert, Switch, Text, View} from 'react-native';

import {Formik} from 'formik';
import {Input, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import CustomEndpoint from '../../shared/ui/CustomEndpoint';
import SectionDivider from '../../shared/ui/SectionDivider';
import StandardModal from '../../shared/ui/StandardModal';
import {setTestingMode} from '../project/projects.slice';

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
    console.log('UE Miscellaneous [password]', password);
    if (isEmpty(password)) setIsErrorMessage(false);
  }, [password]);

  useEffect(() => {
    console.log('UE Miscellaneous [isTestingMode]', isTestingMode);
    isTestingMode ? setIsTestingModalVisible(true) : setIsTestingModalVisible(false);
  }, [isTestingMode]);

  const closeModal = () => {
    dispatch(setTestingMode(false));
    setIsTestingModalVisible(false);
    setIsErrorMessage(false);
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
        placeholder={'Password'}
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
      and NOT an "https:" URL. Also, make sure that there is a trailing "/db".`)
    );
  };

  const renderEndpointFieldContent = () => (
    <View>
      <SectionDivider dividerText={'Endpoint'}/>
      <Text style={{textAlign: 'center'}}>Default Endpoint:</Text>
      <Text style={{textAlign: 'center', fontWeight: 'bold'}}>https://strabospot.org/db</Text>
      <Text style={{margin: 15}}>If using StraboSpot Offline, the URL must be an &lsquo;http:&lsquo; URL
        and NOT an &lsquo;https:&lsquo; URL. Also, make sure that there is a trailing &lsquo;/db&lsquo;.</Text>
      <CustomEndpoint/>
    </View>

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
      onSubmit={values => console.log('Submitting Form', values)}
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
