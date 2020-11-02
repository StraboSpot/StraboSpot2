import React, {useState} from 'react';
import {View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button} from 'react-native-elements';
import {connect} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import IconButton from '../../../shared/ui/IconButton';
import {NOTEBOOK_PAGES} from '../notebook.constants';
import MorePagesMenu from './MorePagesMenu';
import footerStyle from './notebookFooter.styles';

const NotebookFooter = props => {
  const navigation = useNavigation();
  const [isMorePagesMenuVisible, setIsMorePagesMenuVisible] = useState(false);

  const getPageIcon = (page) => {
    switch (page) {
      case NOTEBOOK_PAGES.TAG:
        if (props.notebookPageVisible === NOTEBOOK_PAGES.TAG) return require('../../../assets/icons/Tag_pressed.png');
        else return require('../../../assets/icons/Tag.png');
      case NOTEBOOK_PAGES.MEASUREMENT:
        if (props.notebookPageVisible === NOTEBOOK_PAGES.MEASUREMENT
          || props.notebookPageVisible === NOTEBOOK_PAGES.MEASUREMENTDETAIL) {
          return require('../../../assets/icons/Measurement_pressed.png');
        }
        else return require('../../../assets/icons/Measurement.png');
      case NOTEBOOK_PAGES.SAMPLE:
        if (props.notebookPageVisible === NOTEBOOK_PAGES.SAMPLE) {
          return require('../../../assets/icons/Sample_pressed.png');
        }
        else return require('../../../assets/icons/Sample.png');
      case NOTEBOOK_PAGES.NOTE:
        if (props.notebookPageVisible === NOTEBOOK_PAGES.NOTE) return require('../../../assets/icons/Note_pressed.png');
        else return require('../../../assets/icons/Note.png');
      case NOTEBOOK_PAGES.PHOTO:
        if (props.notebookPageVisible === NOTEBOOK_PAGES.PHOTO) {
          return require('../../../assets/icons/Photo_pressed.png');
        }
        else return require('../../../assets/icons/Photo.png');
      case NOTEBOOK_PAGES.SKETCH:
        if (props.notebookPageVisible === NOTEBOOK_PAGES.SKETCH) {
          return require('../../../assets/icons/Sketch_pressed.png');
        }
        else return require('../../../assets/icons/Sketch.png');
    }
  };

  return (
    <React.Fragment>
      <View style={footerStyle.footerIconContainer}>
        <IconButton
          source={getPageIcon(NOTEBOOK_PAGES.TAG)}
          onPress={() => props.openPage(NOTEBOOK_PAGES.TAG)}

        />
        <IconButton
          source={getPageIcon(NOTEBOOK_PAGES.MEASUREMENT)}
          onPress={() => props.openPage(NOTEBOOK_PAGES.MEASUREMENT)}
        />
        <IconButton
          source={getPageIcon(NOTEBOOK_PAGES.SAMPLE)}
          onPress={() => props.openPage(NOTEBOOK_PAGES.SAMPLE)}
        />
        <IconButton
          source={getPageIcon(NOTEBOOK_PAGES.NOTE)}
          onPress={() => props.openPage(NOTEBOOK_PAGES.NOTE)}

        />
        <IconButton
          source={getPageIcon(NOTEBOOK_PAGES.PHOTO)}
          onPress={() => props.openPage(NOTEBOOK_PAGES.PHOTO)}
        />
        <IconButton
          source={getPageIcon(NOTEBOOK_PAGES.SKETCH)}
          onPress={() => navigation.navigate('Sketch')}
        />
        <Button
          containerStyle={{alignSelf: 'center'}}
          title={'MORE'}
          type='clear'
          titleStyle={footerStyle.morePagesButton}
          onPress={() => setIsMorePagesMenuVisible(true)}
        />
      </View>
      <MorePagesMenu
        visible={isMorePagesMenuVisible}
        closeMorePagesMenu={() => setIsMorePagesMenuVisible(false)}
      />
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    notebookPageVisible: isEmpty(state.notebook.visibleNotebookPagesStack)
      ? null
      : state.notebook.visibleNotebookPagesStack.slice(-1)[0],
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookFooter);
