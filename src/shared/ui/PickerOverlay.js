import React, { useState } from 'react';
import { FlatList } from 'react-native';

import {Button, CheckBox, Overlay} from 'react-native-elements';

import SectionDivider from './SectionDivider';
import overlayStyles from '../../modules/home/overlays/overlay.styles';
import {PRIMARY_TEXT_COLOR, PRIMARY_TEXT_SIZE, SECONDARY_BACKGROUND_COLOR} from '../styles.constants';

const PickerOverlay = ({ closePicker, data, dividerText, isPickerVisible, onSelect, value }) => {
  // const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  const handleSelect = (item) => {
    setSelectedValue(item);
    onSelect(item);
    closePicker();
  };

  return (
    <Overlay
      isVisible={isPickerVisible}
      onBackdropPress={closePicker}
      overlayStyle={overlayStyles.overlayContainer}
    >
      <Button
        title={'X'}
        type={'clear'}
        titleStyle={{color: 'black'}}
        containerStyle={{alignItems: 'flex-end'}}
        onPress={closePicker}
      />
      <SectionDivider dividerText={dividerText}/>
      <FlatList
        data={data}
        renderItem={({item}) => {
          return (
            <CheckBox
              checked={item === value}
              checkedIcon={'check'}
              containerStyle={{backgroundColor: SECONDARY_BACKGROUND_COLOR, borderWidth: 0}}
              iconType={'material'}
              onPress={() => handleSelect(item)}
              title={item}
              titleStyle={{color: PRIMARY_TEXT_COLOR, size: PRIMARY_TEXT_SIZE}}
              uncheckedIcon={''}
            />
          );
        }}
      />
    </Overlay>
  );
};

export default PickerOverlay;
