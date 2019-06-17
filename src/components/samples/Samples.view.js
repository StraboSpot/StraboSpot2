import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {connect} from "react-redux";
import {ButtonGroup, Input} from "react-native-elements";
import styles from './samples.style';
import Slider from '../../shared/ui/Slider';
import {EDIT_SPOT_PROPERTIES} from "../../store/Constants";

const samplesModalView = (props) => {
  let count = 0;
  // const [count, setCount] = useState(0);
  // const [sliderValue, setSliderValue] = useState(3);
  const [selectedButton, setSelectedButton] = useState(null);

  const [sampleOrientedValue, setSampleOrientedValue] = useState(0);
  const [inplaceness, setInplaceness] = useState(null);
  const [label, setLabel] = useState('sample');
  const [name, setName] = useState(null);
  const [note, setNote] = useState(null);
  const [description, setDescription] = useState(label);

  const buttonNames = ['Oriented', 'Unoriented'];

  const buttonSelected = (selectedButton) => {
   setSelectedButton(selectedButton);
    let sampleOriented = selectedButton === 0 ? 'yes' : 'no';
    setInplaceness(sampleOriented)
  };

  const saveSample = () => {
    sample = [];
    sample.push({
      inplaceness_of_sample: inplaceness,
      lable: label,
      sample_id_name: name,
      sample_notes: note,
      sample_description: name
    })
  };

  return (
    <React.Fragment>
      <View style={styles.input}>
        <Input
          placeholder={'Name'}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={(text) => setName({text})}
        />
        <Input
          placeholder={'Label'}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
        />
        <View style={styles.textboxContainer}>
          <TextInput
            placeholder={'Description'}
            maxLength={120}
            multiline={true}
            numberOfLines={4}
            style={styles.textbox}
          />
        </View>
      </View>
      <View style={{flex: 15, paddingBottom: 10, alignItems: 'center'}}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.text}>Inplaceness of Sample</Text>
        </View>
        <Slider
          sliderValue={sampleOrientedValue}
          setSliderValue={value => setSampleOrientedValue(value)}
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
      <View style={[styles.textboxContainer ,{flex: 20}]}>
        <TextInput
          placeholder={'Description'}
          maxLength={120}
          multiline={true}
          numberOfLines={4}
          style={styles.textbox}
        />
        <Text>{name}</Text>
      </View>
    </React.Fragment>
  );
};

const mapDispatchToProps = {
  onSpotEdit: (field, value) => ({type: EDIT_SPOT_PROPERTIES, field: field, value: value}),
};

export default connect()(samplesModalView);
