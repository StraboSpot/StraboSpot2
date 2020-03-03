import React, {useEffect, useState} from 'react';
import {Platform, Text, View} from 'react-native';
import {Button, ListItem} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import DateDialogBox from '../../shared/ui/StatusDialogBox';

// Styles
import styles from './form.styles';
import stylesCommon from '../../shared/common.styles';

const DateInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched, setFieldValue},
                          ...props
                        }) => {
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [date, setDate] = useState(value);

  let title = value ? moment(value).format('MM/DD/YYYY') : 'No Date';
  if (name === 'start_date') {
    title = value ? moment(value).format('MM/DD/YYYY') : moment(new Date()).format('MM/DD/YYYY');
  }

  useEffect(() => {
    console.log(name, value, touched, 'Errors', errors);
  }, [errors.end_date]);

  const changeDate = (event, selectedDate) => {
    console.log('Change Date', name, event, selectedDate);
    setShowDatePickerModal(false);
    if (event.type === 'set') {
      setDate(selectedDate);
      setFieldValue(name, selectedDate);
    }
  };

  const renderDatePicker = () => {
    if (showDatePickerModal) {
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
    }
    else return null;
  };

  const renderDatePickerDialogBox = () => {
    return (
      <DateDialogBox
        visible={showDatePickerModal}
        onTouchOutside={() => setShowDatePickerModal(false)}
        dialogTitle={'Pick ' + props.label}
      >
        <View style={{width: '100%'}}>
          <Text>Date</Text>
          <DateTimePicker
            mode={'date'}
            value={date ? date : new Date()}
            onChange={(e, selectedDate) => changeDate(e, selectedDate)}
            display='default'
          />
          <Button
            title={'Close'}
            type={'clear'}
            onPress={() => setShowDatePickerModal(false)}
          />
        </View>
      </DateDialogBox>
    );
  };

  return (
    <View style={stylesCommon.rowContainer}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <ListItem
        title={title}
        containerStyle={styles.dateFieldValueContainer}
        titleStyle={styles.fieldValue}
        onPress={() => setShowDatePickerModal(true)}
      />
      {name !== 'start_date' ? errors[name] && <Text style={styles.fieldError}>{errors[name]}</Text> : null}
      {Platform.OS === 'ios' ? renderDatePickerDialogBox() : renderDatePicker()}
    </View>
  );
};

export default DateInputField;
