import React, {useEffect, useRef, useState} from 'react';
import {Alert, FlatList, ScrollView, Switch, Text, TouchableOpacity, View} from 'react-native';
import {Button} from 'react-native-elements';
import {Formik} from 'formik';
import {Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import Collapsible from 'react-native-collapsible';

// Components
import Form from '../form/Form';
import MeasurementsOverview from '../measurements/MeasurementsOverview';
import NotebookImages from '../images/ImageNotebook';
import NotesOverview from '../notes/NotesOverview';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import TagsOverview from '../tags/TagsOverview';

// Hooks
import useFormHook from '../form/useForm';

// Utilities
import {isEmpty} from '../../shared/Helpers';

// Styles
import notebookStyles from './notebookPanel.styles';

//Constants
import {spotReducers} from '../spots/spot.constants';

const Overview = props => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const [collapsedSections, setCollapsedSections] = useState(['Tags', 'Notes', 'Photos and Sketches']);
  const [isTraceEnabled, setIsTraceEnabled] = useState(false);
  const [isTraceEdit, setIsTraceEdit] = useState(false);
  const form = useRef(null);
  const [useForm] = useFormHook();

  const SECTIONS = [
    {id: 1, title: 'Measurements', content: <MeasurementsOverview/>},
    {id: 2, title: 'Photos and Sketches', content: <NotebookImages/>},
    {id: 3, title: 'Tags', content: <TagsOverview/>},
    {id: 4, title: 'Notes', content: <NotesOverview/>},
  ];

  const expandedIcon = <Icon
    name='ios-add'
    type='ionicon'
    color='#b2b2b7'
    containerStyle={{paddingRight: 10}}/>;

  const collapseIcon = <Icon
    name='ios-remove'
    type='ionicon'
    color='#b2b2b7'
    containerStyle={{paddingRight: 10}}/>;

  useEffect(() => {
    setIsTraceEnabled(spot.properties.hasOwnProperty('trace') && spot.properties.trace.trace_feature);
    setIsTraceEdit(false);
  }, [spot]);

  const cancelFormAndGo = () => {
    setIsTraceEdit(false);
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

  const renderCollapsibleList = () => {
    return (
      <FlatList
        keyExtractor={(section) => section.id.toString()}
        data={SECTIONS}
        renderItem={({item}) => renderSections(item)}/>
    );
  };

  const renderSections = (section) => {
    return (
      <View key={section.title}>
        <TouchableOpacity onPress={() => toggleCollapsed(section.title)}>
          <View style={notebookStyles.collapsibleSectionHeaderContainer}>
            {collapsedSections.includes(section.title) ? expandedIcon : collapseIcon}
            <Text style={notebookStyles.collapsibleSectionHeaderText}>{section.title}</Text>
          </View>
        </TouchableOpacity>
        {/*<Collapsible collapsed={false} align="center">*/}
        <Collapsible collapsed={collapsedSections.includes(section.title)} align='center'>
          <View>
            {section.content}
          </View>
        </Collapsible>
      </View>
    );
  };

  const renderTraceFeatureForm = () => {
    const formName = ['general', 'trace'];
    return (
      <View>
        {renderCancelSaveButtons()}
        <ScrollView>
          <Formik
            innerRef={form}
            onSubmit={onSubmitForm}
            validate={(values) => useForm.validateForm({formName: formName, values: values})}
            component={(formProps) => Form({formName: formName, ...formProps})}
            initialValues={spot.properties.trace}
            validateOnChange={false}
            enableReinitialize={true}
          />
        </ScrollView>
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
      dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'trace', value: form.current.values});
      return Promise.resolve();
    }, (e) => {
      console.log('Error submitting form', e);
      return Promise.reject();
    });
  };

  const saveFormAndGo = () => {
    saveForm().then(() => {
      setIsTraceEdit(false);
    }, () => {
      console.log('Error saving form data to Spot');
    });
  };

  const toggleCollapsed = (name) => {
    if (collapsedSections.includes(name)) setCollapsedSections(collapsedSections.filter((val) => val !== name));
    else setCollapsedSections(collapsedSections.concat(name));
  };

  const toggleTrace = () => {
    const continueToggleTrace = () => {
      const trace = isTraceEnabled ? {} : {trace_feature: true};
      dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'trace', value: trace});
    };

    if (isTraceEnabled && !isEmpty(Object.keys(spot.properties.trace).filter(t => t !== 'trace_feature'))) {
      Alert.alert('Turn Off Trace Feature Warning',
        'Turning off trace feature will delete all trace data. Are you sure you want to continue?',
        [
          {text: 'No', style: 'cancel'},
          {text: 'Yes', onPress: continueToggleTrace},
        ],
        {cancelable: false},
      );
    }
    else continueToggleTrace();
  };

  return (
    <View>
      {spot.geometry && spot.geometry.type && spot.geometry.type === 'LineString' &&
      <View style={notebookStyles.traceContainer}>
        <View style={notebookStyles.traceToggleContainer}>
          <Text style={notebookStyles.traceToggleText}>This is a trace feature</Text>
          <Switch
            onValueChange={toggleTrace}
            value={isTraceEnabled}
          />
        </View>
        <View>
          <Button
            title='Edit'
            type='clear'
            disabled={!isTraceEnabled}
            disabledTitleStyle={notebookStyles.traceDisabledText}
            onPress={() => setIsTraceEdit(true)}/>
        </View>
      </View>}
      {isTraceEdit ? renderTraceFeatureForm() : renderCollapsibleList()}
    </View>
  );
};

export default Overview;
