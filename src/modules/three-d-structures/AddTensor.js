import React from 'react';

import {Form} from '../form';

const AddTensor = (props) => {
  return (
    <Form {...{formName: props.formName, ...props.formProps}}/>
  );
};

export default AddTensor;
