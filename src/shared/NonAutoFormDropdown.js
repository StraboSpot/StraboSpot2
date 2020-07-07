import React from 'react';

// Packages
import MultiSelect from 'react-native-multiple-select';
import PropTypes from 'prop-types';

// Constants
import * as themes from './styles.constants';
import {conceptType} from '../modules/tags/tags.constants';

// Styles
import styles from '../modules/form/form.styles';

const NonAutoFormDropdown = (props) => {
  return (
    <React.Fragment>
      <MultiSelect
        onSelectedItemsChange={props.onSelectedItemsChange}
        selectedItems={[props.selectedItems]}
        selectText={props.selectText}
        searchInputPlaceholderText={props.searchInputPlaceholderText}
        hideSubmitButton={true}
        hideTags={false}
        single={true}
        hideDropdown={true}
        searchIcon={false}
        items={conceptType}
        uniqueKey='label'
        displayKey='label'
        textInputProps={{editable: false}}
        fontSize={themes.PRIMARY_TEXT_SIZE}
        searchInputStyle={styles.dropdownSelectionListHeader}
        selectedItemTextColor={themes.SECONDARY_ITEM_TEXT_COLOR}
        selectedItemIconColor={themes.SECONDARY_ITEM_TEXT_COLOR}
        textColor={themes.SECONDARY_ITEM_TEXT_COLOR}
        itemTextColor={themes.PRIMARY_ITEM_TEXT_COLOR}
        styleRowList={styles.dropdownRowList}
        styleDropdownMenuSubsection={styles.dropdownSelectedContainer}
      />
    </React.Fragment>
  );
};

NonAutoFormDropdown.propTypes = {
  onSelectedItemsChange: PropTypes.func.isRequired,
  selectedItems: PropTypes.string.isRequired,
};

export default NonAutoFormDropdown;
