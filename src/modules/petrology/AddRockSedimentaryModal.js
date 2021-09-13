import React from 'react';

import {Form} from '../form';

const AddRockSedimentaryModal = (props) => {
  return (
    <React.Fragment>
      <Form
        {...props.formProps}
        {...{
          formName: props.formName,
        }}
      />
    </React.Fragment>
  );
};

export default AddRockSedimentaryModal;
