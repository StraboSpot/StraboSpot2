import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {Image} from 'react-native-elements';
import styles from './NotebookPanel.styles';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import IconButton from '../../ui/IconButton';
import Icon from 'react-native-vector-icons/Ionicons';
import {SpotPages} from "./Notebook.constants";
import {connect} from 'react-redux';

const editIcon = <Icon name={'ios-create'} size={20} color={'blue'}/>;

const NotebookHeader = props => {
  return (
    <View style={styles.headerContainer}>
      <View>
        <Image
          source={require('../../assets/icons/PointButton_pressed.png')}
          style={styles.headerImage}
        />
      </View>
      <View style={styles.headerSpotContainer}>
        <View style={{flex:1, flexDirection: 'row'}}>
        <Text style={styles.headerSpotName}>{props.spot}</Text>
          {props.spotPageVisible === SpotPages.BASIC ? null : <ButtonNoBackground
        iconName={'create'}
        onPress={props.spotPageOpen}
        style={[styles.headerButton, {marginLeft: 15, flexDirection: 'row'}]}
        />}
        </View>
        <ButtonNoBackground
          style={styles.headerCoords}
          textStyle={[{color: 'blue'}, props.textStyle]}
          onPress={() => console.log('Spot Coords Pressed!')}
        >
          {props.spotCoords}
        </ButtonNoBackground>
      </View>
      <View style={styles.headerButtonsContainer}>

          {/*{editIcon}*/}
        <View style={styles.headerButtons}>
          <IconButton
            onPress={() => props.onPress('export')}
            source={require('../../assets/icons/app-icons-shaded/V2-58.png')}
            style={{width: 20, height: 20}}
          />
        </View>
        <View style={styles.headerButtons}>
          <IconButton
            onPress={() => props.onPress('menu')}
            source={require('../../assets/icons/app-icons-shaded/V2-56.png')}
            style={{width: 20, height: 20}}
          />
        </View>
      </View>
    </View>
  )
};

function mapStateToProps(state) {
  return {
    spotPageVisible: state.notebook.visiblePage
  }
}

export default connect(mapStateToProps)(NotebookHeader) ;

