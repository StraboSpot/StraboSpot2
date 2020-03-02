import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './form.styles';
import stylesCommon from '../../shared/common.styles';
import moment from 'moment';
import {Button, ListItem} from 'react-native-elements';
import DateDialogBox from '../../shared/ui/StatusDialogBox';
import {isEmpty} from '../../shared/Helpers';


const DateInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched, setFieldValue},
                          ...props
                        }) => {
  // console.log('ASASASASASD', name, value)
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState(false);

  useEffect(() => {
    // console.log('Description Updated:', date);
    console.log(name, value, touched,'Errors', errors)
    // setFieldValue(name, date, true);
  }, [date], errors.end_date, errorMessage);

  const showDatPickerHandler = (type) => {
    setShowDatePickerModal(!showDatePickerModal);
  };

  const changeDate = (event, selectedDate) => {
    console.log('Change Date', name, event);
    setFieldValue(name, selectedDate);
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
            value={value}
            onChange={(e, selectedDate) => {
              changeDate(e, selectedDate)
            }}
            display='default'
          />
          {errors[name] && <Text style={styles.fieldError}>{errors[name]}</Text>}
          <Button
            title={'Close'}
            type={'clear'}
            disabled={!isEmpty(errors[name])}
            onPress={() => closeModal()}
          />
        </View>
      </DateDialogBox>
    );
  };

  const closeModal = () => {
    setShowDatePickerModal(false);
  };

  return (
    <View style={stylesCommon.rowContainer}>
      <View style={stylesCommon.row}>
        <View style={stylesCommon.fixedWidthSide}>
          <Text style={styles.fieldLabel}>{props.label}</Text>
        </View>
        <View style={styles.dateValue}>
          <ListItem
            title={moment(value).format('MM/DD/YYYY')}
            containerStyle={{padding: 0, alignContent: 'flex-start'}}
            titleStyle={styles.fieldValue}
            onPress={() => showDatPickerHandler(props.label)}
          />
        </View>
        {renderDatePickerDialogBox()}
      </View>
    </View>
  );
};

export default DateInputField;
