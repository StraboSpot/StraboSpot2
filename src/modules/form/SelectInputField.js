import React from 'react';
import {Text, View} from 'react-native';

import {Icon} from 'react-native-elements';
import MultiSelect from 'react-native-multiple-select';

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
    <React.Fragment>
      <View style={formStyles.fieldLabelContainer}>
        <Text style={formStyles.fieldLabel}>{props.label}</Text>
        {props.placeholder && (
          <Icon
            name={'ios-information-circle-outline'}
            type={'ionicon'}
            color={themes.PRIMARY_ACCENT_COLOR}
            onPress={() => props.onShowFieldInfo(props.label, props.placeholder)}
          />
        )}
      </View>
      <View style={formStyles.fieldValue}>
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
          selectText={isEmpty(props.value) ? placeholderText : getChoiceLabel(props.value)}
          searchInputPlaceholderText={isEmpty(props.value) ? placeholderText : getChoiceLabel(props.value)}
          searchInputStyle={formStyles.dropdownSelectionListHeader}
          fontSize={themes.PRIMARY_TEXT_SIZE}
          selectedItemTextColor={themes.PRIMARY_TEXT_COLOR}
          selectedItemIconColor={themes.PRIMARY_TEXT_COLOR}
          textColor={themes.PRIMARY_TEXT_COLOR}
          itemTextColor={themes.PRIMARY_TEXT_COLOR}
          styleDropdownMenu={formStyles.dropdownContainer}
          styleDropdownMenuSubsection={formStyles.dropdownSelectedContainer}
          styleSelectorContainer={formStyles.selectorContainer}
          tagBorderColor={themes.PRIMARY_TEXT_COLOR}
          tagTextColor={themes.PRIMARY_TEXT_COLOR}
        />
      </View>
    </React.Fragment>
  );
};

export default SelectInputField;
