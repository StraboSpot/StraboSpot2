import React from 'react';
import {StatusBar} from 'react-native';

import SystemNavigationBar from 'react-native-system-navigation-bar';

import * as themes from '../shared/styles.constants';
import {SMALL_SCREEN} from '../shared/styles.constants';

const SystemBars = () => {
  // SystemNavigationBar settings for Android only
  SystemNavigationBar.setNavigationColor(themes.SECONDARY_BACKGROUND_COLOR, 'dark', 'navigation');
  SystemNavigationBar.navigationHide();

  if (!SMALL_SCREEN) return <StatusBar hidden={true}/>;
};

export default SystemBars;
