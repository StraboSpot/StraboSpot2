import React from 'react';
import {ScrollView, Switch, Text, View} from 'react-native';

import {Avatar, ListItem, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import SectionDivider from '../../../shared/ui/SectionDivider';
import overlayStyles from '../../home/overlay.styles';
import usePageHoook from '../../page/usePage';
import {addedNotebookPageOn, removedNotebookPageOn, setNotebookPageVisible} from '../notebook.slice';
import footerStyles from './notebookFooter.styles';

const MorePagesMenu = (props) => {
  const dispatch = useDispatch();
  const notebookPagesOn = useSelector(state => state.notebook.notebookPagesOn);

  const usePage = usePageHoook();

  const generalPagesToShow = usePage.getRelevantGeneralPages();
  const petPagesToShow = usePage.getRelevantPetPages();
  const sedPagesToShow = usePage.getRelevantSedPages();

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
        key={page.key}
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
    <Overlay
      overlayStyle={footerStyles.morePagesDialog}
      isVisible={props.visible}
      onBackdropPress={props.closeMorePagesMenu}
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
