import React from 'react';
import {Button} from 'react-native-elements';
import Dialog, {
  DialogTitle,
  DialogContent,
  FadeAnimation,
} from 'react-native-popup-dialog';

// Styles
import commonStyles from '../../shared/common.styles';
import projectStyles from './project.styles';

const DescriptionEditingModal = (props) => {

  return (
    <React.Fragment>
      <Dialog
        dialogStyle={commonStyles.dialogBox}
        width={300}
        visible={props.visible}
        dialogAnimation={new FadeAnimation({
          animationDuration: 300,
          useNativeDriver: true,
        })}
        onTouchOutside={props.onTouchOutside}
        useNativeDriver={true}
        dialogTitle={
          <DialogTitle
            style={props.style}
            textStyle={commonStyles.dialogTitleText}
            title={props.dialogTitle}/>
        }
      >
        <DialogContent style={[commonStyles.dialogContent, props.dialogContent]}>
            {props.children}
            <Button
              disabled={props.disabled}
              onPress={props.confirm}
              containerStyle={projectStyles.buttonContainer}
              type={'clear'} title={'Close'}/>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default DescriptionEditingModal;
