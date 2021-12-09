import React from 'react';

import {Form} from '../form';

const AddOther = (props) => {
  return (
    <Form {...{formName: props.formName, ...props.formProps}}/>
  );
};

export default AddOther;
