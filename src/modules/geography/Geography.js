import React, {useRef} from 'react';
import {FlatList, Text, View} from 'react-native';

import * as turf from '@turf/turf';
import {Field, Formik} from 'formik';
import {Button, ListItem} from '@rn-vui/base';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SaveAndCancelButtons from '../../shared/ui/SaveAndCancelButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, formStyles, NumberInputField, TextInputField, useForm} from '../form';
import GeoFieldInputs from './GeoFieldInputs';
import useMapView from '../maps/useMapView';
import {setNotebookPageVisibleToPrev} from '../notebook-panel/notebook.slice';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedOrCreatedSpot} from '../spots/spots.slice';

const Geography = () => {
  const {showErrors, validateForm} = useForm();
  const {isOnGeoMap} = useMapView();

  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const formRef = useRef(null);
  const geomFormRef = useRef(null);

  const cancelFormAndGo = () => {
    dispatch(setNotebookPageVisibleToPrev());
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCancelButtons
          cancel={() => cancelFormAndGo()}
          save={() => saveFormAndGo()}
        />
      </View>
    );
  };

  const renderFormFields = () => {
    const formName = ['general', 'geography'];
    console.log('Rendering Form:', formName[0] + '.' + formName[1], 'with', spot.properties);
    return (
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={() => console.log('Submitting form...')}
          validate={values => validateForm({formName: formName, values: values})}
          component={formProps => Form({formName: formName, ...formProps})}
          initialValues={spot.properties}
          initialStatus={{formName: formName}}
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
        const coordString = JSON.stringify(spot.geometry.coordinates);
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
      if (values.x_pixels && typeof (values.x_pixels) === 'string') {
        values.x_pixels = parseFloat(values.x_pixels);
      }
      if (values.y_pixels && typeof (values.y_pixels) === 'string') {
        values.y_pixels = parseFloat(values.y_pixels);
      }
      console.log('Values after geometry validation:', values);
      return errors;
    };

    const initialGeomValues = {
      geomType: turf.getType(spot) ? turf.getType(spot) : '',
      coordsString: getCoordArray(),
    };

    if (isOnGeoMap(spot)) {
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
        onSubmit={() => console.log('Submitting form...')}
        validate={validateGeometry}
        innerRef={geomFormRef}
        enableReinitialize={true}
      >
        {() => (
          <View>
            <ListItem containerStyle={commonStyles.listItemFormField}>
              <ListItem.Content>
                <Field
                  component={TextInputField}
                  name={'geomType'}
                  label={'Geometry'}
                  key={'geomType'}
                />
              </ListItem.Content>
            </ListItem>
            <FlatListItemSeparator/>
            {isOnGeoMap(spot) ? renderGeoCoords(initialGeomValues) : renderPixelCoords(initialGeomValues)}
          </View>
        )}
      </Formik>
    );
  };

  const renderGeoCoords = (initialGeomValues) => {
    return (
      <>
        {!isEmpty(initialGeomValues.latitude) && !isEmpty(initialGeomValues.longitude)
          ? <GeoFieldInputs formRef={formRef} geomFormRef={geomFormRef}/> : renderGeoFieldText(initialGeomValues)}
      </>
    );
  };

  const renderGeoFieldText = () => {
    return (
      <ListItem containerStyle={commonStyles.listItemFormField}>
        <ListItem.Content>
          <Field
            component={TextInputField}
            name={'coordsString'}
            label={'Coordinates as [Longitude, Latitude]'}
            key={'coordsString'}
            appearance={'multiline'}
          />
        </ListItem.Content>
      </ListItem>
    );
  };

  const renderPixelCoords = (initialGeomValues) => {
    return (
      <>
        {!isEmpty(initialGeomValues.x_pixels) && !isEmpty(initialGeomValues.y_pixels)
          ? renderPixelFieldInputs() : renderPixelFieldText(initialGeomValues)}
        <FlatListItemSeparator/>
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            <View style={formStyles.fieldLabelContainer}>
              <Text style={formStyles.fieldLabel}>Real-World Coordinates</Text>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row', overflow: 'hidden'}}>
                <View style={{flex: 1, paddingRight: 5}}>
                  <Field
                    component={NumberInputField}
                    name={'longitude'}
                    key={'longitude'}
                    label={'Longitude'}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Field
                    component={NumberInputField}
                    name={'latitude'}
                    key={'latitude'}
                    label={'Latitude'}
                  />
                </View>
              </View>
            </View>
          </ListItem.Content>
        </ListItem>
      </>
    );
  };

  const renderPixelFieldInputs = () => {
    return (
      <ListItem containerStyle={commonStyles.listItemFormField}>
        <ListItem.Content>
          <View style={formStyles.fieldLabelContainer}>
            <Text style={formStyles.fieldLabel}>Image Basemap Coordinates</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 1, flexDirection: 'row', overflow: 'hidden'}}>
              <View style={{flex: 1, paddingRight: 5}}>
                <Field
                  component={NumberInputField}
                  name={'x_pixels'}
                  key={'x_pixels'}
                  label={'X Pixels'}
                />
              </View>
              <View style={{flex: 1}}>
                <Field
                  component={NumberInputField}
                  name={'y_pixels'}
                  key={'y_pixels'}
                  label={'Y Pixels'}
                />
              </View>
            </View>
          </View>
        </ListItem.Content>
      </ListItem>
    );
  };

  const renderPixelFieldText = () => {
    return (
      <ListItem containerStyle={commonStyles.listItemFormField}>
        <ListItem.Content>
          <Field
            component={TextInputField}
            name={'coordsString'}
            label={'Coordinates as [X Pixels, Y Pixels]'}
            key={'coordsString'}
            appearance={'multiline'}
          />
        </ListItem.Content>
      </ListItem>
    );
  };

  const saveForm = async () => {
    try {
      await geomFormRef.current.submitForm();
      const editedGeomFormData = showErrors(geomFormRef.current);
      await formRef.current.submitForm();
      let geographyProperties = showErrors(formRef.current);
      console.log('Saving form data to Spot ...');
      let geometry = spot.geometry;
      if (isOnGeoMap(spot)) {
        if (!isEmpty(editedGeomFormData.longitude) && !isEmpty(editedGeomFormData.latitude)) {
          const point = turf.point([editedGeomFormData.longitude, editedGeomFormData.latitude]);
          geometry = point.geometry;
        }
      }
      else if (!isOnGeoMap(spot)) {
        if (!isEmpty(editedGeomFormData.x_pixels) && !isEmpty(editedGeomFormData.y_pixels)) {
          const point = turf.point([editedGeomFormData.x_pixels, editedGeomFormData.y_pixels]);
          geometry = point.geometry;
        }
        if (!isEmpty(editedGeomFormData.longitude) && !isEmpty(editedGeomFormData.latitude)) {
          geographyProperties.lng = editedGeomFormData.longitude;
          geographyProperties.lat = editedGeomFormData.latitude;
        }
      }
      const editedSpot = {geometry: geometry, properties: {...geographyProperties}, type: spot.type};
      dispatch(updatedModifiedTimestampsBySpotsIds([editedSpot.properties.id]));
      dispatch(editedOrCreatedSpot(editedSpot));
      return Promise.resolve();
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
    <>
      {renderCancelSaveButtons()}
      <FlatList
        ListHeaderComponent={
          <>
            <SectionDivider dividerText={'Geography'}/>
            {renderGeometryForm()}
            {renderFormFields()}
          </>
        }
      />
    </>
  );
};

export default Geography;
