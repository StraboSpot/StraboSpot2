import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Dialog, DialogTitle, DialogContent, SlideAnimation, FadeAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';

const projectListModal = (props) => {

  const [visible, setVisible] = useState(true);
 return (
   <Dialog
     width={275}
     visible={visible}
     dialogAnimation={new FadeAnimation({
       useNativeDriver: true,
       animationDuration: 500
     })}
    dialogTitle={
      <DialogTitle
        title={'Select A Project'}
      />
    }
     onTouchOutside={() => setVisible(false)}
   >
     <DialogContent>
       {props.children}
     </DialogContent>
   </Dialog>
 )
};

export default projectListModal;
