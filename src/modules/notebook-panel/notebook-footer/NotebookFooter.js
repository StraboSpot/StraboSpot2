import React, {useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import MorePagesMenu from './MorePagesMenu';
import footerStyle from './notebookFooter.styles';
import {isEmpty} from '../../../shared/Helpers';
import IconButton from '../../../shared/ui/IconButton';
import {NOTEBOOK_PAGES} from '../../page/page.constants';
import usePageHoook from '../../page/usePage';

const NotebookFooter = (props) => {
  const notebookPagesOn = useSelector(state => state.notebook.notebookPagesOn);
  const notebookPageVisible = useSelector(state => (
    !isEmpty(state.notebook.visibleNotebookPagesStack) && state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  ));
  const [isMorePagesMenuVisible, setIsMorePagesMenuVisible] = useState(false);

  const usePage = usePageHoook();

  const pagesToShow = [...usePage.getRelevantGeneralPages(), ...usePage.getRelevantPetPages(), ...usePage.getRelevantSedPages()];
  const notebookPagesValidOn = notebookPagesOn.filter(i => pagesToShow.find(p => p.key === i));

  const getPageIcon = (key) => {
    const page = NOTEBOOK_PAGES.find(p => p.key === key);
    return notebookPageVisible === key ? page.icon_pressed_src : page.icon_src;
  };

  return (
    <React.Fragment>
      <View
        style={notebookPagesValidOn.length <= 6 ? footerStyle.footerIconContainer : footerStyle.footerIconContainerWrap}
      >
        {notebookPagesValidOn.map(key => (
          <IconButton
            key={key}
            source={getPageIcon(key)}
            onPress={() => props.openPage(key)}
          />
        ))}
        <Button
          containerStyle={{alignSelf: 'center'}}
          buttonStyle={{padding: 15}}
          title={'MORE'}
          type={'clear'}
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

export default NotebookFooter;
