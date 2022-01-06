import React from 'react';

import {Button} from 'react-native-elements';
import {Overlay} from 'react-native-elements/dist/overlay/Overlay';

import {isEmpty} from '../../../shared/Helpers';
import {WARNING_COLOR} from '../../../shared/styles.constants';
import modalStyle from '../../../shared/ui/modal/modal.style';
import ModalHeader from '../../../shared/ui/modal/ModalHeader';
import Compass from '../../compass/Compass';
import {useFormHook} from '../../form';
import {FOLD_MEASUREMENTS_GROUP_KEYS} from './';

const FoldMeasurementsModal = (props) => {
  const [useForm] = useFormHook();

  const setFoldMeasurements = (compassData) => {
    let renamedCompassData = {};
    if (isEmpty(compassData)) {
      let updatedFormData = JSON.parse(JSON.stringify(props.formProps.values));
      Object.keys(FOLD_MEASUREMENTS_GROUP_KEYS).forEach(groupKey => {
        if (props.foldMeasurementsGroupField.name === groupKey) {
          Object.values(FOLD_MEASUREMENTS_GROUP_KEYS[groupKey]).forEach(k => {
            if (isEmpty(compassData) && updatedFormData[k]) delete updatedFormData[k];
          });
        }
      });
      props.formProps.setValues(updatedFormData);
      props.setIsFoldMeasurementsModalVisible(false);
    }
    else {
      const groupKeys = FOLD_MEASUREMENTS_GROUP_KEYS[props.foldMeasurementsGroupField.name];
      Object.entries(groupKeys).forEach(([compassFieldKey, foldFieldKey]) => {
        if (!isEmpty(compassData[compassFieldKey])) {
          // Convert quality to choice names for fold group, assumes qualities listed highest to lowest
          if (compassFieldKey === 'quality') {
            const survey = useForm.getSurvey(props.formName);
            const choices = useForm.getChoices(props.formName);
            const qualityChoices = useForm.getChoicesByKey(survey, choices, foldFieldKey);
            const choiceNum = Math.round(parseInt(compassData[compassFieldKey], 10) / 5 * qualityChoices.length);
            renamedCompassData[foldFieldKey] = qualityChoices.reverse()[choiceNum - 1].name;
          }
          else renamedCompassData[foldFieldKey] = compassData[compassFieldKey];
        }
      });
      props.formProps.setValues({...props.formProps.values, ...renamedCompassData});
    }
  };

  return (
    <Overlay overlayStyle={[modalStyle.modalContainer, modalStyle.modalPosition]} isVisible={true}>
      <ModalHeader
        buttonTitleRight={'Done'}
        title={props.foldMeasurementsGroupField.label}
        close={() => props.setIsFoldMeasurementsModalVisible(false)}
      />
      <Compass
        setFoldMeasurements={setFoldMeasurements}
        closeCompass={() => props.setIsFoldMeasurementsModalVisible(false)}
      />
      <Button
        titleStyle={{color: WARNING_COLOR}}
        title={'Clear Measurement'}
        type={'clear'}
        onPress={() => setFoldMeasurements({})}
      />
    </Overlay>
  );
};

export default FoldMeasurementsModal;
