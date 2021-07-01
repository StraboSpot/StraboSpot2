import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Alert, FlatList, Text, View} from 'react-native';

import {Formik} from 'formik';
import {Button, ButtonGroup, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {getNewId, isEmpty, roundToDecimalPlaces, toDegrees, toRadians} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR, WARNING_COLOR} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {COMPASS_TOGGLE_BUTTONS} from '../compass/compass.constants';
import {setCompassMeasurements, setCompassMeasurementTypes} from '../compass/compass.slice';
import {Form, useFormHook} from '../form';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {editedSpotProperties, setSelectedAttributes, setSelectedMeasurement} from '../spots/spots.slice';
import MeasurementItem from './MeasurementItem';
import styles from './measurements.styles';
import useMeasurementsHook from './useMeasurements';

const MeasurementDetail = (props) => {
  const dispatch = useDispatch();
  const compassMeasurements = useSelector(state => state.compass.measurements);
  const selectedMeasurement = useSelector(state => state.spot.selectedMeasurement);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useForm] = useFormHook();
  const [useMeasurements] = useMeasurementsHook();

  const formRef = useRef(null);

  const [formName, setFormName] = useState([]);
  const [isAddingAssociatedMeasurementAfterSave, setIsAddingAssociatedMeasurementAfterSave] = useState(false);

  useLayoutEffect(() => {
    return () => confirmLeavePage();
  }, []);

  // Update selected Measurement on selected Attitudes changed or return to Measurements page if no selected Attitude
  useEffect(() => {
    console.log('UE for selectedAttitudes changed in MeasurementDetail', props.selectedAttitudes);
    if (isEmpty(props.selectedAttitudes)) props.closeDetailView();
    else {
      if (isEmpty(selectedMeasurement) && props.selectedAttitudes[0]) {
        switchSelectedMeasurement(props.selectedAttitudes[0]);
      }
      else if (isAddingAssociatedMeasurementAfterSave) {
        setIsAddingAssociatedMeasurementAfterSave(false);
        addAssociatedMeasurement();
      }
    }
  }, [props.selectedAttitudes]);

  // Update field values for measurements on grabbing new compass measurements
  useEffect(() => {
    if (!isEmpty(compassMeasurements)) {
      console.log('New compass measurement recorded AND DETAIL OPEN.', compassMeasurements);
      if (!isEmpty(selectedMeasurement) && selectedMeasurement.type) {
        const fieldsToUpdate = selectedMeasurement.type === 'linear_orientation'
          ? ['trend', 'plunge', 'rake', 'rake_calculated', 'quality']
          : selectedMeasurement.type === 'planar_orientation' || selectedMeasurement.type === 'tabular_orientation'
            ? ['strike', 'dip', 'dip_direction', 'quality']
            : [];
        fieldsToUpdate.forEach(field => formRef.current.setFieldValue(field, compassMeasurements[field]));
      }
      dispatch(setCompassMeasurements({}));
    }
  }, [compassMeasurements]);

  // Set compass measurement type on changing the selected measurement type
  useEffect(() => {
    if (!isEmpty(selectedMeasurement) && selectedMeasurement.type) {
      if (selectedMeasurement.type === 'planar_orientation' || selectedMeasurement.type === 'tabular_orientation') {
        dispatch(setCompassMeasurementTypes([COMPASS_TOGGLE_BUTTONS.PLANAR]));
      }
      else dispatch(setCompassMeasurementTypes([COMPASS_TOGGLE_BUTTONS.LINEAR]));
    }
  }, [selectedMeasurement]);

  const addAssociatedMeasurement = () => {
    const types = props.selectedAttitudes[0].type === 'linear_orientation' ? [COMPASS_TOGGLE_BUTTONS.PLANAR] : [COMPASS_TOGGLE_BUTTONS.LINEAR];
    const type = props.selectedAttitudes[0].type === 'linear_orientation' ? 'planar_orientation' : 'linear_orientation';
    dispatch(setCompassMeasurementTypes(types));
    dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.COMPASS}));

    const newId = getNewId();
    const newAssociatedMeasurement = {type: type, id: newId};
    const selectedMeasurementCopy = JSON.parse(JSON.stringify(props.selectedAttitudes[0]));
    if (!selectedMeasurementCopy.associated_orientation) selectedMeasurementCopy.associated_orientation = [];
    selectedMeasurementCopy.associated_orientation.push(newAssociatedMeasurement);

    console.log('Saving form data to Spot ...');
    let orientationDataCopy = JSON.parse(JSON.stringify(spot.properties.orientation_data));
    orientationDataCopy.forEach((measurement, i) => {
      if (measurement.id === selectedMeasurementCopy.id) orientationDataCopy[i] = selectedMeasurementCopy;
    });
    dispatch(editedSpotProperties({field: 'orientation_data', value: orientationDataCopy}));
    dispatch(setSelectedAttributes([selectedMeasurementCopy]));
    switchSelectedMeasurement(newAssociatedMeasurement);
  };

  const calcTrendPlunge = (value) => {
    console.log('Calculating trend and plunge...');
    const strike = props.selectedAttitudes[0].strike;
    const dip = props.selectedAttitudes[0].dip;
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

  const cancelFormAndGo = () => {
    dispatch(setSelectedMeasurement({}));
    formRef.current.resetForm();
    if (isEmptyMeasurement(props.selectedAttitudes[0])) {
      const aOs = props.selectedAttitudes[0].associated_orientation || [];
      useMeasurements.deleteMeasurements([...aOs, props.selectedAttitudes[0]]);
    }
    props.closeDetailView();
  };

  const clearSelectedMeasurements = () => {
    dispatch(setSelectedMeasurement({}));
    dispatch(setSelectedAttributes([]));
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
          onPress: () => dispatch(setSelectedMeasurement({})),
        }, {
          text: 'Yes',
          onPress: async () => {
            const saved = await saveForm(formCurrent);
            console.log(saved);
            clearSelectedMeasurements();
          },
        }],
        {cancelable: false},
      );
    }
    else clearSelectedMeasurements();
  };

  // Delete a single measurement
  const deleteMeasurement = () => {
    try {
      useMeasurements.deleteMeasurements([selectedMeasurement]);
      props.closeDetailView();
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

  // Confirm switching the selected measurement
  const onAddAssociatedMeasurement = () => {
    if (formRef.current.dirty) {
      Alert.alert('Unsaved Changes',
        'Would you like to save your data before continuing?',
        [{
          text: 'No',
          onPress: () => {
            formRef.current.resetForm();
            addAssociatedMeasurement();
          },
          style: 'cancel',
        }, {
          text: 'Yes',
          onPress: () => saveFormAndAddAssociatedMeasurement(),
        }],
        {cancelable: false},
      );
    }
    else addAssociatedMeasurement();
  };

  const onMyChange = async (name, value) => {
    //console.log(name, 'changed to', value);
    if (name === 'rake' && !isEmpty(value) && selectedMeasurement.type === 'linear_orientation'
      && props.selectedAttitudes[0].id !== selectedMeasurement.id && !isEmpty(props.selectedAttitudes[0].strike)
      && !isEmpty(props.selectedAttitudes[0].dip) && value >= 0 && value <= 180) calcTrendPlunge(value);
    await formRef.current.setFieldValue(name, value);
  };

  // Confirm switching the selected measurement
  const onSwitchSelectedMeasurement = (measurement) => {
    if (measurement.id !== selectedMeasurement.id) {
      if (formRef.current.dirty) {
        Alert.alert('Unsaved Changes',
          'Would you like to save your data before continuing?',
          [{
            text: 'No',
            onPress: () => switchSelectedMeasurement(measurement),
            style: 'cancel',
          }, {
            text: 'Yes',
            onPress: () => saveFormAndSwitchSelectedMeasurement(measurement),
          }],
          {cancelable: false},
        );
      }
      else switchSelectedMeasurement(measurement);
    }
  };

  // Confirm switch between Planar and Tabular Zone
  const onSwitchPlanarTabular = (i) => {
    const currentType = formRef.current.values.type;
    if ((i === 0 && currentType === 'tabular_orientation') || (i === 1 && currentType === 'planar_orientation')) {
      const newType = currentType === 'tabular_orientation' ? 'planar_orientation' : 'tabular_orientation';
      const typeText = newType === 'tabular_orientation' ? 'Tabular Zone' : 'Planar Orientation';
      const alertTextEnd = props.selectedAttitudes.length === 1 ? 'this measurement to a ' + typeText + '? You will '
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

  const renderAssociatedMeasurements = () => {
    const addButtonText = props.selectedAttitudes && props.selectedAttitudes[0]
    && props.selectedAttitudes[0].type === 'linear_orientation' ? '+ Add Associated Plane' : '+ Add Associated Line';
    console.log('selected id', selectedMeasurement.id);
    return (
      <View>
        {/* Primary measurement */}
        {selectedMeasurement && props.selectedAttitudes && props.selectedAttitudes[0]
        && props.selectedAttitudes[0].associated_orientation && (
          <React.Fragment>
            <MeasurementItem
              item={props.selectedAttitudes[0]}
              selectedIds={[selectedMeasurement.id]}
              isAssociatedItem={false}
              isAssociatedList={true}
              onPress={() => onSwitchSelectedMeasurement(props.selectedAttitudes[0])}
            />
            <FlatListItemSeparator/>
          </React.Fragment>
        )}

        {/* Associated measurements */}
        {selectedMeasurement && props.selectedAttitudes && props.selectedAttitudes[0] && props.selectedAttitudes[0].associated_orientation
        && (props.selectedAttitudes[0].associated_orientation.map((item, i) =>
            <React.Fragment>
              <MeasurementItem
                item={item}
                selectedIds={[selectedMeasurement.id]}
                isAssociatedItem={true}
                isAssociatedList={true}
                onPress={() => onSwitchSelectedMeasurement(item)}
                key={item.id}
              />
              <FlatListItemSeparator/>
            </React.Fragment>,
          )
        )}

        {/* Button to add an associated measurement */}
        <Button
          titleStyle={styles.buttonText}
          title={addButtonText}
          type={'clear'}
          onPress={() => onAddAssociatedMeasurement()}
        />
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
    console.log('Rendering Form:', formName[0] + '.' + formName[1], '\nSelected Measurements:',
      props.selectedAttitudes, '\nSelected Individual Measurement:', selectedMeasurement);
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
            initialValues={selectedMeasurement}
            validateOnChange={true}
            enableReinitialize={true}
          />
        </View>
      </View>
    );
  };

  const renderMultiMeasurementsBar = () => {
    const mainText = props.selectedAttitudes[0].type === 'linear_orientation' ? 'Multiple Lines' : 'Multiple Planes';
    const propertyText = props.selectedAttitudes[0].type === 'linear_orientation' ? 'Plunge -> Trend' : 'Strike/Dip';
    const hasAssociated = props.selectedAttitudes[0].associated_orientation && props.selectedAttitudes[0].associated_orientation.length > 0;
    const mainText2 = hasAssociated && props.selectedAttitudes[0].associated_orientation[0].type === 'linear_orientation' ? 'Multiple Lines' : 'Multiple Planes';
    const propertyText2 = hasAssociated && props.selectedAttitudes[0].associated_orientation[0].type === 'linear_orientation' ? 'Plunge -> Trend' : 'Strike/Dip';

    return (
      <View>
        <ListItem
          containerStyle={selectedMeasurement.id === props.selectedAttitudes[0].id && commonStyles.listItemInverse}
          onPress={() => onSwitchSelectedMeasurement(props.selectedAttitudes[0])}
          pad={5}>
          <ListItem.Content>
            <ListItem.Title
              style={selectedMeasurement.id === props.selectedAttitudes[0].id ? commonStyles.listItemTitleInverse
                : commonStyles.listItemTitle}>{mainText}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Content>
            <ListItem.Title
              style={selectedMeasurement.id === props.selectedAttitudes[0].id ? commonStyles.listItemTitleInverse
                : commonStyles.listItemTitle}
            >
              {propertyText}
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {hasAssociated && (
          <ListItem
            containerStyle={selectedMeasurement.id === props.selectedAttitudes[0].associated_orientation[0].id && commonStyles.listItemInverse}
            onPress={() => onSwitchSelectedMeasurement(props.selectedAttitudes[0].associated_orientation[0])}
            pad={5}
          >
            <ListItem.Content>
              <ListItem.Title
                style={selectedMeasurement.id === props.selectedAttitudes[0].associated_orientation[0].id
                  ? commonStyles.listItemTitleInverse : commonStyles.listItemTitle}
              >
                {mainText2}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Content>
              <ListItem.Title
                style={selectedMeasurement.id === props.selectedAttitudes[0].associated_orientation[0].id
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
        selectedIndex={selectedMeasurement.type === 'planar_orientation' ? 0 : 1}
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
    if (props.selectedAttitudes.length > 1) {
      const fieldsToExclude = ['id', 'associated_orientation', 'label', 'strike', 'dip_direction', 'dip',
        'trend', 'plunge', 'rake', 'rake_calculated'];
      fieldsToExclude.forEach(key => delete formValues[key]);
      if (formCurrent.values.id === props.selectedAttitudes[0].id) {
        idsOfMeasurementsToEdit = props.selectedAttitudes.map(measurement => measurement.id);
      }
      else {
        idsOfMeasurementsToEdit = props.selectedAttitudes.reduce(
          (acc, measurement) => [...acc, ...measurement.associated_orientation.map(
            associatedOrientation => associatedOrientation.id)], []);
      }
    }

    orientationDataCopy.forEach((measurement, i) => {
      if (idsOfMeasurementsToEdit.includes(measurement.id)) {
        orientationDataCopy[i] = props.selectedAttitudes.length === 1 ? formValues : {...measurement, ...formValues};
        editedSelectedMeasurements.push(orientationDataCopy[i]);
      }
      else if (measurement.associated_orientation) {
        measurement.associated_orientation.forEach((associatedMeasurement, j) => {
          if (idsOfMeasurementsToEdit.includes(associatedMeasurement.id)) {
            orientationDataCopy[i].associated_orientation[j] = props.selectedAttitudes.length === 1 ? formValues
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
    return 'Saved!';
  };

  const saveFormAndGo = async () => {
    try {
      await saveForm(formRef.current);
      props.closeDetailView();
    }
    catch (e) {
      console.log('Error saving form data to Spot');
    }
  };

  const saveFormAndAddAssociatedMeasurement = async () => {
    try {
      setIsAddingAssociatedMeasurementAfterSave(true);
      await saveForm(formRef.current);
    }
    catch (e) {
      console.log('Error saving form data to Spot');
    }
  };

  const saveFormAndSwitchSelectedMeasurement = async (measurement) => {
    try {
      await saveForm(formRef.current);
      switchSelectedMeasurement(measurement);
    }
    catch (e) {
      console.log('Error saving form data to Spot');
    }
  };

  // Switch the selected measurement
  const switchSelectedMeasurement = (measurement) => {
    dispatch(setSelectedMeasurement(measurement));
    const formCategory = props.selectedAttitudes.length === 1 ? 'measurement' : 'measurement_bulk';
    setFormName([formCategory, measurement.type]);
  };

  // Switch between Planar and Tabular Zone
  const switchPlanarTabular = (type) => {
    const modifiedMeasurement = {...formRef.current.values, type: type};
    switchSelectedMeasurement(modifiedMeasurement);
  };

  return (
    <React.Fragment>
      {selectedMeasurement && (
        <View style={styles.measurementsContentContainer}>
          {renderCancelSaveButtons()}
          <FlatList
            ListHeaderComponent={
              <View>
                {selectedMeasurement && props.selectedAttitudes.length === 1 && renderAssociatedMeasurements()}
                {selectedMeasurement && props.selectedAttitudes.length > 1 && renderMultiMeasurementsBar()}
                {selectedMeasurement && selectedMeasurement.type && (selectedMeasurement.type === 'planar_orientation'
                  || selectedMeasurement.type === 'tabular_orientation') && renderPlanarTabularSwitches()}
                <View>
                  {!isEmpty(formName) && renderFormFields()}
                </View>
                {props.selectedAttitudes.length === 1 && (
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

export default MeasurementDetail;
