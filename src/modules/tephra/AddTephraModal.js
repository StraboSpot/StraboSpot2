import React from 'react';

import {TEPHRA_SUBPAGES} from './tephra.constants';
import QEM from '../../shared/ui/QEM';
import {Form} from '../form';
import {PAGE_KEYS} from '../page/page.constants';

const AddTephraModal = ({onPress}) => {

  const pageKey = PAGE_KEYS.TEPHRA;
  const subpages = TEPHRA_SUBPAGES;

  const renderForm = ({formProps, setChoicesViewKey}) => {
    return <Form {...{formName: formProps.status.formName, ...formProps}}/>;
  };

  return (
  <QEM onPress={onPress} pageKey={pageKey} subpages={subpages}>
    {renderForm}
    {/*{({formProps, setChoicesViewKey}) => <Form {...{formName: formProps.status.formName, ...formProps}}/>}*/}
  </QEM>
  );
};

export default AddTephraModal;
