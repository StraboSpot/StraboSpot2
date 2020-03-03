import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
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

  const showDatPickerHandler = (type) => {
    setShowDatePickerModal(!showDatePickerModal);
  };

  const changeDate = (event, selectedDate) => {
    console.log('Change Date', name, event);
    setDate(selectedDate);
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
            onChange={(e, selectedDate) => {
              changeDate(e, selectedDate);
            }}
            display='default'
          />
          <Button
            title={'Close'}
            type={'clear'}
            onPress={() => {
              setFieldValue(name, date);
              setShowDatePickerModal(false);
            }}
          />
        </View>
      </DateDialogBox>
    );
  };

  return (
    <View style={stylesCommon.rowContainer}>
      <View style={stylesCommon.row}>
        <View style={stylesCommon.fixedWidthSide}>
          <Text style={styles.fieldLabel}>{props.label}</Text>
        </View>
        <View>
          <ListItem
            title={title}
            containerStyle={{padding: 0, alignContent: 'flex-start'}}
            titleStyle={styles.fieldValue}
            onPress={() => showDatPickerHandler(props.label)}
          />
          {name !== 'start_date' ? errors[name] && <Text style={styles.fieldError}>{errors[name]}</Text> : null}
        </View>
        {renderDatePickerDialogBox()}
      </View>
    </View>
  );
};

export default DateInputField;
