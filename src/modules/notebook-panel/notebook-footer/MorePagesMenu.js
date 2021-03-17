import React from 'react';
import {View, Switch, ScrollView} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import SectionDivider from '../../../shared/ui/SectionDivider';
import {
  PRIMARY_NOTEBOOK_PAGES,
  SECONDARY_NOTEBOOK_PAGES,
  PET_NOTEBOOK_PAGES,
  SED_NOTEBOOK_PAGES,
  NOTEBOOK_PAGES_ICONS,
  NOTEBOOK_PAGES,
} from '../notebook.constants';
import {setNotebookPageVisible, addedNotebookToolbarIcon, removedNotebookToolbarIcon} from '../notebook.slice';
import styles from '../notebookPanel.styles';
import footerStyles from './notebookFooter.styles';

const MorePagesMenu = (props) => {
  const dispatch = useDispatch();
  const toolbarIcons = useSelector(state => state.notebook.notebookToolbarIcons);

  const switchPage = (page) => {
    dispatch(setNotebookPageVisible(page));
    props.closeMorePagesMenu();
  };

  const toggleSwitch = (page) => {
    if (toolbarIcons.includes(page)) dispatch(removedNotebookToolbarIcon(page));
    else dispatch(addedNotebookToolbarIcon(page));
  };

  const renderMenuItem = (page, isShowBottomDivider) => {
    const pageKey = Object.keys(NOTEBOOK_PAGES).find(key => NOTEBOOK_PAGES[key] === page);
    return (
      <ListItem
        containerStyle={footerStyles.morePagesListItem}
        onPress={() => switchPage(page)}
        bottomDivider={isShowBottomDivider}
      >
        <ListItem.Content style={{flexDirection: 'row'}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              <Avatar
                source={NOTEBOOK_PAGES_ICONS[pageKey]}
                placeholderStyle={{backgroundColor: 'transparent'}}
                size={20}
                containerStyle={{alignSelf: 'center'}}
              />
              <ListItem.Title style={{paddingLeft: 5, alignSelf: 'center'}}>{page}</ListItem.Title>
            </View>
            <Switch
              onChange={() => toggleSwitch(page)}
              value={toolbarIcons.includes(page)}
            />
          </View>
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
        <ScrollView>
          {Object.values({...PRIMARY_NOTEBOOK_PAGES, ...SECONDARY_NOTEBOOK_PAGES}).map(
            (item, i, arr) => renderMenuItem(item, i < arr.length - 1))}
          <SectionDivider
            dividerText={'Ig/Met'}
            style={footerStyles.morePagesSectionDivider}
          />
          {Object.values(PET_NOTEBOOK_PAGES).map((item, i, arr) => renderMenuItem(item, i < arr.length - 1))}
          {/*<SectionDivider*/}
          {/*  dividerText={'Sedimentology'}*/}
          {/*  style={footerStyles.morePagesSectionDivider}*/}
          {/*/>*/}
          {/*{Object.values(SED_NOTEBOOK_PAGES).map((item, i, arr) => renderMenuItem(item, i < arr.length - 1))}*/}
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
};

export default MorePagesMenu;
