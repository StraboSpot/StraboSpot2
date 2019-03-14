import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {Image} from 'react-native-elements';
import styles from './NotebookPanel.styles';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import IconButton from '../../ui/IconButton';

const NotebookHeader = props => (
  <View style={styles.headerContainer}>
    <View>
      <Image
        source={require('../../assets/icons/PointButton_pressed.png')}
        style={styles.headerImage}
      />
    </View>
    <View style={styles.headerSpotContainer}>
      <Text style={styles.headerSpotName}>{props.spot}</Text>
      <ButtonNoBackground
        style={styles.headerCoords}
        onPress={() => console.log('Spot Coords Pressed!')}
      >
        {props.spotCoords}
      </ButtonNoBackground>
    </View>
    <View style={styles.headerButtonsContainer}>
      <View>
        <IconButton
          onPress={() => console.log('Header upload button pressed')}
          source={require('../../assets/icons/app-icons-shaded/V2-58.png')}
          style={styles.headerButtons}
        />
      </View>
      <View>
        <IconButton
          onPress={props.close}
          source={require('../../assets/icons/app-icons-shaded/V2-56.png')}
          style={styles.headerButtons}
        />
      </View>
    </View>
  </View>
);

export default NotebookHeader;

