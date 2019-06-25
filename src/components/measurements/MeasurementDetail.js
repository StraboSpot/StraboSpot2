import React, {useState, useRef} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {SpotPages} from "../notebook-panel/Notebook.constants";
import {ButtonGroup} from "react-native-elements";
import {EDIT_SPOT_PROPERTIES, SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import {Formik} from 'formik';
import FormView from "../form/Form.view";
import {isEmpty} from "../../shared/Helpers";
import SectionDivider from '../../shared/ui/SectionDivider';
import SaveAndCloseButton from '../notebook-panel/ui/SaveAndCloseButtons';
import {getSurveyFieldLabel, getForm, setForm, validateForm} from "../form/form.container";

// Styles
import styles from './measurements.styles';
import * as themes from '../../themes/ColorThemes';
import * as actionCreators from "../../store/actions";

const MeasurementDetailPage = (props) => {

  const featureTypes = {
    PLANARLINEAR: 'Planar/Linear',
    TABULAR: 'Tabular Zone',
  };

  const getDefaultSwitchIndex = () => {
    if (props.formData.type === 'planar_orientation' || props.formData.type === 'linear_orientation') return 0;
    else if (props.formData.type === 'tabular_zone_orientation') return 1;
  };

  const [selectedFeatureTypeIndex, setFeatureTypeIndex] = useState(getDefaultSwitchIndex());
  const form = useRef(null);

  // This function doesn't do anything but is needed
  // What happens after submitting the form is handled in saveFormAndGo
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
  };

  const onSwitchPress = (i) => {
    console.log(i);
    if (i === 1 && props.formData.type === 'planar_orientation') {
      Alert.alert('Switch to Tabular Zone',
        'Are you sure you want to switch this measurement to a Tabular Zone? You will lose all data for ' +
        'this measurement except strike, dip direction, dip.',
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
    else if (i === 1 && props.formData.type === 'linear_orientation') {
      Alert.alert('Switch to Tabular Zone',
        'Are you sure you want to switch this measurement to a Tabular Zone? You will lose all data for ' +
        'this measurement.',
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

  const onSwitchToTabularZone = () => {
    setFeatureTypeIndex(1);
    Alert.alert('To Do', 'This will switch to Tabular Zone');
  };

  // Render the switches to select a feature type or 3D Structure type
  const renderSwitches = () => {
    return (
      <ButtonGroup
        onPress={i => onSwitchPress(i)}
        selectedIndex={selectedFeatureTypeIndex}
        buttons={Object.values(featureTypes)}
        containerStyle={styles.measurementDetailSwitches}
        selectedButtonStyle={{backgroundColor: themes.BLUE}}
        textStyle={{color: themes.BLUE}}
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
    if (props.formData.type === 'planar_orientation') {
      setForm('measurement', 'planar_orientation');
    }
    else if (props.formData.type === 'linear_orientation') {
      setForm('measurement', 'linear_orientation');
    }
    else if (props.formData.type === 'tabular_zone_orientation') {
      setForm('measurement', 'tabular_zone_orientation');
    }

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
          cancel={() => cancelFormAndGo(SpotPages.MEASUREMENT)}
          save={() => saveFormAndGo(SpotPages.MEASUREMENT)}
        />
      </View>
    );
  };

  const cancelFormAndGo = (pageToGoTo) => {
    props.setPageVisible(pageToGoTo);
  };

  const saveFormAndGo = (pageToGoTo) => {
    if (!isEmpty(getForm())) {
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
    }
  };

  return (
    <React.Fragment>
      <View style={styles.measurementDetailContainer}>
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
