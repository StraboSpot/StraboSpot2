import React, {useRef} from 'react';
import {ScrollView, Text, View} from 'react-native';

import * as turf from '@turf/turf/index';
import {Field, Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, formStyles, NumberInputField, TextInputField, useFormHook} from '../form';
import useMapsHooks from '../maps/useMaps';
import {setNotebookPageVisibleToPrev} from '../notebook-panel/notebook.slice';
import {spotReducers} from '../spots/spot.constants';
import {addedSpot} from '../spots/spots.slice';

const Geography = (props) => {
  const [useForm] = useFormHook();
  const [useMaps] = useMapsHooks();
  const dispatch = useDispatch();
  const form = useRef(null);
  const geomForm = useRef(null)
  const spot = useSelector(state => state.spot.selectedSpot);

  const cancelFormAndGo = () => {
    dispatch(setNotebookPageVisibleToPrev());
  };

  // Fill in current location
  const fillWithCurrentLocation = async () => {
    const [lng, lat] = await useMaps.getCurrentLocation();
    if (lat) geomForm.current.setFieldValue('latitude', lat);
    if (lng) geomForm.current.setFieldValue('longitude', lng);
  };

  // What happens after submitting the form is handled in saveFormAndGo since we want to show
  // an alert message if there are errors but this function won't be called if form is invalid
  const onSubmitForm = () => {
    console.log('In onSubmitForm');
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
    const formName = ['general', 'geography'];
    console.log('Rendering form: general.geography with', spot.properties);
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={form}
          onSubmit={onSubmitForm}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          component={(formProps) => Form({formName: formName, ...formProps})}
          initialValues={spot.properties}
          validateOnChange={false}
          enableReinitialize={true}
        />
      </View>
    );
  };

  // Render the form for the Geometry
  const renderGeometryForm = () => {
    // Get the array of coordinates as a string
    const getCoordArray = () => {
      if (spot.geometry.coordinates) {
        var coordString = JSON.stringify(spot.geometry.coordinates);
        return '[' + coordString.replace(/^\[+|\]+$/g, '') + ']';         // Remove extra [ and ] from start and end
      }
      else return '[multiple geometries]';
    };

    // Validate the geometry
    const validateGeometry = (values) => {
      console.log('Values before geometry validation:', values);
      let errors = {};
      if (values.latitude) {
        values.latitude = parseFloat(values.latitude);
        if (values.latitude < -90 || values.latitude > 90) errors.latitude = 'Latitude must be between -90 and 90';
      }
      if (values.longitude) {
        values.longitude = parseFloat(values.longitude);
        if (values.longitude < -180 || values.longitude > 180) errors.longitude = 'Longitude must be between -180 and 180';
      }
      console.log('Values after geometry validation:', values);
      return errors;
    };

    const initialGeomValues = {
      geomType: turf.getType(spot) ? turf.getType(spot) : '',
      coordsString: getCoordArray(),
    };

    if (useMaps.isOnGeoMap(spot)) {
      if (turf.getType(spot) === 'Point') {
        initialGeomValues.longitude = turf.getCoord(spot)[0];
        initialGeomValues.latitude = turf.getCoord(spot)[1];
      }
    }
    else {
      if (turf.getType(spot) === 'Point') {
        initialGeomValues.x_pixels = turf.getCoord(spot)[0];
        initialGeomValues.y_pixels = turf.getCoord(spot)[1];
      }
      if (!isEmpty(spot.properties.lng)) initialGeomValues.longitude = spot.properties.lng;
      if (!isEmpty(spot.properties.lat)) initialGeomValues.latitude = spot.properties.lat;
    }

    return (
      <Formik
        initialValues={initialGeomValues}
        onSubmit={onSubmitForm}
        validate={validateGeometry}
        innerRef={geomForm}
        validateOnChange={true}
        enableReinitialize={true}
      >
        {() => (
          <View>
            <Field
              component={TextInputField}
              name={'geomType'}
              label={'Geometry'}
              key={'geomType'}
            />
            {useMaps.isOnGeoMap(spot) ? renderGeoCoords(initialGeomValues) : renderPixelCoords(initialGeomValues)}
          </View>
        )}
      </Formik>
    );
  };

  const renderGeoCoords = (initialGeomValues) => {
    return (
      <View>
        {!isEmpty(initialGeomValues.latitude) && !isEmpty(initialGeomValues.longitude)
          ? (
            <View style={{flex: 1, flexDirection: 'row', ...commonStyles.rowContainer}}>
              <View style={{flex: 1, flexDirection: 'row', ...commonStyles.rowContainer}}>
                <Field
                  component={NumberInputField}
                  name={'longitude'}
                  key={'longitude'}
                  label={'Longitude'}
                />
                <Field
                  component={NumberInputField}
                  name={'latitude'}
                  key={'latitude'}
                  label={'Latitude'}
                />
              </View>
              <View style={commonStyles.rowContainer}>
                <Button
                  onPress={fillWithCurrentLocation}
                  type='clear'
                  icon={{
                    name: 'locate',
                    type: 'ionicon',
                    size: 30,
                    color: commonStyles.iconColor.color,
                  }}
                />
              </View>
            </View>
          )
          : (
            <View>
              <Text style={formStyles.fieldLabel}>Coordinates as [Longitude, Latitude]</Text>
              <View style={formStyles.notesFieldContainer}>
                <Text style={{...formStyles.fieldValue, paddingBottom: 5}} numberOfLines={3}>
                  {initialGeomValues.coordsString}
                </Text>
              </View>
            </View>
          )
        }
      </View>
    );
  };

  const renderPixelCoords = (initialGeomValues) => {
    return (
      <View>
        <Text style={formStyles.fieldLabel}>IMAGE BASEMAP COORDINATES</Text>
        {!isEmpty(initialGeomValues.x_pixels) && !isEmpty(initialGeomValues.y_pixels)
          ? (
            <View>
              <Field
                component={NumberInputField}
                name={'x_pixels'}
                key={'x_pixels'}
                label={'X Pixels'}
              />
              <Field
                component={NumberInputField}
                name={'y_pixels'}
                key={'y_pixels'}
                label={'Y Pixels'}
              />
            </View>
          )
          : (
            <View>
              <Text style={formStyles.fieldLabel}>Coordinates as [X Pixels, Y Pixels]</Text>
              <View style={formStyles.notesFieldContainer}>
                <Text style={{...formStyles.fieldValue, paddingBottom: 5}} numberOfLines={3}>
                  {initialGeomValues.coordsString}
                </Text>
              </View>
            </View>
          )
        }
        <Text style={formStyles.fieldLabel}>REAL-WORLD COORDINATES</Text>
        <Field
          component={NumberInputField}
          name={'longitude'}
          key={'longitude'}
          label={'Longitude'}
        />
        <Field
          component={NumberInputField}
          name={'latitude'}
          key={'latitude'}
          label={'Latitude'}
        />
      </View>
    );
  };

  const saveForm = async () => {
    try {
      await geomForm.current.submitForm();
      await form.current.submitForm();
      if (useForm.hasErrors(geomForm) || useForm.hasErrors(form)) {
        useForm.showErrorsTwoForms(geomForm, form);
        return Promise.reject();
      }
      else {
        console.log('Saving form data to Spot ...');
        let geometry = spot.geometry;
        let geographyProperties = form.current.values;
        if (useMaps.isOnGeoMap(spot)) {
          if (!isEmpty(geomForm.current.values.longitude) && !isEmpty(geomForm.current.values.latitude)) {
            const point = turf.point([geomForm.current.values.longitude, geomForm.current.values.latitude]);
            geometry = point.geometry;
          }
        }
        else if (!useMaps.isOnGeoMap(spot)) {
          if (!isEmpty(geomForm.current.values.x_pixels) && !isEmpty(geomForm.current.values.y_pixels)) {
            const point = turf.point([geomForm.current.values.x_pixels, geomForm.current.values.y_pixels]);
            geometry = point.geometry;
          }
          if (!isEmpty(geomForm.current.values.longitude) && !isEmpty(geomForm.current.values.latitude)) {
            geographyProperties.lng = geomForm.current.values.longitude;
            geographyProperties.lat = geomForm.current.values.latitude;
          }
        }
        const editedSpot = {geometry: geometry, properties: {...geographyProperties}, type: spot.type};
        // dispatch({type: spotReducers.ADD_SPOT, spot: editedSpot});
        dispatch(addedSpot(editedSpot));
        return Promise.resolve();
      }
    }
    catch (e) {
      console.log('Error submitting form', e);
      return Promise.reject();
    }
  };

  const saveFormAndGo = () => {
    saveForm().then(() => {
      console.log('Finished saving form data to Spot');
      dispatch(setNotebookPageVisibleToPrev());
    }, () => {
      console.log('Error saving form data to Spot');
    });
  };

  return (
    <React.Fragment>
      {renderCancelSaveButtons()}
      <ScrollView style={formStyles.formContainer}>
        <SectionDivider dividerText='Geography'/>
        {renderGeometryForm()}
        {renderFormFields()}
      </ScrollView>
    </React.Fragment>
  );
};

export default Geography;
