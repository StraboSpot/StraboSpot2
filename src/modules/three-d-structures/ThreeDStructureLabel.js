import React from 'react';
import {Text} from 'react-native';

import {toTitleCase} from '../../shared/Helpers';
import {useFormHook} from '../form';

const ThreeDStructureLabel = (props) => {
  const useForm = useFormHook();

  const getTitle = (threeDStructure) => {
    const firstClassTitle = toTitleCase(threeDStructure.type || '3D Structure');
    const secondClassTitle = useForm.getLabel(threeDStructure.feature_type || threeDStructure.fault_or_sz_type,
      ['_3d_structures', threeDStructure.type]).toUpperCase();
    return firstClassTitle + ' - ' + secondClassTitle;
  };

  return (
    <Text>{getTitle(props.item)}</Text>
  );
};
export default ThreeDStructureLabel;
