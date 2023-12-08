import React from 'react';

import {IGNEOUS_ROCK_CLASSES} from './petrology.constants';
import {isEmpty} from '../../shared/Helpers';
import {Form, MainButtons} from '../form';

const AddRockIgneousModal = (props) => {

  const igneousRockClass = props.formName[1];

  const renderSpecificIgneousRock = () => {
    // Relevant keys for quick-entry modal
    let firstKeys, mainButttonsKeys, lastKeys;
    if (igneousRockClass === IGNEOUS_ROCK_CLASSES.PLUTONIC) {
      firstKeys = ['plutonic_rock_type'];
      mainButttonsKeys = ['occurence_plutonic', 'texture_plutonic', 'color_index_pluton', 'alteration_plutonic'];
      lastKeys = ['pluton_characteristic_size_of', 'notes_plutonic'];
    }
    else {
      firstKeys = ['volcanic_rock_type'];
      mainButttonsKeys = ['occurence_volcanic', 'texture_volcanic', 'color_index_volc', 'alteration_volcanic'];
      lastKeys = ['vol_characteristic_size_of_cry', 'notes_volcanic'];
    }

    // Relevant fields for quick-entry modal
    const lastKeysFields = lastKeys.map(k => props.survey.find(f => f.name === k)).filter(k => !isEmpty(k));

    return (
      <React.Fragment>
        <MainButtons
          mainKeys={firstKeys}
          formName={props.formName}
          formProps={props.formProps}
          setChoicesViewKey={props.setChoicesViewKey}
        />
        <MainButtons
          mainKeys={mainButttonsKeys}
          formName={props.formName}
          formProps={props.formProps}
          setChoicesViewKey={props.setChoicesViewKey}
        />
        {!isEmpty(lastKeysFields) && <Form {...{surveyFragment: lastKeysFields, ...props.formProps}}/>}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {!isEmpty(props.survey) && renderSpecificIgneousRock()}
    </React.Fragment>
  );
};

export default AddRockIgneousModal;
