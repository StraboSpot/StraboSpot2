import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import Divider from '../components/settings-panel/HomePanelDivider';
import styles from './Project.styles';
import {Icon, Button, Input, ListItem} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useSelector} from 'react-redux';
import moment from 'moment';
import SaveAndCloseButtons from '../shared/ui/SaveAndCloseButtons';

const ProjectDescription = (props) => {
  const project = useSelector(state => state.project.project);
  const [data, setData] = useState({
    text: '',
    endDate: '',
    notes: '',
  });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const changeStartDate = (event, date) => {
    date = date || startDate;
    setStartDate(date);
  };

  const changeEndDate = (event, date) => {
    date = date || endDate;
    setEndDate(date);
  };

  const showDatPickerHandler = (type) => {
    if (type === 'startDate') {
      setShowStartPicker(!showStartPicker);
      setShowEndPicker(false);
    }
    else if (type === 'endDate') {
      setShowEndPicker(!showEndPicker);
      setShowStartPicker(false);
    }
  };

  const renderSaveAndCloseButtons = () => {
    return (
      <SaveAndCloseButtons cancel={props.onPress}/>
    );
  };

  return (
    <React.Fragment>
      <View style={styles.sidePanelHeaderContainer}>
        <View style={styles.sidePanelHeaderTextContainer}>
          <Button
            icon={
              <Icon
                name={'ios-arrow-back'}
                type={'ionicon'}
                color={'black'}
                iconStyle={styles.buttons}
                size={20}
              />
            }
            title={'Active Project'}
            type={'clear'}
            containerStyle={styles.sidePanelHeaderTextContainer}
            titleStyle={styles.headerText}
            onPress={props.onPress}
          />
          {/*<Text style={styles.headerText}>Active Project</Text>*/}
        </View>
        {/*<View style={{flex: 1}}></View>*/}
      </View>
      {renderSaveAndCloseButtons()}
      <Divider sectionText={'basic info'}/>
      <View style={{backgroundColor: 'white', borderRadius: 10, margin: 10}}>
        <View style={styles.basicInfoContainer}>
          <Text>Project Name:</Text>
          <TextInput
            placeholder={project.description.project_name}
            placeholderTextColor={'dimgrey'}
            style={styles.basicInfoInputText}
            onChangeText={(text) => setData({text: text})}
            value={data.text}
          />
        </View>
        <View style={styles.basicInfoContainer}>
          <Text>Start Date:</Text>
          <View>
            <ListItem
              title={moment(startDate).format('MM/DD/YYYY')}
              containerStyle={{width: 150, padding: 0,  paddingRight: 5,}}
              contentContainerStyle={styles.basicInfoListItemContent}
              onPress={() => showDatPickerHandler('startDate')}
              chevron
            />
          </View>
        </View>
        <View style={styles.basicInfoContainer}>
          <Text>End Date:</Text>
          <ListItem
            title={moment(endDate).format('MM/DD/YYYY')}
            containerStyle={{width: 150, padding: 0, paddingRight: 5}}
            contentContainerStyle={styles.basicInfoListItemContent}
            onPress={() => showDatPickerHandler('endDate')}
            chevron
          />
        </View>
        {showStartPicker ?
          <View>
            <Button type={'clear'} title={'Start Date Done'} onPress={() => setShowStartPicker(false)}/>
            <DateTimePicker
              mode={'date'}
              value={startDate}
              onChange={changeStartDate}
              display='default'
            />
          </View> : null}
        {showEndPicker ?
          <View>
            <Button type={'clear'} title={'End Date Done'} onPress={() => setShowEndPicker(false)}/>
            <DateTimePicker
              mode={'date'}
              value={endDate}
              onChange={changeEndDate}
              display='default'
            />
          </View> : null}
      </View>
      <Divider sectionText={'notes'}/>
      <View style={styles.notesContainer}>
        <TextInput
          placeholder={'Notes'}
          onChangeText={noteText => setData({notes: noteText})}
          style={{height: 100}}
          multiline={true}
          numberOfLines={10}
          inputStyle={{fontSize: 18}}
          value={data.notes}
        />
    </View>
      <Divider sectionText={'technical details'}/>
      <Divider sectionText={'general details'}/>
    </React.Fragment>
  );
};

export default ProjectDescription;
