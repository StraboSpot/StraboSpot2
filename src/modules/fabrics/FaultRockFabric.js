import React from 'react';
import {Text, View} from 'react-native';

import {Field} from 'formik';
import {Button, ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {REACT_NATIVE_ELEMENTS_BLUE, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import Slider from '../../shared/ui/Slider';
import {formStyles, TextInputField, useFormHook} from '../form';

const FaultRockFabric = (props) => {
  const [useForm] = useFormHook();

  const cohesionKeys = ['inco_nofol', 'inco_fol', 'co_nofol', 'co_fol'];
  const incohesiveButtons = cohesionKeys.slice(0, 2);
  const cohesiveButtons = cohesionKeys.slice(-2);

  const spatialConfigKey = 'spatial_config';
  const spatialConfigDescriptionKey = 'desc_spat_char';
  const spatialConfigDescriptionField = props.survey.find(f => f.name === spatialConfigDescriptionKey);

  const interNotesKey = 'interp_note';
  const interNotesField = props.survey.find(f => f.name === interNotesKey);

  const kinIndPresentKey = 'kin_ind_present';
  const kinIndPresentField = props.survey.find(f => f.name === kinIndPresentKey);

  const tectoniteTypesKey = 'tectonite_type';
  const tectoniteTypesField = props.survey.find(f => f.name === tectoniteTypesKey);
  const tectoniteTypes = useForm.getChoicesByKey(props.survey, props.choices, tectoniteTypesKey);

  const cohesionText = (key) => (
    <React.Fragment>
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text
          style={props.formRef.current?.values[key] ? formStyles.formButtonSelectedTitle : formStyles.formButtonTitle}>
          {props.getLabel(key)}
        </Text>
        {props.formRef.current?.values[key] && (
          <Text style={{...formStyles.formButtonSelectedTitle, fontWeight: 'bold'}}>
            {props.getLabel(props.formRef.current.values[key])}
          </Text>
        )}
      </View>
    </React.Fragment>
  );

  const onSpatialConfigSelected = (choiceName) => {
    const spatialConfigValues = props.formRef.current?.values[spatialConfigKey] || [];
    if (spatialConfigValues.includes(choiceName)) {
      const spatialConfigValuesFiltered = spatialConfigValues.filter(n => n !== choiceName);
      props.formRef.current?.setFieldValue(spatialConfigKey, spatialConfigValuesFiltered);
    }
    else props.formRef.current?.setFieldValue(spatialConfigKey, [...spatialConfigValues, choiceName]);
  };

  const onKinIndPresentSelected = () => {
    const kinIndPresentValue = props.formRef.current?.values[kinIndPresentKey];
    if (kinIndPresentValue !== 'yes_kin') props.formRef.current?.setFieldValue(kinIndPresentKey, 'yes_kin');
    props.setChoicesViewKey(kinIndPresentKey);
  };

  return (
    <React.Fragment>
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
        {incohesiveButtons.map(key => {
          return (
            <Button
              containerStyle={formStyles.formButtonContainer}
              buttonStyle={{
                ...formStyles.formButton,
                backgroundColor: props.formRef.current?.values[key] ? REACT_NATIVE_ELEMENTS_BLUE : SECONDARY_BACKGROUND_COLOR,
              }}
              title={() => cohesionText(key)}
              type={'outline'}
              onPress={() => props.setChoicesViewKey(key)}
            />
          );
        })}
      </View>
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
        {cohesiveButtons.map(key => {
          return (
            <Button
              containerStyle={formStyles.formButtonContainer}
              buttonStyle={{
                ...formStyles.formButton,
                backgroundColor: props.formRef.current?.values[key] ? REACT_NATIVE_ELEMENTS_BLUE : SECONDARY_BACKGROUND_COLOR,
              }}
              title={() => cohesionText(key)}
              type={'outline'}
              onPress={() => props.setChoicesViewKey(key)}
            />
          );
        })}
      </View>
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
        {useForm.getChoicesByKey(props.survey, props.choices, spatialConfigKey).map(choice => {
          return (
            <Button
              containerStyle={formStyles.formButtonContainer}
              buttonStyle={{
                ...formStyles.choiceButton,
                backgroundColor: props.formRef.current?.values[spatialConfigKey]?.includes(
                  choice.name) ? REACT_NATIVE_ELEMENTS_BLUE : SECONDARY_BACKGROUND_COLOR,
              }}
              titleStyle={{
                ...props.formRef.current?.values[spatialConfigKey]?.includes(
                  choice.name) ? formStyles.formButtonSelectedTitle : formStyles.formButtonTitle, fontSize: 11,
              }}
              title={choice.label}
              type={'outline'}
              onPress={() => onSpatialConfigSelected(choice.name)}
            />
          );
        })}
      </View>
      {!isEmpty(props.formRef.current?.values[spatialConfigKey]) && (
        <React.Fragment>
          <ListItem containerStyle={commonStyles.listItemFormField}>
            <ListItem.Content>
              <Field
                component={TextInputField}
                name={spatialConfigDescriptionField.name}
                label={spatialConfigDescriptionField.label}
                key={spatialConfigDescriptionField.name}
                appearance={spatialConfigDescriptionField.appearance}
              />
            </ListItem.Content>
          </ListItem>
          <FlatListItemSeparator/>
        </React.Fragment>
      )}
      <Button
        containerStyle={{...formStyles.formButtonContainer, alignItems: 'center'}}
        buttonStyle={{
          ...formStyles.choiceButton,
          backgroundColor: props.formRef.current?.values[kinIndPresentKey] === 'yes_kin' ? REACT_NATIVE_ELEMENTS_BLUE
            : SECONDARY_BACKGROUND_COLOR,
        }}
        titleStyle={{
          ...props.formRef.current?.values[kinIndPresentKey] === 'yes_kin' ? formStyles.formButtonSelectedTitle
            : formStyles.formButtonTitle, fontSize: 11, paddingLeft: 30, paddingRight: 30,
        }}
        title={kinIndPresentField.label}
        type={'outline'}
        onPress={onKinIndPresentSelected}
      />
      <FlatListItemSeparator/>
      <ListItem containerStyle={commonStyles.listItemFormField}>
        <ListItem.Content>
          <Field
            component={TextInputField}
            name={interNotesField.name}
            label={interNotesField.label}
            key={interNotesField.name}
            appearance={interNotesField.appearance}
          />
        </ListItem.Content>
      </ListItem>
      <FlatListItemSeparator/>
      <ListItem containerStyle={commonStyles.listItemFormField}>
        <ListItem.Content>
          <ListItem.Title
            style={{...commonStyles.listItemTitle, fontWeight: 'bold'}}>{tectoniteTypesField.label}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <View style={{backgroundColor: SECONDARY_BACKGROUND_COLOR}}>
        <Slider
          onSlidingComplete={(value) => props.formRef.current?.setFieldValue(tectoniteTypesKey,
            tectoniteTypes.map(c => c.name)[value - 1])}
          value={tectoniteTypes.map(c => c.name).indexOf(props.formRef.current?.values[tectoniteTypesKey]) || undefined}
          step={1}
          maximumValue={tectoniteTypes.length}
          minimumValue={0}
          labels={['None', ...tectoniteTypes.map(c => c.label)]}
          rotateLabels={true}
        />
      </View>
    </React.Fragment>
  );
};

export default FaultRockFabric;
