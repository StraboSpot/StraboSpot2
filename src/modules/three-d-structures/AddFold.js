import React from 'react';

import {Form} from '../form';

const AddFold = (props) => {
  return (
    <Form {...{formName: props.formName, ...props.formProps}}/>
  );
};

export default AddFold;
