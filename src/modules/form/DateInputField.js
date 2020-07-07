import React, {useState} from 'react';
import {Platform, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import {formStyles} from '../form';
import DateDialogBox from '../../shared/ui/StatusDialogBox';
import stylesCommon from '../../shared/common.styles';

const DateInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched, setFieldValue},
                          ...props
                        }) => {
  const [isDatePickerModalVisible, setIsDatePickerModalVisible] = useState(false);
  const [date, setDate] = useState(value);

  let title = value ? moment(value).format('MM/DD/YYYY') : 'No Date';
  if (name === 'start_date') {
    title = value ? moment(value).format('MM/DD/YYYY') : moment(new Date()).format('MM/DD/YYYY');
  }

  const changeDate = (event, selectedDate) => {
    console.log('Change Date', name, event, selectedDate);
    if (Platform.OS === 'ios') setDate(selectedDate);
    else {
      setIsDatePickerModalVisible(false);
      if (event.type === 'set') {
        setDate(selectedDate);
        setFieldValue(name, selectedDate);
      }
    }
  };

  const renderDatePicker = () => {
    return (
      <View style={{width: '100%'}}>
        <Text>Date</Text>
        <DateTimePicker
          mode={'date'}
          value={date ? date : new Date()}
          onChange={(e, selectedDate) => changeDate(e, selectedDate)}
          display='default'
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
    <View style={stylesCommon.rowContainer}>
      <Text style={formStyles.fieldLabel}>{props.label}</Text>
      <ListItem
        title={title}
        containerStyle={formStyles.dateFieldValueContainer}
        titleStyle={formStyles.fieldValue}
        onPress={() => setIsDatePickerModalVisible(true)}
      />
      {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
      {Platform.OS === 'ios' ? renderDatePickerDialogBox() : isDatePickerModalVisible && renderDatePicker()}
    </View>
  );
};

export default DateInputField;
