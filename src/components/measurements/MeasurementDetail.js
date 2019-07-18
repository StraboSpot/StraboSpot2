import React, {useState, useRef} from 'react';
import {Alert, FlatList, ScrollView, View} from 'react-native';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from "react-native-elements";
import {spotReducers} from "../../spots/Spot.constants";
import {notebookReducers} from "../notebook-panel/Notebook.constants";
import {Formik} from 'formik';
import FormView from "../form/Form.view";
import {getNewId, isEmpty} from "../../shared/Helpers";
import SectionDivider from '../../shared/ui/SectionDivider';
import SaveAndCloseButton from '../notebook-panel/ui/SaveAndCloseButtons';
import {getForm, hasErrors, setForm, showErrors, validateForm} from "../form/form.container";
import {formReducers} from "../form/Form.constant";
import {homeReducers, Modals} from "../../views/home/Home.constants";
import MeasurementItem from "./MeasurementItem";

// Styles
import styles from './measurements.styles';
import * as themes from '../../shared/styles.constants';

const MeasurementDetailPage = (props) => {

  const featureTypes = {
    PLANAR: 'Planar Feature',
    TABULAR: 'Tabular Zone',
  };

  const getDefaultSwitchIndex = () => {
    if (props.formData.type === 'planar_orientation') return 0;
    else if (props.formData.type === 'tabular_orientation') return 1;
  };

  const [selectedFeatureTypeIndex, setFeatureTypeIndex] = useState(getDefaultSwitchIndex());
  const [selectedFeatureId, setSelectedFeatureId] = useState(props.formData.id);
  const form = useRef(null);

  // What happens after submitting the form is handled in saveFormAndGo since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

  const onSwitchFeature = (item) => {
    if (form.current.getFormikBag().dirty) {
      Alert.alert('Unsaved Changes',
        'Would you like to save your data before continuing?',
        [
          {
            text: 'No',
            onPress: () => switchFeature(item),
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              saveForm().then(() => {
                switchFeature(item)
              });
            },
          },
        ],
        {cancelable: false}
      );
    }
    else switchFeature(item)
  };

  const switchFeature = (item) => {
    props.setFormData(item);
    setSelectedFeatureId(item.id)
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
    else if (i === 1 && form.current.state.values.type === 'planar_orientation') {
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
    props.setFormData({...form.current.state.values, type: 'planar_orientation'});
    setFeatureTypeIndex(0);
  };

  const onSwitchToTabularZone = () => {
    props.setFormData({...form.current.state.values, type: 'tabular_orientation'});
    setFeatureTypeIndex(1);
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
          <View style={styles.measurementsSectionDividerContainer}>
          <SectionDivider dividerText='Feature Type'/>
        </View>
          <View>
            <Formik
              ref={form}
              onSubmit={onSubmitForm}
              validate={validateForm}
              component={FormView}
              initialValues={props.formData}
              validateOnChange={false}
              enableReinitialize={true}
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

  const renderAssociatedFeatures = () => {
    const selectedOrientation = getSelectedOrientationInfo();
    return (
      <View>
        {selectedOrientation.associatedOrientations &&
        <FlatList
          data={selectedOrientation.associatedOrientations}
          renderItem={item => <MeasurementItem item={item}
                                               selectedId={selectedFeatureId}
                                               isAssociatedList={true}
                                               isAssociatedItem={item.item.id !== selectedOrientation.data.id}
                                               switchFeature={() => onSwitchFeature(item.item)}/>}
          keyExtractor={(item, index) => index.toString()}
        />}
        {selectedOrientation.data.type === 'linear_orientation' &&
        <Button
          titleStyle={styles.buttonText}
          title={'+ Add Associated Plane'}
          type={'clear'}
          onPress={() => addAssociatedFeature('planar_orientation')}
        />}
        {(selectedOrientation.data.type === 'planar_orientation' || selectedOrientation.data.type === 'tabular_orientation') &&
        <Button
          titleStyle={styles.buttonText}
          title={'+ Add Associated Line'}
          type={'clear'}
          onPress={() => addAssociatedFeature('linear_orientation')}
        />}
      </View>
    );
  };

  const addAssociatedFeature = (type) => {
    console.log(props.formData);
    const newId = getNewId();
    const newAssociatedOrientation = {type: type, id: newId};
    const selectedOrientation = getSelectedOrientationInfo();
    let orientations = props.spot.properties.orientation_data;
    if (!orientations[selectedOrientation.i].associated_orientation) {
      orientations[selectedOrientation.i].associated_orientation = [];
    }
    orientations[selectedOrientation.i].associated_orientation.push(newAssociatedOrientation);
    props.onSpotEdit('orientation_data', orientations);
    props.setFormData(newAssociatedOrientation);
    setSelectedFeatureId(newId);
  };

  // Get the data for the selected orientation, and whether it's a main orientation or an associated orientation.
  // Get applicable index (or indexes if an associate orientation).
  // Get all the associated orientations (main orientation and associated orientations).
  const getSelectedOrientationInfo = () => {
    let orientations = props.spot.properties.orientation_data;
    let iO = undefined;
    let iAO = undefined;
    orientations.forEach((orientation, i) => {
      if (!iO && orientation.id === props.formData.id) iO = i;
      else if (!iO && orientation.associated_orientation) {
        orientation.associated_orientation.forEach((associatedOrientation, j) => {
          if (associatedOrientation.id === props.formData.id) {
            iO = i;
            iAO = j;
          }
        });
      }
    });
    if (!iO) iO = 0;
    let associatedOrientations = orientations[iO].associated_orientation ? [orientations[iO], ...orientations[iO].associated_orientation] : undefined;
    return {data: orientations[iO], i: iO, iAssociated: iAO, associatedOrientations: associatedOrientations};
  };

  const cancelFormAndGo = () => {
    if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS)
    }
    props.setNotebookPageVisibleToPrev();
  };

  const saveForm = async () => {
    if (!isEmpty(getForm())) {
      return form.current.submitForm().then(() => {
        if (hasErrors(form)) {
          showErrors(form);
          return Promise.reject();
        }
        else {
          console.log('Saving form data to Spot ...');
          let orientations = props.spot.properties.orientation_data;
          const selectedOrientation = getSelectedOrientationInfo();
          if (!isEmpty(selectedOrientation.i) && !isEmpty(selectedOrientation.iAssociated)) {
            orientations[selectedOrientation.i].associated_orientation[selectedOrientation.iAssociated] = form.current.state.values;
          }
          else orientations[selectedOrientation.i] = form.current.state.values;
          props.onSpotEdit('orientation_data', orientations);
          return Promise.resolve();
        }
      }, (e) => {
        console.log('Error submitting form', e);
        return Promise.reject();
      });
    }
    else {
      console.log('No form to save');
      return Promise.reject();
    }
  };

  const saveFormAndGo = () => {
    saveForm().then(() => {
      console.log('Finished saving form data to Spot');
      if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
        props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS)
      }
      props.setNotebookPageVisibleToPrev();
    }, () => {
      console.log('Error saving form data to Spot');
    });
  };

  return (
    <React.Fragment>
      <View style={styles.measurementsContentContainer}>
        {renderCancelSaveButtons()}
        <ScrollView>
          {renderAssociatedFeatures()}
          {(props.formData.type === 'planar_orientation' || props.formData.type === 'tabular_orientation') && renderSwitches()}
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
  setFormData: (formData) => ({type: formReducers.SET_FORM_DATA, formData: formData}),
  setNotebookPageVisibleToPrev: () => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE_TO_PREV}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementDetailPage);
