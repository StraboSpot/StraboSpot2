import React, {useEffect, useRef, useState} from 'react';
import {Text, View} from 'react-native';
import {Field, Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';
import {TextInputField} from '../form';
import {ListItem} from 'react-native-elements';
import commonStyles from '../../shared/common.styles';
import {setDatabaseEndpoint} from '../project/projects.slice';
import {isEmpty} from '../../shared/Helpers';
import useServerRequestsHook from '../../services/useServerRequests';

const Miscellaneous = () => {
  const dispatch = useDispatch();
  const databaseEndpoint = useSelector(state => state.project.databaseEndpoint);
  const formRef = useRef('null');
  const [dbUrl, setDbUrl] = useState('');


  const [useServerRequests] = useServerRequestsHook();

  useEffect(() => {
    const dbUrl = useServerRequests.getDbUrl();
    setDbUrl(dbUrl);
  }, []);

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
