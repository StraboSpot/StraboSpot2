import React from 'react';
import {Text, View} from 'react-native';
import {Dialog, DialogTitle, DialogContent, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';

const projectDialogBox = (props) => {
  return (
    <React.Fragment>
      <Dialog
        // overlayBackgroundColor={'red'}
        overlayOpacity={0.5}
        width={275}
        visible={props.visible}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top'
        })}
        useNativeDriver={true}
        dialogTitle={
          <DialogTitle
          title={'Start or Select Project'}
          />
        }
        footer={
          <DialogFooter>
            <DialogButton
            text={'Start Project'}
            onPress={() => props.onPress('startProject')}
            />
            <DialogButton
              text={'Load From Server'}
              onPress={() => props.onPress('loadProject')}
            />
          </DialogFooter>
        }
      >
        <DialogContent>
          {props.children}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default projectDialogBox;
