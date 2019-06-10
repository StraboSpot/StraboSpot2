import styles from "../components/notebook-panel/notebook-measurements/MeasurementsStyles";
import {SpotPages} from "../components/notebook-panel/Notebook.constants";
import {Button} from "react-native-elements";
import React from "react";

const notebookBackButton = props => {
  return (
  <Button
    icon={{
      name: 'arrow-back',
      size: 20,
      color: 'black'
    }}
    containerStyle={styles.backButton}
    titleStyle={{color: 'blue'}}
    title={'Return to Overview'}
    type={'clear'}
    onPress={() => props.onPress()}
  />
  )
}

export default notebookBackButton;
