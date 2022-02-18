package com.strabospot2;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import android.app.Activity;
import android.hardware.GeomagneticField;
import android.os.SystemClock;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.view.Display;
import android.view.WindowManager;
import android.view.Surface;
import android.widget.Toast;
import android.util.Log;

import java.util.Arrays;
import java.util.Objects;
import java.util.List;

import android.content.Context;

import androidx.annotation.NonNull;

import com.facebook.react.modules.core.DeviceEventManagerModule;


public class CompassModule extends ReactContextBaseJavaModule implements SensorEventListener {

    private static Context mApplicationContext;

    private int mAzimuth = 0; // degree
    private int mFilter = 1;

    private SensorManager sensorManager;
    private GeomagneticField geomagneticField;
    Promise promise;

    private float declination = 0;
    private float heading = 0;
    private final float[] mGravity = new float[3];
    private final float[] mGeomagnetic = new float[3];

    private final float[] R = new float[9];
    private final float[] I = new float[9];

    public CompassModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mApplicationContext = reactContext.getApplicationContext();
    }

    private void getDeclination(float latitude, float longitude, float altitude) throws Exception {
        try {
            long timeMillis = System.currentTimeMillis();
            geomagneticField = new GeomagneticField(latitude, longitude, altitude, timeMillis);
            declination = geomagneticField.getDeclination();
        } catch (Exception e) {
            throw new Exception("There was an error getting magnetic declination from your location.");
        }
    }

    @NonNull
    @Override
    public String getName() {
        return "AndroidCompass";
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void start(Promise promise) {
        try {
            sensorManager = (SensorManager) mApplicationContext.getSystemService(Context.SENSOR_SERVICE);
            Sensor gsensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            Sensor msensor = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);

            sensorManager.registerListener(this, gsensor, SensorManager.SENSOR_DELAY_UI);
            sensorManager.registerListener(this, msensor, SensorManager.SENSOR_DELAY_UI);

//             mFilter = filter;
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("failed_start", e.getMessage());
        }
    }

    @ReactMethod
    public void stop() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
            Log.i("Matrix", "Sensors Stopped!!!!");
        }
    }

    @ReactMethod
    public void hasCompass(Promise promise) {

        try {
            SensorManager manager = (SensorManager) mApplicationContext.getSystemService(Context.SENSOR_SERVICE);

            boolean res = manager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null &&
                    manager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD) != null;

            promise.resolve(res);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void getLocation(float longitude, float latitude, float altitude, Promise promise) {
        Log.i("Loc", longitude + " " + latitude + " " + altitude);
        try {
            getDeclination(latitude, longitude, altitude);
//            promise.resolve(declination);
        } catch (Exception e) {
//            promise.reject("Declination_failure", e.getMessage());
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        // In this example, alpha is calculated as t / (t + dT),
        // where t is the low-pass filter's time-constant and
        // dT is the event delivery rate.
        final float alpha = 0.5f;


        synchronized (this) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {

            mGravity[0] = alpha * mGravity[0] + (1 - alpha)
                    * event.values[0];
            mGravity[1] = alpha * mGravity[1] + (1 - alpha)
                    * event.values[1];
            mGravity[2] = alpha * mGravity[2] + (1 - alpha)
                    * event.values[2];
//                mGravity[0] = event.values[0];
//                mGravity[1] = event.values[1];
//                mGravity[2] = event.values[2];
        }

        if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {

            mGeomagnetic[0] = alpha * mGeomagnetic[0] + (1 - alpha)
                    * event.values[0];
            mGeomagnetic[1] = alpha * mGeomagnetic[1] + (1 - alpha)
                    * event.values[1];
            mGeomagnetic[2] = alpha * mGeomagnetic[2] + (1 - alpha)
                    * event.values[2];
//                mGeomagnetic[0] = event.values[0];
//                mGeomagnetic[1] = event.values[1];
//                mGeomagnetic[2] = event.values[2];

        }

        boolean success = SensorManager.getRotationMatrix(R, null, mGravity, mGeomagnetic);

        if (success) {
            Log.i("CompassModule", "Sensors Started!!!");
            float[] transposedMatrix = MatrixCalculations.transposeMatrix(R, declination);
//                 Log.i("Matrix", "Transposed Matrix: " + Arrays.toString(transposedMatrix));
//                 float[] convertedENU = MatrixCalculations.convertENUToNWU(transposedMatrix);
//                 Log.i("Matrix", "Converted to NWU Matrix: " + Arrays.toString(convertedENU));
//                 double[] cartesianToSphericalValues = MatrixCalculations.cartesianToSpherical(-convertedENU[7], convertedENU[6], convertedENU[8]);
            double[] cartesianToSphericalValuesSD = MatrixCalculations.cartesianToSpherical(transposedMatrix[6], transposedMatrix[7], transposedMatrix[8]);
            double[] cartesianToSphericalValuesTP = MatrixCalculations.cartesianToSpherical(transposedMatrix[3], transposedMatrix[4], transposedMatrix[5]);
//                Log.i("Matrix", "Strike Dip Sphere Values [rho, phi, theta]: " + Arrays.toString(cartesianToSphericalValuesSD));
            Log.i("Matrix", "Plunge Trend Sphere Values [rho, phi, theta]: " + Arrays.toString(cartesianToSphericalValuesTP));
            double[] strikeAndDipDegrees = MatrixCalculations.strikeAndDip(cartesianToSphericalValuesSD);
            double[] trendAndPlungeDegrees = MatrixCalculations.trendAndPlunge(cartesianToSphericalValuesTP);
            Log.i("SD", Arrays.toString(strikeAndDipDegrees));

            float[] orientation = new float[3];
            SensorManager.getOrientation(R, orientation);
//
            float azimuthInRadians = orientation[0];
            heading = (float) Math.toDegrees(azimuthInRadians)%360.0f;
            if (heading < 0) {
                heading = 360 - (0 - heading);
            }
//                Log.d("Head", "Just orientation " + String.valueOf(orientation[0]));
//                Log.d("Head", "Before degree " + String.valueOf(heading));
//            heading = (heading + 360) % 360;

//                int newHeading = Math.round(-heading / 360 + 180);
                Log.d("Head", "Heading " + String.valueOf((heading + 90)%360));

//
//                Display disp = null;
////                  if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
////                      Activity activity = getReactApplicationContext().getCurrentActivity();
////                      if (activity != null) {
////                          disp = activity.getDisplay();
////                      }
////                  } else {
//                disp = (((WindowManager) mApplicationContext.getSystemService(Context.WINDOW_SERVICE))).getDefaultDisplay();
////                  }
//
//                if (disp != null) {
//                int rotation = disp.getRotation();
////
//                if (rotation == Surface.ROTATION_90) {
//                    Log.i("Rot", "90");
//                    heading = (heading + 90) % 360;
//                } else if (rotation == Surface.ROTATION_270) {
//                    Log.i("Rot", "270");
//                    heading = (heading + 270) % 360;
//                } else if (rotation == Surface.ROTATION_180) {
//                    Log.i("Rot", "180");
//                    heading = (heading + 180) % 360;
//                } else Log.i("Rot", "0");
//                }

//                if (Math.abs(mAzimuth - heading) > mFilter) {
//            Log.d("Head", "After degree " + String.valueOf(heading));

//                    mAzimuth = heading;
            WritableMap params = Arguments.createMap();
            params.putDouble("heading", (heading + 90)%360);
//                     params.putDouble("accelerometerX", mGravity[1]);
//                     params.putDouble("accelerometerY", mGravity[2]);
//                     params.putDouble("accelerometerZ", mGravity[0]);
//                     params.putDouble("SD_Rho", ENUValues[0][0]);
//                     params.putDouble("SD_Phi", ENUValues[0][1]);
//                     params.putDouble("SD_Theta", ENUValues[0][2]);
//                     params.putDouble("TP_Rho", ENUValues[1][0]);
//                     params.putDouble("TP_Phi", ENUValues[1][1]);
//                     params.putDouble("TP_Theta", ENUValues[1][2]);
//                     params.putDouble("M11", R[0]);
//                     params.putDouble("M12", R[3]);
//                     params.putDouble("M13", R[6]);
//                     params.putDouble("M21", R[1]);
//                     params.putDouble("M22", R[4]);
//                     params.putDouble("M23", R[7]);
//                     params.putDouble("M31", R[2]);
//                     params.putDouble("M32", R[5]);
//                     params.putDouble("M33", R[8]);
            params.putDouble("strike", strikeAndDipDegrees[0]);
            params.putDouble("dip", strikeAndDipDegrees[1]);
            params.putDouble("trend", trendAndPlungeDegrees[0]);
            params.putDouble("plunge", trendAndPlungeDegrees[1]);
            params.putDouble("SD_Rho", cartesianToSphericalValuesSD[0]);
            params.putDouble("SD_Phi", cartesianToSphericalValuesSD[1]);
            params.putDouble("SD_Theta", cartesianToSphericalValuesSD[2]);
            params.putDouble("TP_Rho", cartesianToSphericalValuesTP[0]);
            params.putDouble("TP_Phi", cartesianToSphericalValuesTP[1]);
            params.putDouble("TP_Theta", cartesianToSphericalValuesTP[2]);
                params.putDouble("M11", transposedMatrix[0]);
                params.putDouble("M12", transposedMatrix[1]);
                params.putDouble("M13", transposedMatrix[2]);
                params.putDouble("M21", transposedMatrix[3]);
                params.putDouble("M22", transposedMatrix[4]);
                params.putDouble("M23", transposedMatrix[5]);
                params.putDouble("M31", transposedMatrix[6]);
                params.putDouble("M32", transposedMatrix[7]);
                params.putDouble("M33", transposedMatrix[8]);


            getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("androidCompassData", params);
//                }
        }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }
}
