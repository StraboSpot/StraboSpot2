package com.strabospot2;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
 import com.facebook.react.ReactRootView;
 import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
 import android.os.Bundle;
 import android.view.View;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "StraboSpot2";
  }

   /**
     * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
     * you can specify the rendered you wish to use (Fabric or the older renderer).
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
      return new MainActivityDelegate(this, getMainComponentName());
    }
    public static class MainActivityDelegate extends ReactActivityDelegate {
      public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
        super(activity, mainComponentName);
      }
      @Override
      protected ReactRootView createRootView() {
        ReactRootView reactRootView = new ReactRootView(getContext());
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
        return reactRootView;
      }
    }
//     @Override
//     protected ReactActivityDelegate createReactActivityDelegate() {
//       return new ReactActivityDelegate(this, getMainComponentName()) {
//         @Override
//         protected ReactRootView createRootView() {
//          return new RNGestureHandlerEnabledRootView(MainActivity.this);
//         }
//       };
//     }
     @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            hideNavigationBar();
        }

        @Override
        public void onWindowFocusChanged(boolean hasFocus) {
            super.onWindowFocusChanged(hasFocus);
            if (hasFocus) {
                hideNavigationBar();
            }
        }

        private void hideNavigationBar() {
            getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
}
