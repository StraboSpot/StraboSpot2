import React, {useState} from 'react';
import {Alert, Text, View} from 'react-native';
import moment from 'moment';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import {formStyles} from '../form';

const DateInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched, setFieldValue, values},
                          ...props
                        }) => {
  const [date, setDate] = useState(Date.parse(value) ? new Date(value) : undefined);

  let title = value ? props.isShowTime ? moment(value).format('MM/DD/YYYY, h:mm:ss a')
      : moment(value).format('MM/DD/YYYY')
    : undefined;

  const changeDate = (selectedDate) => {
    console.log('Change Date', name, selectedDate);
    setDate(selectedDate);
    selectedDate = selectedDate?.toISOString();

    if (selectedDate && name === 'start_date' && values.end_date) {
      if (Date.parse(selectedDate) <= Date.parse(values.end_date)) setFieldValue(name, selectedDate);
      else {
        console.log('Date Error!', 'Start Date must be before End Date.');
        Alert.alert('Date Error!', 'Start Date must be before End Date.');
      }
    }
    else if (selectedDate && name === 'end_date' && values.start_date) {
      if (Date.parse(values.start_date) <= Date.parse(selectedDate)) setFieldValue(name, selectedDate);
      else {
        console.log('Date Error!', 'Start Date must be before End Date.');
        Alert.alert('Date Error!', 'Start Date must be before End Date.');
      }
    }
    else setFieldValue(name, selectedDate);
  };

  const renderDatePickerWeb = () => {
    return (
      <DatePicker
        selected={date}
        onChange={changeDate}
        portalId={'root-portal'}
      />
    );
  };

  return (
    <React.Fragment>
      {props.label && (
        <View style={formStyles.fieldLabelContainer}>
          <Text style={formStyles.fieldLabel}>{props.label}</Text>
        </View>
      )}
      {props.isDisplayOnly ? <Text style={{...formStyles.fieldValue, paddingTop: 5, paddingBottom: 5}}>{title}</Text>
        : renderDatePickerWeb()}
    </React.Fragment>
  );
};

export default DateInputField;
