import React from 'react';

import {Form} from '../form';

const AddTensor = ({formName, formProps}) => {
  return (
    <Form {...{formName: formName, ...formProps}}/>
  );
};

export default AddTensor;
