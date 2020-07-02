import React from 'react';
import {ListItem} from 'react-native-elements';
import {Text, View} from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import PropTypes from 'prop-types';

// Styles
import styles from './form.styles';
import * as themes from '../../shared/styles.constants';

const SelectInputField = (props) => {
  const getChoiceLabel = (value) => {
    const choiceFound = props.choices.find(choice => choice.value === value);
    return choiceFound ? choiceFound.label : 'Unknown';
  };

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
            single={true}
            hideDropdown={true}
            searchIcon={false}
            items={props.choices}
            uniqueKey='value'
            displayKey='label'
            onSelectedItemsChange={(value, i) => props.setFieldValue(props.name, value[0])}
            selectedItems={props.value ? [props.value] : undefined}
            textInputProps={{editable: false}}
            styleMainWrapper={styles.dropdownMainWrapper}
            selectText={props.value ? getChoiceLabel(props.value) : `-- Select ${props.label} --`}
            searchInputPlaceholderText={props.value ? getChoiceLabel(props.value) : `-- Select ${props.label} --`}
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
  value: PropTypes.string,
  errors: PropTypes.object,
};

export default SelectInputField;
