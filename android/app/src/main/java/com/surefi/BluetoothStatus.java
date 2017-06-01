package com.surefi;

import android.bluetooth.BluetoothAdapter;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Created by hiddenbutler on 5/18/17.
 */

public class BluetoothStatus extends ReactContextBaseJavaModule {

    private BluetoothAdapter mBluetoothAdapter;
    private static final int BLUETOOTH_NON_EXISTENT = 761;
    private static final int BLUETOOTH_TURNED_OUT = 271;
    private static final int BLUETOOTH_ACTIVED = 901;


    public BluetoothStatus(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BluetoothStatus";
    }

    @ReactMethod
    public void getBluetoohStatus(Callback callback){
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        
        if(mBluetoothAdapter == null){
            callback.invoke(BLUETOOTH_NON_EXISTENT);
        }else{
            if(!mBluetoothAdapter.isEnabled()){
                callback.invoke(BLUETOOTH_TURNED_OUT);
            }else{
                callback.invoke(BLUETOOTH_ACTIVED);
            }
        }
    }
}
