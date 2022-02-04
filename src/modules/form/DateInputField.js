import React, {useState} from 'react';
import {Alert, Platform, Text, View} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {Button} from 'react-native-elements';

import DateDialogBox from '../../shared/ui/StatusDialogBox';
import {formStyles} from '../form';

const DateInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched, setFieldValue, values},
                          ...props
                        }) => {
  const [isDatePickerModalVisible, setIsDatePickerModalVisible] = useState(false);
  const [date, setDate] = useState(Date.parse(value) ? new Date(value) : new Date());

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
      if (event.type === 'set' || event.type === 'neutralButtonPressed') {
        setDate(selectedDate);
        if (event.type === 'set') selectedDate = selectedDate.toISOString();
      }
    }
    if (selectedDate && name === 'start_date' && values.end_date) {
      if (Date.parse(selectedDate) <= Date.parse(values.end_date)) setFieldValue(name, selectedDate);
      else Alert.alert('Date Error!', 'Start Date must be before End Date.');
    }
    else if (selectedDate && name === 'end_date' && values.start_date) {
      if (Date.parse(values.start_date) <= Date.parse(selectedDate)) setFieldValue(name, selectedDate);
      else Alert.alert('Date Error!', 'End Date must be after Start Date.');
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
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          neutralButtonLabel='clear'
        />
      </View>
    );
  };

  const renderDatePickerDialogBox = () => {
    return (
      <DateDialogBox
        visible={isDatePickerModalVisible}
        onTouchOutside={() => setIsDatePickerModalVisible(false)}
        dialogTitle={'Pick ' + props.label}
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
