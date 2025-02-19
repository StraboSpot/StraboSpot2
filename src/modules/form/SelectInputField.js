import React from 'react';
import {Text, View} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import MultiSelect from 'react-native-multiple-select';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {DARKGREY, PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import {formStyles} from '../form';

const SelectInputField = ({
                            choices,
                            errors,
                            label,
                            name,
                            onMyChange,
                            onShowFieldInfo,
                            placeholder,
                            setFieldValue,
                            showExpandedChoices,
                            single,
                            value,
                          }) => {
  const placeholderText = name === 'spot_id_for_pet_copy' ? '-- None --' : `-- Select ${label} --`;

  const fieldValueChanged = (itemValue) => {
    if (single) {
      if (itemValue[0] === value) setFieldValue(name, undefined);
      else if (onMyChange && typeof onMyChange === 'function') onMyChange(name, itemValue[0]);
      else setFieldValue(name, itemValue[0]);
    }
    else setFieldValue(name, isEmpty(itemValue) ? undefined : itemValue);
  };

  const getChoiceLabel = (itemValue) => {
    if (typeof itemValue === 'object' && Array.isArray(itemValue) && itemValue.length > 1) return 'Multiple Selected';
    else if (typeof itemValue === 'object' && Array.isArray(itemValue) && itemValue.length === 1) itemValue = itemValue[0];
    const choiceFound = choices.find(choice => choice.value === itemValue);
    return choiceFound ? choiceFound.label : '';
  };

  const renderChoiceItem = (item) => {
    const radioSelected = <Icon name={'radiobox-marked'} type={'material-community'} color={PRIMARY_ACCENT_COLOR}/>;
    const radioUnselected = <Icon name={'radiobox-blank'} type={'material-community'} color={DARKGREY}/>;
    return (
      <React.Fragment key={item.value}>
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>{item.label}</ListItem.Title>
          </ListItem.Content>
          {single && (
            <ListItem.CheckBox
              checked={value === item.value}
              checkedIcon={radioSelected}
              uncheckedIcon={radioUnselected}
              onPress={() => fieldValueChanged([item.value])}
            />
          )}
          {!single && (
            <ListItem.CheckBox
              checked={value?.includes(item.value)}
              onPress={() => value?.includes(item.value)
                ? fieldValueChanged(value.filter(v => v !== item.value))
                : fieldValueChanged([...value || [], item.value])}
            />
          )}
        </ListItem>
      </React.Fragment>
    );
  };

  const renderChoices = () => {
    // console.log('Field Choices', choices);
    return (
      <>
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            {renderFieldLabel()}
          </ListItem.Content>
        </ListItem>
        {choices.map((item, index) => renderChoiceItem(item, index))}
      </>
    );
  };

  const renderFieldLabel = () => {
    return (
      <View style={formStyles.fieldLabelContainer}>
        <Text style={formStyles.fieldLabel}>{label}</Text>
        {placeholder && (
          <Icon
            name={'information-circle-outline'}
            type={'ionicon'}
            color={themes.PRIMARY_ACCENT_COLOR}
            onPress={() => onShowFieldInfo(label, placeholder)}
          />
        )}
      </View>
    );
  };

  const renderMultiSelect = () => {
    return (
      <>
        {renderFieldLabel()}
        <View style={formStyles.fieldValue}>
          <MultiSelect
            hideSubmitButton={true}
            hideTags={false}
            single={single}
            hideDropdown={true}
            searchIcon={false}
            items={choices}
            uniqueKey={'value'}
            displayKey={'label'}
            onSelectedItemsChange={fieldValueChanged}
            selectedItems={isEmpty(value) || typeof value === 'object' ? value : [value]}
            textInputProps={{editable: false}}
            selectText={isEmpty(value) ? placeholderText : getChoiceLabel(value)}
            searchInputPlaceholderText={isEmpty(value) ? placeholderText : getChoiceLabel(value)}
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
        {errors && errors[name]
          && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
      </>
    );
  };

  return (
    <>
      {showExpandedChoices ? renderChoices() : renderMultiSelect()}
    </>
  );
};

export default SelectInputField;
