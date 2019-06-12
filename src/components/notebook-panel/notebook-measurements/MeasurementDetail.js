import React, {useState, useRef} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {SpotPages} from "../Notebook.constants";
import {Button, ButtonGroup, Divider, Input} from "react-native-elements";
import {SET_SPOT_PAGE_VISIBLE} from "../../../store/Constants";
import {Formik} from 'formik';
import FormView from "../../form/FormView";
import {isEmpty} from "../../../shared/Helpers";
import SaveAndCloseButton from '../ui/SaveAndCloseButtons';

import survey from '../../form/form-fields/planar-orientation-survey';

// Styles
import commonStyles from '../../../themes/common.styles';
import styles from './MeasurementsStyles';
import * as themes from '../../../themes/ColorThemes';

const MeasurementDetailPage = (props) => {

  const featureTypes = {
    PLANARLINEAR: 'Planar/Linear',
    THREEDSTRUCTURES: '3D Structures',
    TENSOROTHER: 'Tensor/Other'
  };

  const [selectedFeatureTypeIndex, setFeatureTypeIndex] = useState(0);
  const form = useRef(null);

  const updateFeatureTypeIndex = (i) => {
    console.log(i);
    setFeatureTypeIndex(i);
  };

  // Render the switches to select a feature type
  const renderTypeSwitches = () => {
    const buttons = [featureTypes.PLANARLINEAR, featureTypes.THREEDSTRUCTURES, featureTypes.TENSOROTHER];
    return (
      <ButtonGroup
        onPress={updateFeatureTypeIndex}
        selectedIndex={selectedFeatureTypeIndex}
        buttons={buttons}
        containerStyle={styles.measurementDetailSwitches}
        selectedButtonStyle={{backgroundColor: themes.BLUE}}
        textStyle={{color: themes.BLUE}}
      />
    );
  };

  const renderNotesField = () => {
    return (
      <View>
        <Divider style={commonStyles.sectionDivider}>
          <Text style={commonStyles.sectionDividerText}>Notes</Text>
        </Divider>
        <Input
          placeholder='Enter your notes here'
          inputStyle={{backgroundColor: themes.WHITE, fontSize: 16, height: null}}
          inputContainerStyle={{borderBottomWidth: 0}}
          multiline={true}
          numberOfLines={4}
          textAlignVertical={'top'}
        />
      </View>
    );
  };

  const renderFormFields = () => {
    return (
      <View>
        <Divider style={commonStyles.sectionDivider}>
          <Text style={commonStyles.sectionDividerText}>Feature Type</Text>
        </Divider>
        {selectedFeatureTypeIndex === 0 ? renderPlanarLinearFields() : null}
        {selectedFeatureTypeIndex === 1 ? render3DStructuresFields() : null}
        {selectedFeatureTypeIndex === 2 ? renderTensorOtherFields() : null}
      </View>
    );
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => cancelFormAndGo(SpotPages.MEASUREMENT)}
          save={() => saveFormAndGo(SpotPages.MEASUREMENT)}
        />
      </View>

    )


    // return (
    {/*<View style={styles.navButtonsContainer}>*/
    }
    {/*  <View style={styles.leftContainer}>*/
    }
    {/*    <Button*/
    }
    {/*      titleStyle={{color: themes.BLUE}}*/
    }
    {/*      title={'Cancel'}*/
    }
    {/*      type={'clear'}*/
    }
    {/*      onPress={() => cancelFormAndGo(SpotPages.MEASUREMENT)}*/
    }
    {/*    />*/
    }
    {/*  </View>*/
    }
    {/*  <View style={styles.rightContainer}>*/
    }
    {/*    <Button*/
    }
    {/*      titleStyle={{color: themes.BLUE}}*/
    }
    {/*      title={'Save'}*/
    }
    {/*      type={'clear'}*/
    }
    {/*      onPress={() => saveFormAndGo(SpotPages.MEASUREMENT)}*/
    }
    {/*    />*/
    }
    {/*  </View>*/
    }
    {/*</View>*/
    }
    // );
  };

  const renderPlanarLinearFields = () => {
    console.log('spot', props.spot);
    return (
      <View>
        <Formik
          ref={form}
          //onSubmit={onSubmitForm}
          validate={validateForm}
          component={FormView}
          initialValues={props.spot.properties.orientations[0]}
          validateOnChange={false}
        />
      </View>
    );
  };

  const render3DStructuresFields = () => {
    return (
      <View>
        <Text>3D Structures form goes here</Text>
      </View>
    );
  };

  const renderTensorOtherFields = () => {
    return (
      <View>
        <Text>Tensor and Other forms goes here</Text>
      </View>
    );
  };

  const cancelFormAndGo = (pageToGoTo) => {
    props.setPageVisible(pageToGoTo);
  };

  const saveFormAndGo = (pageToGoTo) => {
    form.current.submitForm().then(() => {
      if (!isEmpty(form.current.state.errors)) {
        Alert.alert('Errors in Form', JSON.stringify(form.current.state.errors));
      }
      else {
        console.log('form data', form.current.state.values);
        props.setPageVisible(pageToGoTo);
      }
    });
  };

  const validateForm = (data) => {
    console.log('Validating Form with', data);
    const errors = {};

    survey.forEach(fieldModel => {
      const key = fieldModel.name;
      const value = data[key];
      if (value && typeof value === 'string') data[key] = value.trim();
      if (data.hasOwnProperty(key) && isEmpty(value)) delete data[key];
      if (!value && fieldModel.required) errors[key] = 'Required';
      else if (value) {
        if (fieldModel.type === 'integer') data[key] = parseInt(value);
        else if (fieldModel.type === 'decimal') data[key] = parseFloat(value);
        if (fieldModel.constraint) {
          // Max constraint
          // Look for <= in constraint, followed by a space and then any number of digits (- preceding the digits is optional)
          let regexMax = /<=\s(-?\d*)/i;
          let parsedConstraint = fieldModel.constraint.match(regexMax);
          if (parsedConstraint) {
            let max = parseFloat(parsedConstraint[1]);
            if (!isEmpty(max) && !(value <= max)) errors[key] = fieldModel.constraint_message;
          }
          else {
            // Look for < in constraint
            regexMax = /<\s(-?\d*)/i;
            let parsedConstraint = fieldModel.constraint.match(regexMax);
            if (parsedConstraint) {
              let max = parseFloat(parsedConstraint[1]);
              if (!isEmpty(max) && !(value < max)) errors[key] = fieldModel.constraint_message;
            }
          }
          // Min constraint
          // Look for <= in constraint, followed by a space and then any number of digits (- preceding the digits is optional)
          let regexMin = />=\s(-?\d*)/i;
          parsedConstraint = fieldModel.constraint.match(regexMin);
          if (parsedConstraint) {
            let min = parseFloat(parsedConstraint[1]);
            if (!isEmpty(min) && !(value >= min)) errors[key] = fieldModel.constraint_message;
          }
          else {
            // Look for < in constraint
            regexMin = />\s(-?\d*)/i;
            let parsedConstraint = fieldModel.constraint.match(regexMin);
            if (parsedConstraint) {
              let min = parseFloat(parsedConstraint[1]);
              if (!isEmpty(min) && !(value > min)) errors[key] = fieldModel.constraint_message;
            }
          }
        }
      }
    });

    console.log('Data after validation:', data, 'Errors:', errors);
    return errors;
  };

  return (
    <React.Fragment>
      <View style={styles.measurementDetailContainer}>
        {renderCancelSaveButtons()}
        <ScrollView style={{backgroundColor: themes.WHITE}}>
          <View style={styles.measurementDetailSwitchesContainer}>
            {renderTypeSwitches()}
          </View>
          <View>
            {renderNotesField()}
            {renderFormFields()}
          </View>
        </ScrollView>
      </View>
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.home.selectedSpot
  }
}

const mapDispatchToProps = {
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementDetailPage);
