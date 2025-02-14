import React from 'react';

import SectionDivider from '../../shared/ui/SectionDivider';
import {AddImageButtons, ImagesList} from '../images';

const ReportImages = ({updatedImages, setUpdatedImages}) => {

  const saveImagesToReport = (newImages) => {
    setUpdatedImages(prevState => ([...prevState, ...newImages]));
  };

  return (
    <>
      <SectionDivider dividerText={'Photos & Sketches'}/>
      <AddImageButtons saveImages={saveImagesToReport}/>
      <ImagesList images={updatedImages}/>
    </>
  );

};

export default ReportImages;
