package com.strabospot2;

import com.reactnativenavigation.NavigationActivity;
import com.rnfs.RNFSPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.reactlibrary.RNSimpleCompassPackage;
import com.sensors.RNSensorsPackage;
import com.imagepicker.permissions.OnImagePickerPermissionsCallback;
import com.facebook.react.modules.core.PermissionListener;
import android.content.Intent;
import android.content.res.Configuration;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;


import java.util.Arrays;
import java.util.List;


public class MainActivity extends NavigationActivity implements OnImagePickerPermissionsCallback {
   private PermissionListener listener;
    //@Override   // In RNFS docs but does not work
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new RNFSPackage(),
        new RNSimpleCompassPackage(),
        new RNSensorsPackage()
      );
    }

    @Override
      public void setPermissionListener(PermissionListener listener)
      {
        this.listener = listener;
      }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults)
    {
      if (listener != null)
      {
        listener.onRequestPermissionsResult(requestCode, permissions, grantResults);
      }
      super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }

  }
