import React from 'react';

import {Button, Icon, Overlay} from 'react-native-elements';
import Pdf from 'react-native-pdf';

import {isEmpty} from '../../shared/Helpers';
import {BLACK} from '../../shared/styles.constants';

const MicroProjectPDFOverlay = ({doc, setVisible, visible}) => {

  return (
    <Overlay isVisible={visible} overlayStyle={{height: '100%', width: '100%'}}>
      <Button
        type={'clear'}
        containerStyle={{alignItems: 'flex-end'}}
        onPress={() => setVisible(!visible)}
        icon={
          <Icon
            name={'close-outline'}
            type={'ionicon'}
            size={30}
            color={BLACK}
          />
        }
      />
      {!isEmpty(doc) && (
        <Pdf
          source={doc.file}
          style={{flex: 1}}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
        />
      )}
    </Overlay>
  );
};

export default MicroProjectPDFOverlay;
