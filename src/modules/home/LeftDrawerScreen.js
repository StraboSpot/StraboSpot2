import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import {Drawer} from 'react-native-drawer-layout';

import HomeScreen from './HomeScreen';
import {LeftDrawerContext} from './RightDrawerContext';
// import MainMenuPanel from '../main-menu-panel/MainMenuPanel';
// import {ImageInfo, ImageSlider} from '../images';
// import Sketch from '../sketch/Sketch';

const LeftDrawerScreen = () => {

  const Stack = createStackNavigator();

  const navigationOptions = {
    gestureEnabled: false,
    headerShown: false,
  };

  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      openLeftDrawer: () => setLeftDrawerOpen(true),
      closeLeftDrawer: () => setLeftDrawerOpen(false),
    }),
    [],
  );

  return (
    <Drawer
      open={leftDrawerOpen}
      onOpen={() => setLeftDrawerOpen(true)}
      onClose={() => setLeftDrawerOpen(false)}
      drawerPosition='left'
      renderDrawerContent={()=><></>}
    >
      <LeftDrawerContext.Provider value={value}>
        <Stack.Navigator>
          <Stack.Screen
            name={'HomeScreen'}
            component={HomeScreen}
            options={navigationOptions}
            // initialParams={{setIsSignedIn}}
          />
          {/*<Stack.Screen*/}
          {/*  name={'ImageInfo'}*/}
          {/*  component={ImageInfo}*/}
          {/*  options={navigationOptions}*/}
          {/*/>*/}
          {/*<Stack.Screen*/}
          {/*  name={'ImageSlider'}*/}
          {/*  component={ImageSlider}*/}
          {/*  options={navigationOptions}*/}
          {/*/>*/}
          {/*<Stack.Screen*/}
          {/*  name={'Sketch'}*/}
          {/*  component={Sketch}*/}
          {/*  options={navigationOptions}*/}
          {/*/>*/}
        </Stack.Navigator>
      </LeftDrawerContext.Provider>
    </Drawer>
  );
};

export default LeftDrawerScreen;
