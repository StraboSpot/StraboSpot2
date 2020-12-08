import React from 'react';
import {Text, View} from 'react-native';

import PropTypes from 'prop-types';
import {ListItem} from 'react-native-elements';
import MultiSelect from 'react-native-multiple-select';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {formStyles} from '../form';

const SelectInputField = (props) => {
  const placeholderText = props.name === 'spot_id_for_pet_copy' ? '-- None --' : `-- Select ${props.label} --`;

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

  return (
    <View>
      <ListItem containerStyle={{...commonStyles.rowContainer, padding: 0}}>
        <ListItem.Content>
          <ListItem.Title style={formStyles.fieldLabel}>{props.label}</ListItem.Title>
          <View style={{width: '100%'}}>
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
              styleMainWrapper={formStyles.dropdownMainWrapper}
              selectText={isEmpty(props.value) ? placeholderText : getChoiceLabel(props.value)}
              searchInputPlaceholderText={isEmpty(props.value) ? placeholderText : getChoiceLabel(props.value)}
              searchInputStyle={formStyles.dropdownSelectionListHeader}
              fontSize={themes.PRIMARY_TEXT_SIZE}
              selectedItemTextColor={themes.SECONDARY_ITEM_TEXT_COLOR}
              selectedItemIconColor={themes.SECONDARY_ITEM_TEXT_COLOR}
              textColor={themes.SECONDARY_ITEM_TEXT_COLOR}
              itemTextColor={themes.PRIMARY_ITEM_TEXT_COLOR}
              styleRowList={formStyles.dropdownRowList}
              styleDropdownMenuSubsection={formStyles.dropdownSelectedContainer}
            />
          </View>
        </ListItem.Content>
      </ListItem>
      {props.errors && props.errors[props.name]
      && <Text style={formStyles.fieldError}>{props.errors[props.name]}</Text>}
    </View>
  );
};

SelectInputField.propTypes = {
  name: PropTypes.string.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  errors: PropTypes.object,
  choices: PropTypes.array.isRequired,
};

export default SelectInputField;
