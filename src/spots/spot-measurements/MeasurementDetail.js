import React, {useState, useRef} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";
import {Button, ButtonGroup, Divider, Input} from "react-native-elements";
import {SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import styles from './MeasurementsStyles';
import * as themes from '../../themes/ColorThemes';
import spotPageStyles from "../spot-page/SpotPageStyles";
import {Formik} from 'formik';
import FormView from "../../components/form/FormView";
import {isEmpty} from "../../shared/Helpers";

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

  const onSubmitForm = ({firstName, lastName}) => {
    if (!isEmpty(form.current.state.errors)) Alert.alert('Errors in Form', JSON.stringify(form.current.state.errors));
    else {
      console.log(`firstName: ${firstName}`);
      console.log(`lastName: ${lastName}`);
    }
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
        <Divider style={spotPageStyles.divider}>
          <Text style={spotPageStyles.spotDividerText}>Notes</Text>
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
        <Divider style={spotPageStyles.divider}>
          <Text style={spotPageStyles.spotDividerText}>Feature Type</Text>
        </Divider>
        {selectedFeatureTypeIndex === 0 ? renderPlanarLinearFields() : null}
        {selectedFeatureTypeIndex === 1 ? render3DStructuresFields() : null}
        {selectedFeatureTypeIndex === 2 ? renderTensorOtherFields() : null}
      </View>
    );
  };

  const renderCancelSaveButtons = () => {
    return (
      <View style={styles.navButtonsContainer}>
        <View style={styles.leftContainer}>
          <Button
            titleStyle={{color: themes.BLUE}}
            title={'Cancel'}
            type={'clear'}
            onPress={() => cancelFormAndGo(SpotPages.MEASUREMENT)}
          />
        </View>
        <View style={styles.rightContainer}>
          <Button
            titleStyle={{color: themes.BLUE}}
            title={'Save'}
            type={'clear'}
            onPress={() => saveFormAndGo(SpotPages.MEASUREMENT)}
          />
        </View>
      </View>
    );
  };

  const renderPlanarLinearFields = () => {
    return (
      <View>
        <Formik
          ref={form}
          onSubmit={onSubmitForm}
          validate={validateForm}
          component={FormView}
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
    form.current.executeSubmit();
    props.setPageVisible(pageToGoTo);
  };

  const validateForm = ({firstName, lastName}) => {
    const errors = {};
    if (firstName === undefined) {
      errors.firstName = 'Required';
    }
    else if (firstName.trim() === '') {
      errors.firstName = 'Must not be blank';
    }
    if (lastName === undefined) {
      errors.lastName = 'Required';
    }
    else if (lastName.trim() === '') {
      errors.lastName = 'Must not be blank';
    }
    return errors;
  };

  return (
    <React.Fragment>
      <View style={styles.measurementDetailContainer}>
        {renderCancelSaveButtons()}
        <View style={styles.measurementDetailSwitchesContainer}>
          {renderTypeSwitches()}
        </View>
        <ScrollView style={{backgroundColor: themes.WHITE}}>
          {renderNotesField()}
          {renderFormFields()}
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
