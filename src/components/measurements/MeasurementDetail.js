import React, {useState, useRef} from 'react';
import {Alert, ScrollView, View} from 'react-native';
import {connect} from 'react-redux';
import {ButtonGroup} from "react-native-elements";
import {spotReducers} from "../../spots/Spot.constants";
import {notebookReducers} from "../notebook-panel/Notebook.constants";
import {Formik} from 'formik';
import FormView from "../form/Form.view";
import {isEmpty} from "../../shared/Helpers";
import SectionDivider from '../../shared/ui/SectionDivider';
import SaveAndCloseButton from '../notebook-panel/ui/SaveAndCloseButtons';
import {getForm, hasErrors, setForm, showErrors, validateForm} from "../form/form.container";
import {formReducers} from "../form/Form.constant";
import {homeReducers, Modals} from "../../views/home/Home.constants";

// Styles
import styles from './measurements.styles';
import * as themes from '../../shared/styles.constants';

const MeasurementDetailPage = (props) => {

  const featureTypes = {
    PLANARLINEAR: 'Planar/Linear',
    TABULAR: 'Tabular Zone',
  };

  const getDefaultSwitchIndex = () => {
    if (props.formData.type === 'planar_orientation' || props.formData.type === 'linear_orientation') return 0;
    else if (props.formData.type === 'tabular_orientation') return 1;
  };

  const [selectedFeatureTypeIndex, setFeatureTypeIndex] = useState(getDefaultSwitchIndex());
  const form = useRef(null);

  // What happens after submitting the form is handled in saveFormAndGo since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

  const onSwitchPress = (i) => {
    console.log(i);
    if (i === 0 && form.current.state.values.type === 'tabular_orientation') {
      Alert.alert('Switch to Planar Orientation',
        'Are you sure you want to switch this measurement to a Planar Orientation? You will lose all ' +
        'non-relevant data for this measurement.',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK', onPress: () => onSwitchToPlanar()
          },
        ],
        {cancelable: false}
      );
    }
    else if (i === 1 && (form.current.state.values.type === 'planar_orientation' ||
      form.current.state.values.type === 'linear_orientation')) {
      Alert.alert('Switch to Tabular Zone',
        'Are you sure you want to switch this measurement to a Tabular Zone? You will lose all ' +
        'non-relevant data for this measurement.',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK', onPress: () => onSwitchToTabularZone()
          },
        ],
        {cancelable: false}
      );
    }
  };

  const onSwitchToPlanar = () => {
    setFeatureTypeIndex(0);
    setForm('measurement', 'planar_orientation');
    form.current.setFieldValue('type', 'planar_orientation', false);
    form.current.validateForm();
  };

  const onSwitchToTabularZone = () => {
    setFeatureTypeIndex(1);
    setForm('measurement', 'tabular_orientation');
    form.current.setFieldValue('type', 'tabular_orientation', false);
    form.current.validateForm();
  };

  // Render the switches to select a feature type or 3D Structure type
  const renderSwitches = () => {
    return (
      <ButtonGroup
        onPress={i => onSwitchPress(i)}
        selectedIndex={selectedFeatureTypeIndex}
        buttons={Object.values(featureTypes)}
        containerStyle={styles.measurementDetailSwitches}
        selectedButtonStyle={{backgroundColor: themes.PRIMARY_ACCENT_COLOR}}
        textStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
      />
    );
  };

  /*  const renderNotesField = () => {
      return (
        <View>
        <SectionDivider dividerText='Notes'/>
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
    };*/

  const renderFormFields = () => {
    console.log('form-data', props.formData);

    setForm('measurement', props.formData.type);
    if (!isEmpty(getForm())) {
      return (
        <View>
          <SectionDivider dividerText='Feature Type'/>
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
        </View>
      );
    }
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => cancelFormAndGo()}
          save={() => saveFormAndGo()}
        />
      </View>
    );
  };

  const cancelFormAndGo = () => {
    if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ) {
      props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS)
    }
    props.setNotebookPageVisibleToPrev();
  };

  const saveFormAndGo = () => {
    if (!isEmpty(getForm())) form.current.submitForm().then(() => {
      if (hasErrors(form)) showErrors(form);
      else {
        console.log('Saving form data to Spot ...');
        let orientations = props.spot.properties.orientation_data;
        const i = orientations.findIndex(orientation => orientation.id === form.current.state.values.id);
        orientations[i] = form.current.state.values;
        props.onSpotEdit('orientation_data', orientations);
        props.setNotebookPageVisibleToPrev();
      }
    });
  };

  return (
    <React.Fragment>
      <View style={styles.measurementsContentContainer}>
        {renderCancelSaveButtons()}
        <ScrollView>
          {renderSwitches()}
          <View>
            {/*{renderNotesField()}*/}
            {renderFormFields()}
          </View>
        </ScrollView>
      </View>
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    formData: state.form.formData,
    modalVisible: state.home.modalVisible
  }
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setNotebookPageVisibleToPrev: () => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE_TO_PREV}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementDetailPage);
