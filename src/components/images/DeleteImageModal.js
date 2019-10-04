import React from 'react';
import {Text, View} from 'react-native';
import {Button} from "react-native-elements";
import Modal from "react-native-modal";

const deleteImageModal = (props) => {
  console.log(props)
  return (
      <View style={{justifyContent: 'center', alignItems: 'center', width: 200, height: 300, backgroundColor: 'yellow'}} onPress={() => this.toggleDeleteImageModal()}>
      <Text>Delete Image Modal</Text>
      <Text>{props.children}</Text>
      <Button
        type={'clear'}
        titleProps={{color: 'black'}}
        title="Hide modal"
        onPress={props.onPress}
      />
      </View>
  );
};

export default deleteImageModal;
