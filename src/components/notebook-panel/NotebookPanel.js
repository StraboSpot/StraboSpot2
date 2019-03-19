import React from 'react'
import {View} from 'react-native'
import styles from "./NotebookPanel.styles";
import NotebookHeader from './NotebookHeader';
import NotebookFooter from './NotebookFooter';
import SpotOverview from '../../spots/SpotOverview';


const NotebookPanel = props => (
  <View style={styles.container}>
    <NotebookHeader
      spot={props.spotName}
      spotCoords={props.spotCoords}
      onPress={props.onPress}
    />
    <View style={styles.subContainer}>
    <SpotOverview/>
    </View>
      <NotebookFooter/>
  </View>
);

export default NotebookPanel;
