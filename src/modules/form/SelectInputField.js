import React from 'react';
import {ListItem} from 'react-native-elements';
import {Text, View} from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import PropTypes from 'prop-types';

// Styles
import styles from './form.styles';
import * as themes from '../../shared/styles.constants';

// Utilities
import {isEmpty} from '../../shared/Helpers';

const SelectInputField = (props) => {
  const fieldValueChanged = (value) => {
    if (props.single) {
      if (value[0] === props.value) props.setFieldValue(props.name, undefined);
      else props.setFieldValue(props.name, value[0]);
    }
    else props.setFieldValue(props.name, value);
  };

  const getChoiceLabel = (value) => {
    if (typeof value === 'object' && Array.isArray(value) && value.length > 1) return 'Multiple Selected';
    else if (typeof value === 'object' && Array.isArray(value) && value.length === 1) value = value[0];
    const choiceFound = props.choices.find(choice => choice.value === value);
    return choiceFound ? choiceFound.label : '';
  };

  const placeholderText = `-- Select ${props.label} --`;

  return (
    <View>
      <ListItem
        title={props.label}
        containerStyle={{padding: 0}}
        titleStyle={styles.fieldLabel}
        subtitle={
          <MultiSelect
            hideSubmitButton={true}
            hideTags={false}
            single={props.single}
            hideDropdown={true}
            searchIcon={false}
            items={props.choices}
            uniqueKey='value'
            displayKey='label'
            onSelectedItemsChange={fieldValueChanged}
            selectedItems={isEmpty(props.value) || typeof props.value === 'object' ? props.value : [props.value]}
            textInputProps={{editable: false}}
            styleMainWrapper={styles.dropdownMainWrapper}
            selectText={isEmpty(props.value) ? placeholderText : getChoiceLabel(props.value)}
            searchInputPlaceholderText={isEmpty(props.value) ? placeholderText : getChoiceLabel(props.value)}
            searchInputStyle={styles.dropdownSelectionListHeader}
            fontSize={themes.PRIMARY_TEXT_SIZE}
            selectedItemTextColor={themes.SECONDARY_ITEM_TEXT_COLOR}
            selectedItemIconColor={themes.SECONDARY_ITEM_TEXT_COLOR}
            textColor={themes.SECONDARY_ITEM_TEXT_COLOR}
            itemTextColor={themes.PRIMARY_ITEM_TEXT_COLOR}
            styleRowList={styles.dropdownRowList}
            styleDropdownMenuSubsection={styles.dropdownSelectedContainer}
          />
        }
      />
      {props.errors && props.errors[props.name] && <Text style={styles.fieldError}>{props.errors[props.name]}</Text>}
    </View>
  );
};

SelectInputField.propTypes = {
  name: PropTypes.string.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  errors: PropTypes.object,
};

export default SelectInputField;
