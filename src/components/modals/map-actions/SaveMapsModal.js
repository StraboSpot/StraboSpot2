import React, {Component} from 'react';
import {Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import ButtonWithBackground from '../../../ui/ButtonWithBackground';
import ButtonNoBackground from '../../../ui/ButtonNoBackround';
import {Header} from 'react-native-elements';
import MaterialCommunityIcons from '../../../shared/Icons';


const SaveMapModal = props => {

  return (
    <View style={styles.modalContainer}>
      <Header
        backgroundColor={'lightgrey'}
        containerStyle={{height: 50}}
        // leftContainerStyle={{flex:1, justifyContent: 'center'}}
        leftComponent={<ButtonNoBackground
          onPress={props.close}>
          <MaterialCommunityIcons.FontAwesome5
            name={'times'}
            size={20}
          />
        </ButtonNoBackground>}
      />
      <View style={{flex:1, justifyContent: 'center'}}>
      <Text>Modal showing</Text>
      </View>
      <ButtonWithBackground
        onPress={props.saveMap}
        style={styles.buttonText}
        color={'blue'}
      >Save Map</ButtonWithBackground>
    </View>
  )
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    // height: 150,
    width: 400,
    backgroundColor: 'white',
    // justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    paddingLeft: 10,
    paddingRight: 15
  }
});

export default SaveMapModal;

