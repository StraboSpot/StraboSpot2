package com.strabospot2

import android.os.Build
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.os.Bundle
import android.view.View
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "StraboSpot2"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

/**
    * Will hide the bottom Android navigation bar when app is focused. User can swipe up from the bottom to reveal the bar and it will dismiss after ~3 seconds.
    * https://developer.android.com/develop/ui/views/layout/immersive
 */
      override fun onCreate(savedInstanceState: Bundle?) {
          super.onCreate(savedInstanceState)
          enterImmersiveMode()
        }

        override fun onWindowFocusChanged(hasFocus: Boolean) {
          super.onWindowFocusChanged(hasFocus)
          if (hasFocus) {
            enterImmersiveMode()
          }
        }

        private fun enterImmersiveMode() {
             if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                 // For Android 11 (API 30) and above
                 window.setDecorFitsSystemWindows(false)
                 window.insetsController?.let { controller ->
                   controller.hide(WindowInsets.Type.navigationBars())
                   controller.systemBarsBehavior =
                     WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                 }
               } else {
                 // For Android 10 and below (fallback)
                 @Suppress("DEPRECATION")
                 window.decorView.systemUiVisibility =
                   (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                     or View.SYSTEM_UI_FLAG_FULLSCREEN
                     or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                     or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                     or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                     or View.SYSTEM_UI_FLAG_LAYOUT_STABLE)
               }
        }
}
