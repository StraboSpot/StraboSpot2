import React, {Component} from 'react'
import {View} from 'react-native'
import styles from "./NotebookPanel.styles";
import NotebookHeader from './NotebookHeader';
import NotebookFooter from './NotebookFooter';
import SpotOverview from '../../spots/SpotOverview';


const NotebookPanel = props => (
  <View style={styles.container}>
    <NotebookHeader
      spot={'Pilbara2018-Spot207'}
      spotCoords={'119.734222° East, -20.992911° North'}
      close={props.close}
    />
    <View style={styles.subContainer}>
    <SpotOverview/>
    </View>
      <NotebookFooter/>
  </View>
);

export default NotebookPanel;
