import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, Switch, Text, View} from 'react-native';

import {Formik} from 'formik';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Form, useFormHook} from '../form';
import NotebookImages from '../images/ImageNotebook';
import MeasurementsOverview from '../measurements/MeasurementsOverview';
import NotesOverview from '../notes/NotesOverview';
import SamplesNotebook from '../samples/SamplesNotebook';
import {spotReducers} from '../spots/spot.constants';
import {editedSpotProperties} from '../spots/spotSliceTemp';
import {TagsAtSpotList} from '../tags';
import notebookStyles from './notebookPanel.styles';

const Overview = props => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const [isTraceSurfaceFeatureEnabled, setIsTraceSurfaceFeatureEnabled] = useState(false);
  const [isTraceSurfaceFeatureEdit, setIsTraceSurfaceFeatureEdit] = useState(false);
  const form = useRef(null);
  const [useForm] = useFormHook();

  const SECTIONS = [
    {id: 4, title: 'Notes', content: <NotesOverview/>},
    {id: 1, title: 'Measurements', content: <MeasurementsOverview/>},
    {id: 2, title: 'Photos and Sketches', content: <NotebookImages/>},
    {id: 3, title: 'Tags', content: <TagsAtSpotList openMainMenu={props.openMainMenu}/>},
    {id: 5, title: 'Samples', content: <SamplesNotebook/>},
  ];

  useEffect(() => {
    setIsTraceSurfaceFeatureEnabled((spot.properties.hasOwnProperty('trace') && spot.properties.trace.trace_feature)
      || spot.properties.hasOwnProperty('surface_feature'));
    setIsTraceSurfaceFeatureEdit(false);
  }, [spot]);

  const cancelFormAndGo = () => {
    setIsTraceSurfaceFeatureEdit(false);
    if (isTraceSurfaceFeatureEnabled && !spot.properties.hasOwnProperty('trace')
      && !spot.properties.hasOwnProperty('surface_feature')) setIsTraceSurfaceFeatureEnabled(false);
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

  const renderSectionsList = () => {
    return (
      <FlatList
        keyExtractor={(section) => section.id.toString()}
        data={SECTIONS}
        renderItem={({item}) => renderSections(item)}/>
    );
  };

  const renderSections = (section) => {
    return (
      <View style={notebookStyles.sectionContainer}>
        <SectionDivider dividerText={section.title}/>
        {section.content}
      </View>
    );
  };

  const renderTraceSurfaceFeatureForm = () => {
    let formName = ['general', 'surface_feature'];
    let initialValues = spot.properties.trace || spot.properties.surface_feature || {};
    if (spot.geometry && (spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString')) {
      formName = ['general', 'trace'];
      initialValues = {...initialValues, 'trace_feature': true};
    }
    return (
      <View>
        {renderCancelSaveButtons()}
        <FlatList
          ListHeaderComponent={
            <View>
              <Formik
                innerRef={form}
                onSubmit={onSubmitForm}
                validate={(values) => useForm.validateForm({formName: formName, values: values})}
                component={(formProps) => Form({formName: formName, ...formProps})}
                initialValues={initialValues}
                validateOnChange={false}
                enableReinitialize={true}
              />
            </View>
          }
        />
      </View>
    );
  };

  const saveForm = async () => {
    return form.current.submitForm().then(() => {
      if (useForm.hasErrors(form)) {
        useForm.showErrors(form);
        return Promise.reject();
      }
      console.log('Saving form data to Spot ...');
      if (spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString') {
        const traceValues = {...form.current.values, 'trace_feature': true};
        // dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'trace', value: traceValues});
        dispatch(editedSpotProperties({field: 'trace', value: traceValues}));
      }
      else if (spot.geometry.type === 'Polygon' || spot.geometry.type === 'MultiPolygon'
        || spot.geometry.type === 'GeometryCollection') {
        // dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'surface_feature', value: form.current.values});
        dispatch(editedSpotProperties({field: 'surface_feature', value: form.current.values}));
      }
      return Promise.resolve();
    }, (e) => {
      console.log('Error submitting form', e);
      return Promise.reject();
    });
  };

  const saveFormAndGo = () => {
    saveForm().then(() => {
      setIsTraceSurfaceFeatureEdit(false);
    }, () => {
      console.log('Error saving form data to Spot');
    });
  };

  const toggleTraceSurfaceFeature = () => {
    const continueToggleTraceSurfaceFeature = () => {
      setIsTraceSurfaceFeatureEnabled(!isTraceSurfaceFeatureEnabled);
      setIsTraceSurfaceFeatureEdit(!isTraceSurfaceFeatureEnabled);

      // If toggled off remove trace or surface feature
      if (isTraceSurfaceFeatureEnabled) {
        let field = 'surface_feature';
        if (spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString') field = 'trace';
        // dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: {}});
        dispatch(editedSpotProperties({field: field, value: {}}));
      }
    };

    if (isTraceSurfaceFeatureEnabled && ((spot.properties.hasOwnProperty('trace')
      && !isEmpty(Object.keys(spot.properties.trace).filter(t => t !== 'trace_feature')))
      || spot.properties.hasOwnProperty('surface_feature'))) {
      let featureTypeText = spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString'
        ? 'Trace' : 'Surface';
      Alert.alert('Turn Off ' + featureTypeText + ' Feature Warning',
        'Turning off ' + featureTypeText.toLowerCase() + ' feature will delete all '
        + featureTypeText.toLowerCase() + ' feature data. Are you sure you want to continue?',
        [
          {text: 'No', style: 'cancel'},
          {text: 'Yes', onPress: continueToggleTraceSurfaceFeature},
        ],
        {cancelable: false},
      );
    }
    else continueToggleTraceSurfaceFeature();
  };

  return (
    <View style={{flex: 1}}>
      {spot.geometry && spot.geometry.type && (spot.geometry.type === 'LineString'
        || spot.geometry.type === 'MultiLineString' || spot.geometry.type === 'Polygon'
        || spot.geometry.type === 'MultiPolygon' || spot.geometry.type === 'GeometryCollection') && (
        <View style={notebookStyles.traceSurfaceFeatureContainer}>
          <View style={notebookStyles.traceSurfaceFeatureToggleContainer}>
            {(spot.geometry.type === 'LineString' || spot.geometry.type === 'MultiLineString')
            && <Text style={notebookStyles.traceSurfaceFeatureToggleText}>This is a trace feature</Text>}
            {(spot.geometry.type === 'Polygon' || spot.geometry.type === 'MultiPolygon'
              || spot.geometry.type === 'GeometryCollection')
            && <Text style={notebookStyles.traceSurfaceFeatureToggleText}>This is a surface feature</Text>}
            <Switch
              onValueChange={toggleTraceSurfaceFeature}
              value={isTraceSurfaceFeatureEnabled}
            />
          </View>
          <View>
            <Button
              title='Edit'
              type='clear'
              disabled={!isTraceSurfaceFeatureEnabled}
              disabledTitleStyle={notebookStyles.traceSurfaceFeatureDisabledText}
              onPress={() => setIsTraceSurfaceFeatureEdit(true)}/>
          </View>
        </View>
      )}
      {isTraceSurfaceFeatureEdit ? renderTraceSurfaceFeatureForm() : renderSectionsList()}
    </View>
  );
};

export default Overview;
