import React from 'react';

import {AvatarWrapper} from './';
import usePage from '../../../modules/page/usePage';

const NotebookPageAvatar = ({pageKey}) => {
  const {getSpotDataIconSource} = usePage();

  return (
    <AvatarWrapper
      size={20}
      source={getSpotDataIconSource(pageKey)}
    />
  );
};

export default NotebookPageAvatar;
