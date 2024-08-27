import React, {useEffect, useRef, useState} from 'react';
import {Switch, Text} from 'react-native';

import {Formik} from 'formik';
import {Input, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import CustomEndpoint from '../../shared/ui/CustomEndpoint';
import SectionDivider from '../../shared/ui/SectionDivider';
import StandardModal from '../../shared/ui/StandardModal';
import overlayStyles from '../home/overlays/overlay.styles';
import {setTestingMode} from '../project/projects.slice';

const Miscellaneous = () => {
  const dispatch = useDispatch();
  const {url, isSelected} = useSelector(state => state.connections.databaseEndpoint);
  const isTestingMode = useSelector(state => state.project.isTestingMode);

  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const [isTestingModalVisible, setIsTestingModalVisible] = useState(false);
  const [password, setPassword] = useState('');

  const formRef = useRef('null');

  const initialValues = {database_endpoint: url};
  const testingModePassword = 'Strab0R0cks';
  const errorMessage = 'Wrong Password!';

  useEffect(() => {
    console.log('UE Miscellaneous [password]', password);
    if (isEmpty(password)) setIsErrorMessage(false);
  }, [password]);

  const closeModal = () => {
    dispatch(setTestingMode(false));
    setIsTestingModalVisible(false);
    setIsErrorMessage(false);
  };

  const onTestingSwitchChange = (value) => {
    dispatch(setTestingMode(value));
    if (value) setIsTestingModalVisible(true);
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
      closeModal={closeModal}
    >
      <Text style={overlayStyles.importantText}>
        Data saved under pages that are in testing may NOT be compatible with future versions of StraboSpot.
      </Text>
      <Input
        placeholder={'Password'}
        placeholderTextColor={themes.MEDIUMGREY}
        secureTextEntry={true}
        defaultValue={''}
        onChangeText={userEntry}
        errorMessage={isErrorMessage && errorMessage}
      />
    </StandardModal>
  );

  const renderEndpointFieldContent = () => (
    <>
      <SectionDivider dividerText={'Endpoint'}/>
      <Text style={[commonStyles.noValueText, {paddingBottom: 0}]}>
        Current Endpoint{'\n'}
        {url || 'https://strabospot.org/db'}
      </Text>
      <CustomEndpoint/>
      {isSelected && <Text style={[commonStyles.noValueText, {paddingTop: 0, fontStyle: 'italic'}]}>
        *Currently StraboSpot <Text style={{fontWeight: themes.TEXT_WEIGHT}}>ONLY</Text> supports endpoints with the format StraboSpot Offline uses
        (see placeholder in box for example). If you need to use an endpoint not associated with StraboSpot Offline, the URL must contain a trailing &lsquo;/db&lsquo;.
      </Text>}
    </>
  );

  const renderTestingModeField = () => (
    <>
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
    </>
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
      <>
        {renderEndpointFieldContent()}
        {renderTestingModeField()}
        {renderPrompt()}
      </>
    </Formik>
  );
};

export default Miscellaneous;
