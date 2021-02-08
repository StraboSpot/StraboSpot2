import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, Text, View} from 'react-native';

import {Formik} from 'formik';
import {Button, ButtonGroup, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId, isEmpty, roundToDecimalPlaces, toDegrees, toRadians} from '../../shared/Helpers';
import {WARNING_COLOR, PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible, setNotebookPageVisibleToPrev} from '../notebook-panel/notebook.slice';
import {editedSpotProperties, setSelectedAttributes} from '../spots/spots.slice';
import MeasurementItem from './MeasurementItem';
import styles from './measurements.styles';
import useMeasurementsHook from './useMeasurements';

const MeasurementDetailPage = (props) => {
  const dispatch = useDispatch();
  const [useForm] = useFormHook();
  const [formName, setFormName] = useState([]);
  const spot = useSelector(state => state.spot.selectedSpot);
  const selectedMeasurements = useSelector(state => state.spot.selectedAttributes);
  const [activeMeasurement, setActiveMeasurement] = useState(null);
  const formRef = useRef(null);
  const [useMeasurements] = useMeasurementsHook();

  useEffect(() => {
    return () => confirmLeavePage();
  }, []);

  useEffect(() => {
    console.log('UE for selectedMeasurements changed in MeasurementDetailPage', selectedMeasurements);
    if (selectedMeasurements && selectedMeasurements[0]) switchActiveMeasurement(selectedMeasurements[0]);
    else dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.MEASUREMENT));
  }, [selectedMeasurements]);

  const addAssociatedMeasurement = (type) => {
    const newId = getNewId();
    const newAssociatedMeasurement = {type: type, id: newId};
    const selectedMeasurementCopy = JSON.parse(JSON.stringify(selectedMeasurements[0]));
    if (!selectedMeasurementCopy.associated_orientation) selectedMeasurementCopy.associated_orientation = [];
    selectedMeasurementCopy.associated_orientation.push(newAssociatedMeasurement);

    console.log('Saving form data to Spot ...');
    let orientationDataCopy = JSON.parse(JSON.stringify(spot.properties.orientation_data));
    orientationDataCopy.forEach((measurement, i) => {
      if (measurement.id === selectedMeasurementCopy.id) orientationDataCopy[i] = selectedMeasurementCopy;
    });
    dispatch(editedSpotProperties({field: 'orientation_data', value: orientationDataCopy}));
    dispatch(setSelectedAttributes([selectedMeasurementCopy]));
    switchActiveMeasurement(newAssociatedMeasurement);
  };

  const calcTrendPlunge = (value) => {
    console.log('Calculating trend and plunge...');
    const strike = selectedMeasurements[0].strike;
    const dip = selectedMeasurements[0].dip;
    const rake = value;
    let trend;
    const beta = toDegrees(Math.atan(Math.tan(toRadians(rake)) * Math.cos(toRadians(dip))));
    if (rake <= 90) trend = strike + beta;
    else {
      trend = 180 + strike + beta;
      if (trend >= 360) trend = trend - 360;
    }
    const plunge = toDegrees(Math.asin(Math.sin(toRadians(dip)) * Math.sin(toRadians(rake))));
    formRef.current.setFieldValue('trend', roundToDecimalPlaces(trend, 0));
    formRef.current.setFieldValue('plunge', roundToDecimalPlaces(plunge, 0));
  };

  const cancelFormAndGo = async () => {
    await formRef.current.resetForm();
    if (isEmptyMeasurement(selectedMeasurements[0])) {
      const aOs = selectedMeasurements[0].associated_orientation || [];
      useMeasurements.deleteMeasurements([...aOs, selectedMeasurements[0]]);
    }
    dispatch(setNotebookPageVisibleToPrev());
  };

  const confirmDeleteMeasurement = () => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this measurement?',
      [{
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      }, {
        text: 'OK',
        onPress: () => deleteMeasurement(),
      }],
      {cancelable: false},
    );
  };

  const confirmLeavePage = () => {
    if (formRef.current && formRef.current.dirty) {
      const formCurrent = formRef.current;
      Alert.alert('Unsaved Changes',
        'Would you like to save your data before continuing?',
        [{
          text: 'No',
          style: 'cancel',
        }, {
          text: 'Yes',
          onPress: () => saveForm(formCurrent),
        }],
        {cancelable: false},
      );
    }
  };

  // Delete a single measurement
  const deleteMeasurement = () => {
    try {
      useMeasurements.deleteMeasurements([activeMeasurement]);
      dispatch(setNotebookPageVisibleToPrev());
    }
    catch (e) {
      console.log('Unable to delete measurement.');
    }
  };

  const isEmptyMeasurement = (measurement) => {
    return isEmpty(measurement)
      || (!isEmpty(measurement) && ((Object.keys(measurement).length === 2 && measurement.id && measurement.type)
        || (Object.keys(measurement).length === 3 && measurement.id && measurement.type
          && measurement.associated_orientation
          && isEmpty(measurement.associated_orientation.filter(aO => !isEmptyMeasurement(aO))))));
  };

  const onMyChange = async (name, value) => {
    //console.log(name, 'changed to', value);
    if (name === 'rake' && !isEmpty(value) && activeMeasurement.type === 'linear_orientation'
      && selectedMeasurements[0].id !== activeMeasurement.id && !isEmpty(selectedMeasurements[0].strike)
      && !isEmpty(selectedMeasurements[0].dip) && value >= 0 && value <= 180) calcTrendPlunge(value);
    await formRef.current.setFieldValue(name, value);
  };

  // Confirm switching the active measurement
  const onSwitchActiveMeasurement = (measurement) => {
    if (measurement.id !== activeMeasurement.id) {
      if (formRef.current.dirty) {
        Alert.alert('Unsaved Changes',
          'Would you like to save your data before continuing?',
          [{
            text: 'No',
            onPress: () => switchActiveMeasurement(measurement),
            style: 'cancel',
          }, {
            text: 'Yes',
            onPress: () => saveFormAndSwitchActiveMeasurement(measurement),
          }],
          {cancelable: false},
        );
      }
      else switchActiveMeasurement(measurement);
    }
  };

  // Confirm switch between Planar and Tabular Zone
  const onSwitchPlanarTabular = (i) => {
    const currentType = formRef.current.values.type;
    if ((i === 0 && currentType === 'tabular_orientation') || (i === 1 && currentType === 'planar_orientation')) {
      const newType = currentType === 'tabular_orientation' ? 'planar_orientation' : 'tabular_orientation';
      const typeText = newType === 'tabular_orientation' ? 'Tabular Zone' : 'Planar Orientation';
      const alertTextEnd = selectedMeasurements.length === 1 ? 'this measurement to a ' + typeText + '? You will '
        + 'lose all data for this measurement not relevant to ' + typeText + '.'
        : 'these measurements to ' + typeText + '? You will lose all data for these measurements not relevant to '
        + typeText + '.';
      Alert.alert('Switch to ' + typeText, 'Are you sure you want to switch ' + alertTextEnd,
        [{
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        }, {
          text: 'OK', onPress: () => switchPlanarTabular(newType),
        }],
        {cancelable: false},
      );
    }
  };

  // Switch the active measurement
  const switchActiveMeasurement = (measurement) => {
    setActiveMeasurement(measurement);
    const formCategory = selectedMeasurements.length === 1 ? 'measurement' : 'measurement_bulk';
    setFormName([formCategory, measurement.type]);
  };

  // Switch between Planar and Tabular Zone
  const switchPlanarTabular = (type) => {
    const modifiedMeasurement = {...formRef.current.values, type: type};
    switchActiveMeasurement(modifiedMeasurement);
  };

  const renderAssociatedMeasurements = () => {
    return (
      <View>
        {/* Primary measurement */}
        {activeMeasurement && selectedMeasurements && selectedMeasurements[0]
        && selectedMeasurements[0].associated_orientation && (
          <React.Fragment>
            <MeasurementItem
              item={selectedMeasurements[0]}
              selectedIds={[activeMeasurement.id]}
              isAssociatedItem={false}
              isAssociatedList={true}
              onPress={() => onSwitchActiveMeasurement(selectedMeasurements[0])}
            />
            <FlatListItemSeparator/>
          </React.Fragment>
        )}

        {/* Associated measurements */}
        {activeMeasurement && selectedMeasurements && selectedMeasurements[0]
        && selectedMeasurements[0].associated_orientation && (
          selectedMeasurements[0].associated_orientation.map((item, i) =>
            <React.Fragment>
              <MeasurementItem
                item={item}
                selectedIds={[activeMeasurement.id]}
                isAssociatedItem={true}
                isAssociatedList={true}
                onPress={() => onSwitchActiveMeasurement(item)}
                key={item.id}
              />
              <FlatListItemSeparator/>
            </React.Fragment>,
          )
        )}

        {/* Buttons to add an associated measurement */}
        {selectedMeasurements && selectedMeasurements[0] && selectedMeasurements[0].type === 'linear_orientation' && (
          <Button
            titleStyle={styles.buttonText}
            title={'+ Add Associated Plane'}
            type={'clear'}
            onPress={() => addAssociatedMeasurement('planar_orientation')}
          />
        )}
        {selectedMeasurements && selectedMeasurements[0] && (selectedMeasurements[0].type === 'planar_orientation'
          || selectedMeasurements[0].type === 'tabular_orientation') && (
          <Button
            titleStyle={styles.buttonText}
            title={'+ Add Associated Line'}
            type={'clear'}
            onPress={() => addAssociatedMeasurement('linear_orientation')}
          />
        )}
      </View>
    );
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

  const renderFormFields = () => {
    console.log('Rendering form:', formName[0] + '.' + formName[1],
      'with selected measurement' + (selectedMeasurements.length > 1 ? 's:' : ':'), selectedMeasurements,
      'and active measurement:', activeMeasurement);
    return (
      <View>
        <SectionDivider dividerText='Feature Type'/>
        <View style={{flex: 1}}>
          <Formik
            innerRef={formRef}
            onSubmit={() => console.log('Submitting form...')}
            onReset={() => console.log('Resetting form...')}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            children={(formProps) => (
              <Form {...formProps} {...{formName: formName, onMyChange: onMyChange}}/>
            )}
            initialValues={activeMeasurement}
            validateOnChange={true}
            enableReinitialize={true}
          />
        </View>
      </View>
    );
  };

  const renderMultiMeasurementsBar = () => {
    const mainText = selectedMeasurements[0].type === 'linear_orientation' ? 'Multiple Lines' : 'Multiple Planes';
    const propertyText = selectedMeasurements[0].type === 'linear_orientation' ? 'Plunge -> Trend' : 'Strike/Dip';
    const hasAssociated = selectedMeasurements[0].associated_orientation && selectedMeasurements[0].associated_orientation.length > 0;
    const mainText2 = hasAssociated && selectedMeasurements[0].associated_orientation[0].type === 'linear_orientation' ? 'Multiple Lines' : 'Multiple Planes';
    const propertyText2 = hasAssociated && selectedMeasurements[0].associated_orientation[0].type === 'linear_orientation' ? 'Plunge -> Trend' : 'Strike/Dip';

    return (
      <View>
        <ListItem
          containerStyle={activeMeasurement.id === selectedMeasurements[0].id && commonStyles.listItemInverse}
          onPress={() => onSwitchActiveMeasurement(selectedMeasurements[0])}
          pad={5}>
          <ListItem.Content>
            <ListItem.Title
              style={activeMeasurement.id === selectedMeasurements[0].id ? commonStyles.listItemTitleInverse
                : commonStyles.listItemTitle}>{mainText}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Content>
            <ListItem.Title
              style={activeMeasurement.id === selectedMeasurements[0].id ? commonStyles.listItemTitleInverse
                : commonStyles.listItemTitle}
            >
              {propertyText}
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {hasAssociated && (
          <ListItem
            containerStyle={activeMeasurement.id === selectedMeasurements[0].associated_orientation[0].id && commonStyles.listItemInverse}
            onPress={() => onSwitchActiveMeasurement(selectedMeasurements[0].associated_orientation[0])}
            pad={5}
          >
            <ListItem.Content>
              <ListItem.Title
                style={activeMeasurement.id === selectedMeasurements[0].associated_orientation[0].id
                  ? commonStyles.listItemTitleInverse : commonStyles.listItemTitle}
              >
                {mainText2}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Content>
              <ListItem.Title
                style={activeMeasurement.id === selectedMeasurements[0].associated_orientation[0].id
                  ? commonStyles.listItemTitleInverse : commonStyles.listItemTitle}
              >
                {propertyText2}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
        {hasAssociated && (
          <Text style={styles.basicText}>Only one associated line or plane can be classified in bulk</Text>
        )}
        <View style={{paddingBottom: 15}}/>
      </View>
    );
  };

  // Render the buttons to switch between planar and tabular zone orientations
  const renderPlanarTabularSwitches = () => {
    return (
      <ButtonGroup
        onPress={i => onSwitchPlanarTabular(i)}
        selectedIndex={activeMeasurement.type === 'planar_orientation' ? 0 : 1}
        buttons={['Planar Feature', 'Tabular Zone']}
        containerStyle={styles.measurementDetailSwitches}
        selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
        textStyle={{color: PRIMARY_ACCENT_COLOR}}
      />
    );
  };

  const saveForm = async (formCurrent) => {
    await formCurrent.submitForm();
    if (useForm.hasErrors(formCurrent)) {
      useForm.showErrors(formCurrent);
      console.log('Found validation errors.');
      throw Error;
    }
    console.log('Saving form data to Spot ...');
    let orientationDataCopy = JSON.parse(JSON.stringify(spot.properties.orientation_data));
    let formValues = {...formCurrent.values};
    let editedSelectedMeasurements = [];
    let idsOfMeasurementsToEdit = [formValues.id];
    if (selectedMeasurements.length > 1) {
      const fieldsToExclude = ['id', 'associated_orientation', 'label', 'strike', 'dip_direction', 'dip', 'quality',
        'trend', 'plunge', 'rake', 'rake_calculated'];
      fieldsToExclude.forEach(key => delete formValues[key]);
      if (formValues.id === selectedMeasurements[0].id) {
        idsOfMeasurementsToEdit = selectedMeasurements.map(measurement => measurement.id);
      }
      else {
        idsOfMeasurementsToEdit = selectedMeasurements.reduce(
          (acc, measurement) => [...acc, ...measurement.associated_orientation.map(
            associatedOrientation => associatedOrientation.id)], []);
      }
    }

    orientationDataCopy.forEach((measurement, i) => {
      if (idsOfMeasurementsToEdit.includes(measurement.id)) {
        orientationDataCopy[i] = selectedMeasurements.length === 1 ? formValues : {...measurement, ...formValues};
        editedSelectedMeasurements.push(orientationDataCopy[i]);
      }
      else if (measurement.associated_orientation) {
        measurement.associated_orientation.forEach((associatedMeasurement, j) => {
          if (idsOfMeasurementsToEdit.includes(associatedMeasurement.id)) {
            orientationDataCopy[i].associated_orientation[j] = selectedMeasurements.length === 1 ? formValues
              : {...associatedMeasurement, ...formValues};
            editedSelectedMeasurements.push(orientationDataCopy[i]);
          }
        });
      }
    });
    dispatch(setSelectedAttributes(editedSelectedMeasurements));
    dispatch(editedSpotProperties({field: 'orientation_data', value: orientationDataCopy}));
    await formCurrent.resetForm();
    console.log('Finished saving form data to Spot');
  };

  const saveFormAndGo = async () => {
    try {
      await saveForm(formRef.current);
      dispatch(setNotebookPageVisibleToPrev());
    }
    catch (e) {
      console.log('Error saving form data to Spot');
    }
  };

  const saveFormAndSwitchActiveMeasurement = async (measurement) => {
    try {
      await saveForm(formRef.current);
      switchActiveMeasurement(measurement);
    }
    catch (e) {
      console.log('Error saving form data to Spot');
    }
  };

  return (
    <React.Fragment>
      {activeMeasurement && (
        <View style={styles.measurementsContentContainer}>
          {renderCancelSaveButtons()}
          <FlatList
            ListHeaderComponent={
              <View>
                {activeMeasurement && selectedMeasurements.length === 1 && renderAssociatedMeasurements()}
                {activeMeasurement && selectedMeasurements.length > 1 && renderMultiMeasurementsBar()}
                {activeMeasurement && (activeMeasurement.type === 'planar_orientation'
                  || activeMeasurement.type === 'tabular_orientation') && renderPlanarTabularSwitches()}
                <View>
                  {!isEmpty(formName) && renderFormFields()}
                </View>
                {selectedMeasurements.length === 1 && (
                  <Button
                    titleStyle={{color: WARNING_COLOR}}
                    title={'Delete Measurement'}
                    type={'clear'}
                    onPress={() => confirmDeleteMeasurement()}
                  />
                )}
              </View>
            }
          />
        </View>
      )}
    </React.Fragment>
  );
};

export default MeasurementDetailPage;
