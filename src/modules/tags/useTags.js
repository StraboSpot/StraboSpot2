import React from 'react';
import {tagTypes} from './tags.constants';

const useTags = (props) => {

  const getTagTypes = () => {
    return tagTypes;
  };

  const tagsHelpers = {
    getTagTypes: getTagTypes,
  };

  return [tagsHelpers];
};

export default useTags;
