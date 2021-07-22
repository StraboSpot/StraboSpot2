import React from 'react';
import {ScrollView, Switch, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import SectionDivider from '../../../shared/ui/SectionDivider';
import {PET_PAGES, PRIMARY_PAGES, SECONDARY_PAGES, SED_PAGES} from '../../page/page.constants';
import {addedNotebookPageOn, removedNotebookPageOn, setNotebookPageVisible} from '../notebook.slice';
import styles from '../notebookPanel.styles';
import footerStyles from './notebookFooter.styles';

const MorePagesMenu = (props) => {
  const dispatch = useDispatch();
  const notebookPagesOn = useSelector(state => state.notebook.notebookPagesOn);
  const isTestingMode = useSelector(state => state.project.isTestingMode);

  const mainPagesToShow = [...PRIMARY_PAGES, ...SECONDARY_PAGES].reduce((acc, page) => {
    return (!page.testing || (isTestingMode && page?.testing)) ? [...acc, page] : acc
  }, [])
  const petPagesToShow = PET_PAGES.reduce((acc, page) => {
    return (!page.testing || (isTestingMode && page?.testing)) ? [...acc, page] : acc
  }, [])
  const sedPagesToShow = SED_PAGES.reduce((acc, page) => {
    return (!page.testing || (isTestingMode && page?.testing)) ? [...acc, page] : acc
  }, [])

  const switchPage = (key) => {
    dispatch(setNotebookPageVisible(key));
    props.closeMorePagesMenu();
  };

  const togglePageSwitch = (key) => {
    if (notebookPagesOn.includes(key)) dispatch(removedNotebookPageOn(key));
    else dispatch(addedNotebookPageOn(key));
  };

  const renderMenuItem = (page, isShowBottomDivider) => {
    return (
      <ListItem
        containerStyle={footerStyles.morePagesListItem}
        onPress={() => switchPage(page.key)}
        bottomDivider={isShowBottomDivider}
      >
        <ListItem.Content style={{flexDirection: 'row'}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              <Avatar
                source={page.icon_src}
                placeholderStyle={{backgroundColor: 'transparent'}}
                size={20}
                containerStyle={{alignSelf: 'center'}}
              />
              <ListItem.Title style={footerStyles.morePagesListItemTitle}>{page.label}</ListItem.Title>
            </View>
            <Switch
              onChange={() => togglePageSwitch(page.key)}
              value={notebookPagesOn.includes(page.key)}
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
          {mainPagesToShow.map((page, i, arr) => renderMenuItem(page, i < arr.length - 1))}
          {!isEmpty(petPagesToShow) && (
            <React.Fragment>
              <SectionDivider
                dividerText={'Ig/Met'}
                style={footerStyles.morePagesSectionDivider}
              />
              {petPagesToShow.map((page, i, arr) => renderMenuItem(page, i < arr.length - 1))}
            </React.Fragment>
          )}
          {!isEmpty(sedPagesToShow) && (
            <React.Fragment>
              <SectionDivider
                dividerText={'Sedimentology'}
                style={footerStyles.morePagesSectionDivider}
              />
              {sedPagesToShow.map((page, i, arr) => renderMenuItem(page, i < arr.length - 1))}
            </React.Fragment>
          )}
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
};

export default MorePagesMenu;
