import React, {useState, useEffect} from 'react';
import {Alert, Text, TextInput, View} from 'react-native';
import {connect} from "react-redux";
import {Button, ButtonGroup, Input} from "react-native-elements";
import Slider from '../../shared/ui/Slider';
import {spotReducers} from "../../spots/Spot.constants";
import {getNewId} from "../../shared/Helpers";

// Styles
import styles from './samples.style';
import * as themes from '../../shared/styles.constants';

const samplesModalView = (props) => {
  let count = 0;

    // const [count, setCount] = useState(0);
  // const [sliderValue, setSliderValue] = useState(3);
  const [selectedButton, setSelectedButton] = useState(null);

  const [sampleOrientedValue, setSampleOrientedValue] = useState(null);
  const [inplaceness, setInplaceness] = useState(0);
  const [label, setLabel] = useState(null);
  const [name, setName] = useState(null);
  const [note, setNote] = useState(null);
  const [description, setDescription] = useState(null);

  const buttonNames = ['Oriented', 'Unoriented'];

  const buttonSelected = (selectedButton) => {
    setSelectedButton(selectedButton);
    let sampleOriented = selectedButton === 0 ? 'yes' : 'no';
    setSampleOrientedValue(sampleOriented)
  };

  const saveSample = () => {
    sample = [];
    sample.push({
      inplaceness_of_sample: inplaceness,
      label: label,
      oriented_sample: sampleOrientedValue,
      sample_id_name: name,
      sample_notes: note,
      sample_description: description
    })
    if (sample.length > 0) {
      let newSample = sample[0];
      newSample.id = getNewId();
      const samples = (typeof props.spot.properties.samples === 'undefined' ? [newSample] : [...props.spot.properties.samples, newSample])
      props.onSpotEdit('samples', samples)
      setName(null);
      setLabel(null);
      setNote('');
      setDescription('');
      setSampleOrientedValue(null);
      setInplaceness(0);
    }
    else Alert.alert('No Sample Type', 'Please select a samples.');
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
          <Text style={styles.text}>Inplaceness of Sample</Text>
        </View>
        <Slider
          sliderValue={inplaceness}
          setSliderValue={value => setInplaceness(value)}
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
      <View style={styles.button}>
        <Button
          title={'Save Sample'}
          type={'solid'}
          color={'red'}
          containerStyle={{width: 200, paddingBottom: 10, paddingTop: 0}}
          buttonStyle={{borderRadius: 10, backgroundColor: 'red',}}
          onPress={() => saveSample()}
        />
        <Button
          title={'View In Shortcut Mode'}
          type={'clear'}
          titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
        />
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot
  }
}

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(samplesModalView);
