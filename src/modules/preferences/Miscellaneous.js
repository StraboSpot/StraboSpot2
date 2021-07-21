import React, {useEffect, useRef, useState} from 'react';
import {Switch, View} from 'react-native';
import {Field, Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';
import {TextInputField} from '../form';
import {ListItem} from 'react-native-elements';
import commonStyles from '../../shared/common.styles';
import {setDatabaseEndpoint, setTestingMode} from '../project/projects.slice';
import {isEmpty} from '../../shared/Helpers';
import useServerRequestsHook from '../../services/useServerRequests';

const Miscellaneous = () => {
  const testingModePassword = 'Strab0R0cks';
  const dispatch = useDispatch();
  const databaseEndpoint = useSelector(state => state.project.databaseEndpoint);

  const [switchValue, setSwitchValue] = useState(false);

  const formRef = useRef('null');
  const [dbUrl, setDbUrl] = useState('');


  const [useServerRequests] = useServerRequestsHook();

  useEffect(() => {
    const dbUrl = useServerRequests.getDbUrl();
    setDbUrl(dbUrl);
  }, []);

  useEffect(() => {
    switchValue ?
      Alert.prompt(
        'Enter Password',
        null,
        [
          {
            text: 'Go',
            onPress: verifyPassword
          },
          {
            text: 'Cancel',
            onPress: () => setSwitchValue(false),
            style: 'cancel'
          }
        ],
        'secure-text')
      : dispatch(setTestingMode(false));
  }, [switchValue])

  const onMyChange = async (name, value) => {
    const trimmedValue = value.trim();
    if (!isEmpty(trimmedValue)) {
      await formRef.current.setFieldValue(name, trimmedValue);
      await formRef.current.submitForm();
      console.log('Saving naming convention preferences to Project ...', formRef.current.values);
      dispatch(setDatabaseEndpoint(formRef.current.values.database));
    }
    else {
      await formRef.current.setFieldValue(name, trimmedValue);
      dispatch(setDatabaseEndpoint(formRef.current.values.database));
    }
  };

  const onSwitchChange = () => {
    setSwitchValue(!switchValue);
  };

  const renderInfoAlert = (label, ip) => {
    console.log(label, ip);
    return (
      Alert.alert('Note:', `If using StraboSpot Offline the URL must be an "http:" URL 
      and NOT an "https:" URL. 
      Also, make sure that there is a trailing "/db".`)
    );
  };

  const renderEndpointFieldContent = () => {
    return (
      <View>
        <ListItem style={commonStyles.listItemFormField}>
          <ListItem.Content>
            <Field
              onMyChange={onMyChange}
              placeholder={isEmpty(databaseEndpoint) ? 'http://strabospot.org/db' : databaseEndpoint}
              component={TextInputField}
              key={'database_endpoint'}
              name={'database'}
              label={'Specify Database Endpoint'}
              onShowFieldInfo={renderInfoAlert}
            >
            </Field>
          </ListItem.Content>
        </ListItem>
        <ListItem style={commonStyles.listItem}>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>Testing Mode</ListItem.Title>
          </ListItem.Content>
          <Switch
            value={switchValue}
            onChange={onSwitchChange}
          />
        </ListItem>
      </View>
    );
  };

  const verifyPassword = (password) => {
    if (password === testingModePassword) {
      console.log('You Win')
      dispatch(setTestingMode(true));
    }
    else {
      Alert.alert('Wrong Password', 'Try again to see cool stuff!')
      setSwitchValue(false);
    }
  };

  return (
    <Formik
      innerRef={formRef}
      onSubmit={(values, actions) => {
        console.log('Submitting Form', values);
        console.log(actions);
      }}
      initialValues={{}}
    >
      {({...props}) => {
        console.log('MISC PROPS IN FORMIK', props);
        return (
          <View>
            <ListItem style={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  onMyChange={onMyChange}
                  placeholder={isEmpty(databaseEndpoint) ? 'http://strabospot.org/db' : databaseEndpoint}
                  component={TextInputField}
                  key={'database_endpoint'}
                  name={'database'}
                  label={'Specify Database Endpoint'}
                  onShowFieldInfo={(a, b) => console.log(a, b)}
                >
                </Field>
              </ListItem.Content>
            </ListItem>
            <View style={{margin: 10}}>
              <Text style={commonStyles.dialogText}>Note: {'\n\n'}If using StraboSpot Offline the URL must be an "http:"
                URL and NOT an "https:" URL. Also, make sure that there is a trailing "/db".
              </Text>
            </View>
          </View>
        );
      }}
    </Formik>
  );
};

export default Miscellaneous;
