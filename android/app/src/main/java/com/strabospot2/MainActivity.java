package com.strabospot2;

import com.reactnativenavigation.NavigationActivity;
import com.rnfs.RNFSPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.reactlibrary.RNSimpleCompassPackage;
import com.sensors.RNSensorsPackage;

import java.util.Arrays;
import java.util.List;


public class MainActivity extends NavigationActivity {

    //@Override   // In RNFS docs but does not work
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new RNFSPackage(),
        new RNSimpleCompassPackage(),
        new RNSensorsPackage()
      );
    }
}