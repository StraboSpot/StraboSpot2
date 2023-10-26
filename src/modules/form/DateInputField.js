import React, {useState} from 'react';
import {Platform, Text, View} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {Button} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import DateDialogBox from '../../shared/ui/StatusDialogBox';
import {formStyles} from '../form';
import {addedStatusMessage, clearedStatusMessages, setErrorMessagesModalVisible} from '../home/home.slice';

const DateInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched, setFieldValue, values},
                          ...props
                        }) => {
  const [isDatePickerModalVisible, setIsDatePickerModalVisible] = useState(false);
  const [date, setDate] = useState(Date.parse(value) ? new Date(value) : new Date());

  const dispatch = useDispatch();

  let title = value ? props.isShowTime ? moment(value).format('MM/DD/YYYY, h:mm:ss a')
      : moment(value).format('MM/DD/YYYY')
    : undefined;

  const changeDate = (event, selectedDate) => {
    Platform.OS === 'ios' ? setDate(selectedDate) : saveDate(event, selectedDate);
  };

  const saveDate = (event, selectedDate) => {
    console.log('Change Date', name, event, selectedDate);
    if (Platform.OS === 'ios') selectedDate = selectedDate.toISOString();
    else {
      setIsDatePickerModalVisible(false);
      if (event.type === 'neutralButtonPressed') selectedDate = undefined;
      else if (event.type === 'set') {
        setDate(selectedDate);
        selectedDate = selectedDate.toISOString();
      }
    }
    if (selectedDate && name === 'start_date' && values.end_date) {
      if (Date.parse(selectedDate) <= Date.parse(values.end_date)) setFieldValue(name, selectedDate);
      else {
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage('Date Error!\nStart Date must be before End Date.'));
        dispatch(setErrorMessagesModalVisible(true));
      }
    }
    else if (selectedDate && name === 'end_date' && values.start_date) {
      if (Date.parse(values.start_date) <= Date.parse(selectedDate)) setFieldValue(name, selectedDate);
      else {
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage('Date Error!\nStart Date must be before End Date.'));
        dispatch(setErrorMessagesModalVisible(true));
      }
    }
    else setFieldValue(name, selectedDate);
  };

  const renderDatePicker = () => {
    return (
      <View style={{width: '100%'}}>
        <DateTimePicker
          mode={'date'}
          value={date}
          onChange={changeDate}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          neutralButton={{label: 'Clear', textColor: 'grey'}} // Android only
        />
      </View>
    );
  };

  const renderDatePickerDialogBox = () => {
    return (
      <DateDialogBox
        isVisible={isDatePickerModalVisible}
        onTouchOutside={() => setIsDatePickerModalVisible(false)}
        title={'Pick ' + props.label}
      >
        {renderDatePicker()}
        <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <Button
            title={'Clear'}
            type={'clear'}
            onPress={() => {
              setFieldValue(name, undefined);
              setIsDatePickerModalVisible(false);
            }}
          />
          <Button
            title={'Close'}
            type={'clear'}
            onPress={() => {
              saveDate(null, date);
              setIsDatePickerModalVisible(false);
            }}
          />
        </View>
      </DateDialogBox>
    );
  };

  return (
    <React.Fragment>
      {props.label && (
        <View style={formStyles.fieldLabelContainer}>
          <Text style={formStyles.fieldLabel}>{props.label}</Text>
        </View>
      )}
      {props.isDisplayOnly ? (
          <Text style={{...formStyles.fieldValue, paddingTop: 5, paddingBottom: 5}}>
            {title}
          </Text>
        )
        : (
          <Text
            style={{...formStyles.fieldValue, paddingTop: 5, paddingBottom: 5}}
            onPress={() => setIsDatePickerModalVisible(true)}
          >
            {title}
          </Text>
        )}
      {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
      {Platform.OS === 'ios' ? renderDatePickerDialogBox() : isDatePickerModalVisible && renderDatePicker()}
    </React.Fragment>
  );
};

export default DateInputField;
