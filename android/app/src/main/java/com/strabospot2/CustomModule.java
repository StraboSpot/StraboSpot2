package com.strabospot2;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import android.widget.Toast;
import android.hardware.SensorManager;
import android.hardware.Sensor;
import android.hardware.SensorEventListener;
import android.hardware.SensorEvent;
import android.content.Context;

public class CustomModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;
    private SensorManager sensorManager;
    private double accelerationCurrentValue;
    private double delta;
    private double accelerationPrevValue;

    private SensorEventListener sensorEventListener = new SensorEventListener() {
        @Override
        public void onSensorChanged(SensorEvent event){
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];
            accelerationCurrentValue = Math.sqrt(x*x + y*y + z*z);
            delta = Math.abs(accelerationCurrentValue - accelerationPrevValue);
            accelerationPrevValue = accelerationCurrentValue;
        }

        @Override
        public void onAccuracyChanged(Sensor sensor, int i){

        }
    };
    private Sensor mAccelerometer;

    CustomModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "ABC";
    }
    
    @ReactMethod
    public int show() {
        sensorManager = (SensorManager) reactContext.getSystemService(Context.SENSOR_SERVICE);
        mAccelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        Toast.makeText(reactContext, "" + delta+ "" + accelerationCurrentValue + "" + accelerationPrevValue, Toast.LENGTH_SHORT).show();
        return 10;
    }

    protected void onResume() {
        //super.onResume();
        sensorManager.registerListener(sensorEventListener, mAccelerometer, SensorManager.SENSOR_DELAY_NORMAL);
    }

    protected void onPause() {
        //super.onPause();
        sensorManager.unregisterListener(sensorEventListener);
    }

}

