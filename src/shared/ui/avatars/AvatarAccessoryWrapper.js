import React from 'react';

import {Avatar} from '@rn-vui/base';

const AvatarAccessoryWrapper = ({...props}) => {
  return (
    <Avatar.Accessory {...props}/>
  );
};

export default AvatarAccessoryWrapper;
