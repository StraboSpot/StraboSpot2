import React, {useState} from 'react';
import {Platform, Text, useWindowDimensions, View} from 'react-native';

import {Button} from 'react-native-elements';
import {Overlay} from 'react-native-elements/dist/overlay/Overlay';
import {useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import {SMALL_SCREEN, WARNING_COLOR} from '../../../shared/styles.constants';
import ModalHeader from '../../../shared/ui/modal/ModalHeader';
import SliderBar from '../../../shared/ui/SliderBar';
import Compass from '../../compass/Compass';
import compassStyles from '../../compass/compass.styles';
import ManualMeasurement from '../../compass/ManualMeasurement';
import {formStyles, useFormHook} from '../../form';
import overlayStyles from '../../home/overlay.styles';

const ThreeDStructuresMeasurementsModal = (props) => {
  const {height} = useWindowDimensions();

  const compassMeasurementTypes = useSelector(state => state.compass.measurementTypes);

  const [isManualMeasurement, setIsManualMeasurement] = useState(Platform.OS !== 'ios');
  const [sliderValue, setSliderValue] = useState(6);

  const [useForm] = useFormHook();

  const addAttributeMeasurement = (data) => {
    const sliderQuality = sliderValue ? {quality: sliderValue.toString()} : undefined;
    setMeasurements({...data, ...sliderQuality});
    props.setIsThreeDStructuresMeasurementsModalVisible(false);
  };

  const setMeasurements = (compassData) => {
    let renamedCompassData = {};
    if (isEmpty(compassData)) {
      let updatedFormData = JSON.parse(JSON.stringify(props.formProps.values));
      Object.values(props.measurementsGroup).forEach((k) => {
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
            renamedCompassData[foldFieldKey] = qualityChoices.reverse()[choiceNum - 1]?.name;
          }
          else renamedCompassData[foldFieldKey] = compassData[compassFieldKey];
        }
      });
      props.formProps.setValues({...props.formProps.values, ...renamedCompassData});
    }
  };

  return (
    <Overlay
      overlayStyle={
        SMALL_SCREEN
          ? overlayStyles.overlayContainerFullScreen
          : [{...overlayStyles.overlayContainer, maxHeight: height * 0.80}, overlayStyles.overlayPosition]
      }
      isVisible={true}
      fullScreen={SMALL_SCREEN}
    >
      <ModalHeader
        buttonTitleRight={'Done'}
        title={props.measurementsGroupLabel}
        close={() => props.setIsThreeDStructuresMeasurementsModalVisible(false)}
      />
      {Platform.OS === 'ios' && (
        <Button
          buttonStyle={formStyles.formButtonSmall}
          titleProps={formStyles.formButtonTitle}
          title={isManualMeasurement ? 'Switch to Compass Input' : 'Manually Add Measurement'}
          type={'clear'}
          onPress={() => setIsManualMeasurement(!isManualMeasurement)}
        />
      )}
      {isManualMeasurement ? (
        <ManualMeasurement
          addAttributeMeasurement={addAttributeMeasurement}
          setAttributeMeasurements={setMeasurements}
          measurementTypes={compassMeasurementTypes}
          setSliderValue={setSliderValue}
          sliderValue={sliderValue}
        />
      ) : (
        <>
          <Compass
            setAttributeMeasurements={setMeasurements}
            closeCompass={() => props.setIsThreeDStructuresMeasurementsModalVisible(false)}
            sliderValue={sliderValue}
          />
          <View style={compassStyles.sliderContainer}>
            <Text style={{...commonStyles.listItemTitle, fontWeight: 'bold'}}>Quality of Measurement</Text>
            <SliderBar
              onSlidingComplete={setSliderValue}
              value={sliderValue}
              step={1}
              maximumValue={6}
              minimumValue={1}
              labels={['Low', '', '', '', 'High', 'N/R']}
            />
          </View>
        </>
      )}
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
