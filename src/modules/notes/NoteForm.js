import React from 'react';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {TextInputField} from '../form';

const NoteForm = ({formRef, initialNotesValues}) => {
  return (
    <Formik
      initialValues={initialNotesValues}
      onSubmit={values => console.log('Submitting form...', values)}
      innerRef={formRef}
      enableReinitialize={true}
    >
      {() => (
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            <Field
              component={TextInputField}
              name={'note'}
              key={'note'}
              appearance={'full'}
              autoFocus={true}
            />
          </ListItem.Content>
        </ListItem>
      )}
    </Formik>
  );
};

export default NoteForm;
