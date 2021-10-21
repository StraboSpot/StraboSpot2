import React from 'react';

import {Form} from '../form';

const AddRockSedimentaryModal = (props) => {
  return <Form {...{formName: props.formName, ...props.formProps}}/>;
};

export default AddRockSedimentaryModal;
