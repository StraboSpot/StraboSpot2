import React from 'react';
import {Platform, Pressable, ScrollView, Switch, Text, View} from 'react-native';

import {Avatar, ListItem, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import footerStyles from './notebookFooter.styles';
import {isEmpty} from '../../../shared/Helpers';
import SectionDivider from '../../../shared/ui/SectionDivider';
import overlayStyles from '../../home/overlays/overlay.styles';
import usePageHook from '../../page/usePage';
import {addedNotebookPageOn, removedNotebookPageOn, setNotebookPageVisible} from '../notebook.slice';

const MorePagesMenu = ({
                         closeMorePagesMenu,
                         visible,
                       }) => {
  const dispatch = useDispatch();
  const notebookPagesOn = useSelector(state => state.notebook.notebookPagesOn);

  const usePage = usePageHook();

  const generalPagesToShow = usePage.getRelevantGeneralPages();
  const petPagesToShow = usePage.getRelevantPetPages();
  const sedPagesToShow = usePage.getRelevantSedPages();

  const switchPage = (key) => {
    dispatch(setNotebookPageVisible(key));
    closeMorePagesMenu();
  };

  const togglePageSwitch = (key) => {
    if (notebookPagesOn.includes(key)) dispatch(removedNotebookPageOn(key));
    else dispatch(addedNotebookPageOn(key));
  };

  const renderMenuItem = (page, isShowBottomDivider) => {
    return (
      <ListItem
        bottomDivider={isShowBottomDivider}
        containerStyle={footerStyles.morePagesListItem}
        key={page.key}
      >
        <ListItem.Content style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Pressable
            style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}
            onPress={() => switchPage(page.key)}>
            <Avatar
              source={page.icon_src}
              placeholderStyle={{backgroundColor: 'transparent'}}
              size={20}
            />
            <ListItem.Title style={footerStyles.morePagesListItemTitle}>{page.label}</ListItem.Title>
          </Pressable>
          <View style={{paddingLeft: 5, paddingRight: Platform.OS === 'web' ? 10 : 0}}>
            <Switch
              onValueChange={() => togglePageSwitch(page.key)}
              value={notebookPagesOn.includes(page.key)}
            />
          </View>
        </ListItem.Content>
      </ListItem>
    );
  };

  return (
    <Overlay
      overlayStyle={footerStyles.morePagesDialog}
      isVisible={visible}
      onBackdropPress={closeMorePagesMenu}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>More Pages</Text>
      </View>
      <View style={{flex: 1, paddingBottom: 10, paddingLeft: 10, paddingRight: 10, paddingTop: 10}}>
        <ScrollView>
          {generalPagesToShow.map((page, i, arr) => renderMenuItem(page, i < arr.length - 1))}
          {!isEmpty(petPagesToShow) && (
            <React.Fragment>
              <SectionDivider
                dividerText={'Rocks & Minerals'}
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
      </View>
    </Overlay>
  );
};

export default MorePagesMenu;
