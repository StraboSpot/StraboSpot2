import React, {useState, useRef} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {SpotPages} from "../Notebook.constants";
import {Button, ButtonGroup, Divider, Input} from "react-native-elements";
import {EDIT_SPOT_PROPERTIES, SET_SPOT_PAGE_VISIBLE} from "../../../store/Constants";
import {Formik} from 'formik';
import FormView from "../../form/Form.view";
import {isEmpty} from "../../../shared/Helpers";
import SaveAndCloseButton from '../ui/SaveAndCloseButtons';
import {getSurveyFieldLabel, validateForm} from "../../form/form.container";

// Styles
import commonStyles from '../../../themes/common.styles';
import styles from './MeasurementsStyles';
import * as themes from '../../../themes/ColorThemes';
import * as actionCreators from "../../../store/actions";

const MeasurementDetailPage = (props) => {

  const featureTypes = {
    PLANARLINEAR: 'Planar/Linear',
    THREEDSTRUCTURES: '3D Structures',
    TENSOROTHER: 'Tensor/Other'
  };

  const [selectedFeatureTypeIndex, setFeatureTypeIndex] = useState(0);
  const form = useRef(null);

  // This function doesn't do anything but is needed
  // What happens after submitting the form is handled in saveFormAndGo
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

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
    );
  };

  const renderPlanarLinearFields = () => {
    console.log('spot', props.spot);
    return (
      <View>
        <Formik
          ref={form}
          onSubmit={onSubmitForm}
          validate={validateForm}
          component={FormView}
          initialValues={props.formData}
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
      console.log('In promise in saveFormAndGo');
      if (!isEmpty(form.current.state.errors)) {
        let errorMessages = [];
        for (const [name, error] of Object.entries(form.current.state.errors)) {
          errorMessages.push(getSurveyFieldLabel(name) + ': ' + error);
        }
        Alert.alert('Please Fix the Following Errors', errorMessages.join('\n'));
      }
      else {
        let orientations = props.spot.properties.orientations;
        const i = orientations.findIndex(orientation => orientation.id === form.current.state.values.id);
        orientations[i] = form.current.state.values;
        props.onSpotEdit('orientations', orientations);
        props.setPageVisible(pageToGoTo);
      }
    });
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
    spot: state.home.selectedSpot,
    formData: state.form.formData
  }
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setPageVisible: (page) => ({type: SET_SPOT_PAGE_VISIBLE, page: page}),
  setFormData: (formData) => (actionCreators.setFormData(formData))
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementDetailPage);
