import React from 'react';

import {ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {useDispatch} from 'react-redux';

import SectionDivider from '../../../shared/ui/SectionDivider';
import {SECONDARY_NOTEBOOK_PAGES, SED_NOTEBOOK_PAGES, notebookReducers} from '../notebook.constants';
import styles from '../notebookPanel.styles';
import footerStyles from './notebookFooter.styles';

const MorePagesMenu = (props) => {
  const dispatch = useDispatch();

  const switchPage = (page) => {
    const moreNotebookPages = {...SECONDARY_NOTEBOOK_PAGES, ...SED_NOTEBOOK_PAGES};
    dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: moreNotebookPages[page]});
    props.closeMorePagesMenu();
  };

  const renderMenuItem = ([key, name], isShowBottomDivider) => {
    return (
      <ListItem
        containerStyle={footerStyles.morePagesListItem}
        onPress={() => switchPage(key)}
        bottomDivider={isShowBottomDivider}
      >
        <ListItem.Content>
          <ListItem.Title>{name}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    );
  };

  return (
    <Dialog
      dialogStyle={footerStyles.morePagesDialog}
      visible={props.visible}
      onTouchOutside={props.closeMorePagesMenu}
      dialogTitle={
        <DialogTitle
          title='More Pages'
          style={styles.dialogTitle}
          textStyle={styles.dialogTitleText}
        />
      }
    >
      <DialogContent>
        {Object.entries(SECONDARY_NOTEBOOK_PAGES).map((item, i, arr) => renderMenuItem(item, i < arr.length - 1))}
        <SectionDivider
          dividerText={'Sedimentology'}
          style={footerStyles.morePagesSectionDivider}
        />
        {Object.entries(SED_NOTEBOOK_PAGES).map((item, i, arr) => renderMenuItem(item, i < arr.length - 1))}
      </DialogContent>
    </Dialog>
  );
};

export default MorePagesMenu;
