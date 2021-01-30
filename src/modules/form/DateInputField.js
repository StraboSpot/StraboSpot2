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
  const [date, setDate] = useState(value);

  let title = value && moment(value).format('MM/DD/YYYY');

  const changeDate = (event, selectedDate) => {
    console.log('Change Date', name, event, selectedDate);
    if (Platform.OS === 'ios') setDate(selectedDate);
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
        {Platform.OS === 'ios' && <Text>Date</Text>}
        <DateTimePicker
          mode={'date'}
          value={Date.parse(date) ? new Date(date) : new Date()}
          onChange={(e, selectedDate) => changeDate(e, selectedDate)}
          display='default'
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
        <Button
          title={'Close'}
          type={'clear'}
          onPress={() => {
            setFieldValue(name, date);
            setIsDatePickerModalVisible(false);
          }}
        />
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
      <Text
        style={{...formStyles.fieldValue, paddingTop: 5, paddingBottom: 5}}
        onPress={() => setIsDatePickerModalVisible(true)}>
        {title}
      </Text>
      {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
      {Platform.OS === 'ios' ? renderDatePickerDialogBox() : isDatePickerModalVisible && renderDatePicker()}
    </React.Fragment>
  );
};

export default DateInputField;
