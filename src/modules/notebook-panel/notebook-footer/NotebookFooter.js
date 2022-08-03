import React, {useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import IconButton from '../../../shared/ui/IconButton';
import {NOTEBOOK_PAGES} from '../../page/page.constants';
import MorePagesMenu from './MorePagesMenu';
import footerStyle from './notebookFooter.styles';

const NotebookFooter = (props) => {
  const isTestingMode = useSelector(state => state.project.isTestingMode);
  const notebookPagesOn = useSelector(state => state.notebook.notebookPagesOn);
  const notebookPageVisible = useSelector(state => (
    !isEmpty(state.notebook.visibleNotebookPagesStack) && state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  ));
  const [isMorePagesMenuVisible, setIsMorePagesMenuVisible] = useState(false);

  const notebookPagesValidOn = notebookPagesOn.filter((i) => {
    const page = NOTEBOOK_PAGES.find(p => p.key === i);
    if (!page) return false;
    return !page.testing || (isTestingMode && page?.testing);
  });

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
