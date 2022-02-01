import React from 'react';

import {Button} from 'react-native-elements';
import {Overlay} from 'react-native-elements/dist/overlay/Overlay';

import {isEmpty} from '../../../shared/Helpers';
import {WARNING_COLOR} from '../../../shared/styles.constants';
import modalStyle from '../../../shared/ui/modal/modal.style';
import ModalHeader from '../../../shared/ui/modal/ModalHeader';
import Compass from '../../compass/Compass';
import {useFormHook} from '../../form';

const ThreeDStructuresMeasurementsModal = (props) => {
  const [useForm] = useFormHook();

  const setMeasurements = (compassData) => {
    let renamedCompassData = {};
    if (isEmpty(compassData)) {
      let updatedFormData = JSON.parse(JSON.stringify(props.formProps.values));
      Object.values(props.measurementsGroup).forEach(k => {
        if (isEmpty(compassData) && updatedFormData[k]) delete updatedFormData[k];
      });
      props.formProps.setValues(updatedFormData);
      props.setIsThreeDStructuresMeasurementsModalVisible(false);
    }
    else {
      Object.entries(props.measurementsGroup).forEach(([compassFieldKey, foldFieldKey]) => {
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
        title={props.measurementsGroupLabel}
        close={() => props.setIsThreeDStructuresMeasurementsModalVisible(false)}
      />
      <Compass
        setAttributeMeasurements={setMeasurements}
        closeCompass={() => props.setIsThreeDStructuresMeasurementsModalVisible(false)}
      />
      <Button
        titleStyle={{color: WARNING_COLOR}}
        title={'Clear Measurement'}
        type={'clear'}
        onPress={() => setMeasurements({})}
      />
    </Overlay>
  );
};

export default ThreeDStructuresMeasurementsModal;
