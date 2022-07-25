### 1.28.0 (2022-07-25)

##### Build System / Dependencies

* **package.json:**
  *  Testing changelog scripts (3595d057)
  *  Re-added babel-plugin-transform-remove-console because it was removed accidentally during upgrading (a2213603)
* **Podfile.lock:**  Updated DoubleConversion checksum (91b3534f)
* **package-json:**
  *  Changed StraboSpot to lowercase in package-json to remove error.  Package-lock was updated (056dfb27)
  *  Removed extra babel packages that were once needed for the initial upgrade of RN 0.68.2 (5294790e)
* **Flipper:**  Upgraded to 0.154.0 (c1d319b8)
* **/ios/Info.plist:**  removed the portrait orientation (46ee21c0)

##### New Features

* **DatasetList:**  Added a modal that will ask the user if they want to make the dataset they just turned on the current one.  Minor formatting. (8cef2420)
* **Modules:**  Implemented new method for Toast.js (20d0679c)
* **Package-json:**  Added react-native-toast-notifications and removed react-native-easy-toast from project (7f3273c0)
* **Documentation.js:**  Added Strabo_Help_Guide.pdf to documentation (f9e6b82b)

##### Bug Fixes

* **BatteryInfo:**  Fixed percentage string (f8071f6c)
* **Notes:**  Reset form after save before navigation (ac8a5fe7)
* **useMaps:**  Added back and cleaned up 'enableHighAccuracy' because Android still has an issue with timing out. (40dae818)
* **Geography.js amd isMapFeatures.js:**  Added elevaion accuracy and gps accuracy to Stereonet data (a4f7b3b0)
* **Compass.js:**
  *  Fixed compass data from continually observing even after the compass was closed. (2396bfc2)
  *  Added a unixTimeStamp when taking a measurement. (9e05df1f)
* **/measurements:**  Adds modified_timestamp and unixTimeStamp when making changes to the measurement. (653423a2)
* **useMapFeatures.js:**  Adds the unixTimeStamp and modified_timestamp when copying data to Stereonet. (98350ce5)

##### Code Style Changes

* **Home.js:**  Changed out Alert for new toast method. (00747445)
* **Orientations:**  Changed unixTimeStamp => unix_timestamp to be consistent. minor formatting (0e5201d1)
* **/ios:**  Fixed spelling of RCT_EXTERN_METHOD(myAccelerometer) (a6517e3e)

### 1.28.0 (2022-07-25)

##### Build System / Dependencies

* **package.json:**  Re-added babel-plugin-transform-remove-console because it was removed accidentally during upgrading (a2213603)
* **Podfile.lock:**  Updated DoubleConversion checksum (91b3534f)
* **package-json:**
  *  Changed StraboSpot to lowercase in package-json to remove error.  Package-lock was updated (056dfb27)
  *  Removed extra babel packages that were once needed for the initial upgrade of RN 0.68.2 (5294790e)
* **Flipper:**  Upgraded to 0.154.0 (c1d319b8)
* **/ios/Info.plist:**  removed the portrait orientation (46ee21c0)

##### New Features

* **DatasetList:**  Added a modal that will ask the user if they want to make the dataset they just turned on the current one.  Minor formatting. (8cef2420)
* **Modules:**  Implemented new method for Toast.js (20d0679c)
* **Package-json:**  Added react-native-toast-notifications and removed react-native-easy-toast from project (7f3273c0)
* **Documentation.js:**  Added Strabo_Help_Guide.pdf to documentation (f9e6b82b)

##### Bug Fixes

* **BatteryInfo:**  Fixed percentage string (f8071f6c)
* **Notes:**  Reset form after save before navigation (ac8a5fe7)
* **useMaps:**  Added back and cleaned up 'enableHighAccuracy' because Android still has an issue with timing out. (40dae818)
* **Geography.js amd isMapFeatures.js:**  Added elevaion accuracy and gps accuracy to Stereonet data (a4f7b3b0)
* **Compass.js:**
  *  Fixed compass data from continually observing even after the compass was closed. (2396bfc2)
  *  Added a unixTimeStamp when taking a measurement. (9e05df1f)
* **/measurements:**  Adds modified_timestamp and unixTimeStamp when making changes to the measurement. (653423a2)
* **useMapFeatures.js:**  Adds the unixTimeStamp and modified_timestamp when copying data to Stereonet. (98350ce5)

##### Code Style Changes

* **Home.js:**  Changed out Alert for new toast method. (00747445)
* **Orientations:**  Changed unixTimeStamp => unix_timestamp to be consistent. minor formatting (0e5201d1)
* **/ios:**  Fixed spelling of RCT_EXTERN_METHOD(myAccelerometer) (a6517e3e)

### 1.28.0 (2022-07-25)

##### Build System / Dependencies

* **package.json:**  Re-added babel-plugin-transform-remove-console because it was removed accidentally during upgrading (a2213603)
* **Podfile.lock:**  Updated DoubleConversion checksum (91b3534f)
* **package-json:**
  *  Changed StraboSpot to lowercase in package-json to remove error.  Package-lock was updated (056dfb27)
  *  Removed extra babel packages that were once needed for the initial upgrade of RN 0.68.2 (5294790e)
* **Flipper:**  Upgraded to 0.154.0 (c1d319b8)
* **/ios/Info.plist:**  removed the portrait orientation (46ee21c0)

##### New Features

* **DatasetList:**  Added a modal that will ask the user if they want to make the dataset they just turned on the current one.  Minor formatting. (8cef2420)
* **Modules:**  Implemented new method for Toast.js (20d0679c)
* **Package-json:**  Added react-native-toast-notifications and removed react-native-easy-toast from project (7f3273c0)
* **Documentation.js:**  Added Strabo_Help_Guide.pdf to documentation (f9e6b82b)

##### Bug Fixes

* **BatteryInfo:**  Fixed percentage string (f8071f6c)
* **Notes:**  Reset form after save before navigation (ac8a5fe7)
* **useMaps:**  Added back and cleaned up 'enableHighAccuracy' because Android still has an issue with timing out. (40dae818)
* **Geography.js amd isMapFeatures.js:**  Added elevaion accuracy and gps accuracy to Stereonet data (a4f7b3b0)
* **Compass.js:**
  *  Fixed compass data from continually observing even after the compass was closed. (2396bfc2)
  *  Added a unixTimeStamp when taking a measurement. (9e05df1f)
* **/measurements:**  Adds modified_timestamp and unixTimeStamp when making changes to the measurement. (653423a2)
* **useMapFeatures.js:**  Adds the unixTimeStamp and modified_timestamp when copying data to Stereonet. (98350ce5)

##### Code Style Changes

* **Home.js:**  Changed out Alert for new toast method. (00747445)
* **Orientations:**  Changed unixTimeStamp => unix_timestamp to be consistent. minor formatting (0e5201d1)
* **/ios:**  Fixed spelling of RCT_EXTERN_METHOD(myAccelerometer) (a6517e3e)

#### 1.27.1 (2022-07-25)

##### Build System / Dependencies

* **package.json:**  Re-added babel-plugin-transform-remove-console because it was removed accidentally during upgrading (a2213603)
* **Podfile.lock:**  Updated DoubleConversion checksum (91b3534f)
* **package-json:**
  *  Changed StraboSpot to lowercase in package-json to remove error.  Package-lock was updated (056dfb27)
  *  Removed extra babel packages that were once needed for the initial upgrade of RN 0.68.2 (5294790e)
* **Flipper:**  Upgraded to 0.154.0 (c1d319b8)
* **/ios/Info.plist:**  removed the portrait orientation (46ee21c0)

##### New Features

* **DatasetList:**  Added a modal that will ask the user if they want to make the dataset they just turned on the current one.  Minor formatting. (8cef2420)
* **Modules:**  Implemented new method for Toast.js (20d0679c)
* **Package-json:**  Added react-native-toast-notifications and removed react-native-easy-toast from project (7f3273c0)
* **Documentation.js:**  Added Strabo_Help_Guide.pdf to documentation (f9e6b82b)

##### Bug Fixes

* **BatteryInfo:**  Fixed percentage string (f8071f6c)
* **Notes:**  Reset form after save before navigation (ac8a5fe7)
* **useMaps:**  Added back and cleaned up 'enableHighAccuracy' because Android still has an issue with timing out. (40dae818)
* **Geography.js amd isMapFeatures.js:**  Added elevaion accuracy and gps accuracy to Stereonet data (a4f7b3b0)
* **Compass.js:**
  *  Fixed compass data from continually observing even after the compass was closed. (2396bfc2)
  *  Added a unixTimeStamp when taking a measurement. (9e05df1f)
* **/measurements:**  Adds modified_timestamp and unixTimeStamp when making changes to the measurement. (653423a2)
* **useMapFeatures.js:**  Adds the unixTimeStamp and modified_timestamp when copying data to Stereonet. (98350ce5)

##### Code Style Changes

* **Home.js:**  Changed out Alert for new toast method. (00747445)
* **Orientations:**  Changed unixTimeStamp => unix_timestamp to be consistent. minor formatting (0e5201d1)
* **/ios:**  Fixed spelling of RCT_EXTERN_METHOD(myAccelerometer) (a6517e3e)

