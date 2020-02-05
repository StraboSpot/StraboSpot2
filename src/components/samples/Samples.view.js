import React, {useState} from 'react';
import {Alert, Text, TextInput, View} from 'react-native';
import {connect} from 'react-redux';
import {Button, ButtonGroup, Input} from 'react-native-elements';
import Slider from '../../shared/ui/Slider';
import {spotReducers} from '../../spots/Spot.constants';
import {NotebookPages, notebookReducers} from '../notebook-panel/Notebook.constants';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {homeReducers, Modals} from '../../views/home/Home.constants';
import Samples from './SamplesNotebook.view';
import useMapsHook from '../maps/useMaps';

// Styles
import styles from './samplesStyles/samples.style';
import * as themes from '../../shared/styles.constants';

const SamplesModalView = (props) => {
  let modalView = null;

  const [useMaps] = useMapsHook();
  const [selectedButton, setSelectedButton] = useState(null);
  const [sampleOrientedValue, setSampleOrientedValue] = useState(null);
  const [inplaceness, setInplaceness] = useState(5);
  const [label, setLabel] = useState(null);
  const [name, setName] = useState(null);
  const [note, setNote] = useState(null);
  const [description, setDescription] = useState(null);

  const buttonNames = ['Oriented', 'Unoriented'];

  const buttonSelected = (selectedButton) => {
    setSelectedButton(selectedButton);
    let sampleOriented = selectedButton === 0 ? 'yes' : 'no';
    setSampleOrientedValue(sampleOriented);
  };

  // const checkProperties = () => {
  //   return props.spot.properties.samples.map((sample) => {
  //     if (!sample.name) {
  //       return 'No Sample Name'
  //     } else {
  //      return name
  //     }
  //   });
  // };

  const saveSample = async () => {
    if (props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
      const pointSetAtCurrentLocation = await useMaps.setPointAtCurrentLocation();
      console.log('pointSetAtCurrentLocation', pointSetAtCurrentLocation);
    }
    let sample = [];
    // const propertyNameValidation = await checkProperties();
    sample.push({
      sample_id_name: name,
      inplaceness_of_sample: inplaceness,
      label: label,
      oriented_sample: sampleOrientedValue,
      sample_notes: note,
      sample_description: description,
    });
    if (sample.length > 0) {
      let newSample = sample[0];
      newSample.id = getNewId();
      if (props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE) {
        const samples = (typeof props.spot.properties.samples === 'undefined' ? [newSample] : [...props.spot.properties.samples, newSample]);
        props.onSpotEdit('samples', samples);
      }
      else if (props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
        props.onSpotEdit('samples', [newSample]);
      }
      setName(null);
      setLabel(null);
      setNote('');
      setDescription('');
      setSampleOrientedValue(null);
      setInplaceness(0);
    }
    else Alert.alert('No Sample Type', 'Please select a samples.');
  };

  const shortcutVisible = () => {
      if (props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE
        && props.deviceDimensions.width > 700) {
        modalView =
          <Button
            title={'View In Shortcut Mode'}
            type={'clear'}
            titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
            onPress={() => props.onPress(NotebookPages.SAMPLE)}
          />;
        return modalView;
      }
      else return null;
    };

  return (
    <React.Fragment>
      <View style={styles.input}>
        <Input
          placeholder={'Name'}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={(text) => setName(text)}
          value={name}
        />
        <Input
          placeholder={'Label'}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={(text) => setLabel(text)}
          value={label}
        />
        <View style={styles.textboxContainer}>
          <TextInput
            placeholder={'Description'}
            maxLength={120}
            multiline={true}
            numberOfLines={4}
            style={styles.textbox}
            onChangeText={(text) => setDescription(text)}
            value={description}
          />
        </View>
      </View>
      <View style={{flex: 15, paddingBottom: 20, alignItems: 'center'}}>
        <View style={{paddingTop: 20}}>
          <Text style={styles.headingText}>Inplaceness of Sample: {inplaceness}</Text>
        </View>
        <Slider
          sliderValue={inplaceness}
          // setSliderValue={value => setInplaceness(value)}
          onSlidingComplete={value => setInplaceness(value)}
          leftText={'Float'}
          rightText={'In Place'}
        />
      </View>
      <View style={{flex: 10}}>
        <ButtonGroup
          onPress={(value) => buttonSelected(value)}
          selectedIndex={selectedButton}
          buttons={buttonNames}
        />
      </View>
      <View style={[styles.textboxContainer, {flex: 20}]}>
        <TextInput
          placeholder={'Orientation Notes'}
          maxLength={120}
          multiline={true}
          numberOfLines={4}
          style={styles.textbox}
          onChangeText={(text) => setNote(text)}
          value={note}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={'Save Sample'}
          type={'solid'}
          color={'red'}
          containerStyle={{paddingBottom: 10, paddingTop: 0}}
          buttonStyle={{borderRadius: 10, backgroundColor: 'red'}}
          onPress={() => saveSample()}
        />
        <View style={{width: '100%'}}>
          {shortcutVisible()}
        </View>
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
  };
};

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SamplesModalView);
