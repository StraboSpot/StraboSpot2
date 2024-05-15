import React from 'react';

import {Drawer} from 'react-native-drawer-layout';

import LeftDrawerScreen from './LeftDrawerScreen';
import RightDrawerContent from './RightDrawerContent';
import {RightDrawerContext} from './RightDrawerContext';

function RightDrawerScreen() {

  const [rightDrawerOpen, setRightDrawerOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      openRightDrawer: () => setRightDrawerOpen(true),
      closeRightDrawer: () => setRightDrawerOpen(false),
    }),
    [],
  );

  return (
    <Drawer
      open={rightDrawerOpen}
      onOpen={() => setRightDrawerOpen(true)}
      onClose={() => setRightDrawerOpen(false)}
      drawerPosition='right'
      renderDrawerContent={RightDrawerContent}
    >
      <RightDrawerContext.Provider value={value}>
        <LeftDrawerScreen/>
      </RightDrawerContext.Provider>
    </Drawer>
  );
}

export default RightDrawerScreen;
