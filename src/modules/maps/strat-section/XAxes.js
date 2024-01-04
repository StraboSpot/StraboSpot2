import React from 'react';

import {useSelector} from 'react-redux';

import XAxis from './XAxis';

const XAxes = () => {
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <>
      <XAxis/>
      {stratSection?.column_profile === 'mixed_clastic' && (
        <>
          <XAxis n={2}/>
          {stratSection?.misc_labels && <XAxis n={4}/>}
        </>
      )}
      {stratSection?.misc_labels && <XAxis n={2}/>}
    </>
  );
};

export default XAxes;
