import React from 'react';
import {Text, View} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import MultiSelect from 'react-native-multiple-select';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {DARKGREY, PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import {formStyles} from '../form';

const SelectInputField = (props) => {
  const placeholderText = props.name === 'spot_id_for_pet_copy' ? '-- None --' : `-- Select ${props.label} --`;

  const fieldValueChanged = (value) => {
    if (props.single) {
      if (value[0] === props.value) props.setFieldValue(props.name, undefined);
      else if (props.onMyChange && typeof props.onMyChange === 'function') props.onMyChange(props.name, value[0]);
      else props.setFieldValue(props.name, value[0]);
    }
    else props.setFieldValue(props.name, isEmpty(value) ? undefined : value);
  };

  const getChoiceLabel = (value) => {
    if (typeof value === 'object' && Array.isArray(value) && value.length > 1) return 'Multiple Selected';
    else if (typeof value === 'object' && Array.isArray(value) && value.length === 1) value = value[0];
    const choiceFound = props.choices.find(choice => choice.value === value);
    return choiceFound ? choiceFound.label : '';
  };

  const renderChoiceItem = (item) => {
    const radioSelected = <Icon name={'radiobox-marked'} type={'material-community'} color={PRIMARY_ACCENT_COLOR}/>;
    const radioUnslected = <Icon name={'radiobox-blank'} type={'material-community'} color={DARKGREY}/>;
    return (
      <React.Fragment key={item.value}>
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>{item.label}</ListItem.Title>
          </ListItem.Content>
          {props.single && (
            <ListItem.CheckBox
              checked={props.value === item.value}
              checkedIcon={radioSelected}
              uncheckedIcon={radioUnslected}
              onPress={() => fieldValueChanged([item.value])}
            />
          )}
          {!props.single && (
            <ListItem.CheckBox
              checked={props.value?.includes(item.value)}
              onPress={() => props.value?.includes(item.value)
                ? fieldValueChanged(props.value.filter(v => v !== item.value))
                : fieldValueChanged([...props.value || [], item.value])}
            />
          )}
        </ListItem>
      </React.Fragment>
    );
  };

  const renderChoices = () => {
    // console.log('Field Choices', props.choices);
    return (
      <React.Fragment>
        <ListItem containerStyle={commonStyles.listItemFormField}>
          <ListItem.Content>
            {renderFieldLabel()}
          </ListItem.Content>
        </ListItem>
        {props.choices.map((item, index) => renderChoiceItem(item, index))}
      </React.Fragment>
    );
  };

  const renderFieldLabel = () => {
    return (
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
    );
  };

  const renderMultiSelect = () => {
    return (
      <React.Fragment>
        {renderFieldLabel()}
        <View style={formStyles.fieldValue}>
          <MultiSelect
            hideSubmitButton={true}
            hideTags={false}
            single={props.single}
            hideDropdown={true}
            searchIcon={false}
            items={props.choices}
            uniqueKey={'value'}
            displayKey={'label'}
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
        {props.errors && props.errors[props.name]
          && <Text style={formStyles.fieldError}>{props.errors[props.name]}</Text>}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {props.showExpandedChoices ? renderChoices() : renderMultiSelect()}
    </React.Fragment>
  );
};

export default SelectInputField;
