import React from 'react'
import {Text, View} from 'react-native'
import styles from "./NotebookPanel.styles";
import NotebookHeader from './NotebookHeader';
import NotebookFooter from './NotebookFooter';
import SpotOverview from '../../spots/SpotOverview';
import ButtonNoBackground from '../../ui/ButtonNoBackround';

const NotebookPanel = props => {

  if (props.spotName) {
    return (
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
    )
  }
  else {
    return (
      <View style={[styles.container, {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{fontSize: 30}}>No Spot Selected</Text>
        <ButtonNoBackground
          style={{ marginTop: 40}}
          textStyle={{color: 'blue'}}
          onPress={props.closeNotebook}>Close Notebook</ButtonNoBackground>
      </View>
    )
  }
};

export default NotebookPanel;
