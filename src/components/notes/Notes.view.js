import React, {useState} from 'react';
import {Text, View} from 'react-native';
import noteStyles from "./notes.style";
import {connect} from "react-redux";
import * as actionCreators from '../../store/actions/index';
import {Button, Input} from "react-native-elements";
import styles from "../notebook-panel/notebook-measurements/MeasurementsStyles";
import {SpotPages} from "../notebook-panel/Notebook.constants";
import {SET_SPOT_PAGE_VISIBLE} from "../../store/Constants";
import ReturnToOverview from '../notebook-panel/ui/ReturnToOverviewButton';

const notesView = (props) => {

    const [date, setDate] = useState('');
    const [note, setNote] = useState(props.selectedSpot.properties.notes);

    let timeStamp = Date();

    const savedNote = props.selectedSpot.properties.notes;

    // const date = new Date.now();
    return (
      <View >
        <ReturnToOverview
          onPress={() => props.setPageVisible(SpotPages.OVERVIEW)}
        />
        {/*<Button*/}
        {/*  icon={{*/}
        {/*    name: 'arrow-back',*/}
        {/*    size: 20,*/}
        {/*    color: 'black'*/}
        {/*  }}*/}
        {/*  containerStyle={styles.backButton}*/}
        {/*  titleStyle={{color: 'blue'}}*/}
        {/*  title={'Return to Overview'}*/}
        {/*  type={'clear'}*/}
        {/*  onPress={ () =>  {*/}
        {/*     props.setPageVisible(SpotPages.OVERVIEW)*/}
        {/*  }}*/}
        {/*/>*/}
        {/*<View>*/}
        {/*  <Text style={props.style}>{props.notes}{date}</Text>*/}
        {/*  {savedNote !== '' ? <Text style={ props.style}>- {savedNote}</Text> : null}*/}
        {/*</View>*/}
        <View style={noteStyles.container}>
        <View style={[noteStyles.inputContainer]}>
          <Text style={props.style}>{date}</Text>
          {/*{savedNote !== '' ? <Text style={ props.style}>- {savedNote}</Text> : null}*/}
          <Input
            placeholder='Enter a note...'
            maxLength={300}
            inputContainerStyle={{borderColor: 'transparent'}}
            multiline={true}
            onChangeText={(text) => setNote(text)}
            onFocus={() => setDate(timeStamp)}
            value={note}
            onBlur={() => {
              console.log(note)
              props.onSpotEdit('notes', note);
              // props.setNoteTimestamp(date);
            }}
          >
          </Input>
        </View>
        </View>
      </View>

    );
  // return (
  //   <React.Fragment style={{justifyContent: 'center', alignContent: 'flex-start'}}>
  //     <Text >NOTES PAGE</Text>
  //   </React.Fragment>
  // );
};

const mapStateToProps = (state) => {
  return {
    selectedSpot: state.home.selectedSpot
  }
};

const mapDispatchToProps = {
  onSpotEdit: (field, value) => (actionCreators.editSpotProperties(field, value)),
  setPageVisible: (page) => (actionCreators.setSpotPageVisible(page)),
  // setNoteTimestamp: (timestamp) => (actionCreators.notebookTimestamp(timestamp))

};

export default connect(mapStateToProps, mapDispatchToProps)(notesView);
