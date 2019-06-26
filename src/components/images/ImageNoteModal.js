import React, {useState} from 'react';
import {Text, TextInput, Switch, View} from 'react-native';
import {Button, Input} from "react-native-elements";
import styles from './images.styles';
import Modal from '../../shared/ui/modal/Modal.view';

const imageNoteModal = (props) => {

  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [switchPosition, setSwitchPosition] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);

  const renderMoreFields = (
    <View>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
    <Text>MORE FIELDS</Text>
      <Button
        title={'Show fewer fields'}
        type={'clear'}
        titleStyle={{color: 'blue', fontSize: 14}}
        onPress={() => fieldButtonHandler()}
      />
    </View>
  );

  const renderLessFields = (
    <View>
      <Button
        title={'Show more fields'}
        type={'clear'}
        titleStyle={{color: 'blue', fontSize: 14}}
        onPress={() => fieldButtonHandler()}
      />
    </View>
  );

  const fieldButtonHandler = () => {
    setShowMoreFields(!showMoreFields);
  };

  return (
    <Modal
      component={<View style={{flex: 1}}>
        <Input
          placeholder={'Image Name'}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={(text) => setName(text)}
          value={name}
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
        <View style={styles.button}>
          {showMoreFields ? renderMoreFields : renderLessFields}
        </View>
        <View style={styles.switch}>
            <Text style={{marginLeft:25,  fontSize: 16}}>Use as basemap</Text>
            <Switch
              onValueChange={() => setSwitchPosition(!switchPosition)}
              value={switchPosition}
            />
          </View>
      </View>}
      close={() => props.close()}
      style={styles.modalContainer}
      modalStyle={{opacity: 1}}
    />
  );
};

export default imageNoteModal;
