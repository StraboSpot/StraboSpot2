import React from 'react';

import {Button, Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {setIsMapMoved} from '../../modules/maps/maps.slice';
import commonStyles from '../common.styles';
import * as themes from '../styles.constants';

// Update the Spots in the map
const UpdateSpotsInMapExtentButton = ({title, updateSpotsInMapExtent}) => {

  const dispatch = useDispatch();
  const isMapMoved = useSelector(state => state.map.isMapMoved);

  const onPress = () => {
    updateSpotsInMapExtent();
    dispatch(setIsMapMoved(false));
  };

  return (
    <Button
      containerStyle={{padding: 5, paddingTop: 0}}
      title={title}
      titleStyle={commonStyles.standardButtonText}
      icon={
        <Icon
          name={'sync-outline'}
          type={'ionicon'}
          size={20}
          color={isMapMoved ? themes.PRIMARY_ACCENT_COLOR : themes.MEDIUMGREY}
          containerStyle={{paddingRight: 5}}
        />
      }
      type={'outline'}
      onPress={onPress}
      disabled={!isMapMoved}
    />
  );
};

export default UpdateSpotsInMapExtentButton;
