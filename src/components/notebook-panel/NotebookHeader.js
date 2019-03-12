import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {Image} from 'react-native-elements';
import pointIcon from '../../assets/icons/PointButton_pressed.png';
import styles from './NotebookPanel.styles';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import MaterialCommunityIcons from '../../shared/Icons';

const NotebookHeader = props => (
  <View style={styles.headerContainer}>
    <View>
      <Image
        source={pointIcon}
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
    <View>
      <ButtonNoBackground
        onPress={() => console.log('Header upload button pressed')}
      >
        <MaterialCommunityIcons.FontAwesome5
          name={'arrow-alt-circle-up'}
          size={20}
        />
      </ButtonNoBackground>
    </View>
    <View>
      <ButtonNoBackground
        onPress={props.close}
      >
        <MaterialCommunityIcons.FontAwesome5
          name={'ellipsis-v'}
          size={20}
        />
      </ButtonNoBackground>
    </View>
  </View>
);

export default NotebookHeader;

