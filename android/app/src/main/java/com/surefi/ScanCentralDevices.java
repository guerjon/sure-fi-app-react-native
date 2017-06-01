package com.surefi;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.telecom.Call;
import android.text.TextUtils;
import android.util.SparseArray;

import com.facebook.common.util.ExceptionWithNoStacktrace;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ActivityEventListener;


import com.facebook.react.bridge.ReactMethod;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.HashMap;

/**
 * Created by hiddenbutler on 5/15/17.
 */

public class ScanCentralDevices extends ReactContextBaseJavaModule {

    private Callback callback;
    private Callback error_callback;
    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    private static final int REQUEST_ENABLE_BT = 539;
    private BluetoothAdapter mBluetoothAdapter;
    private Handler mHandler;
    private BluetoothLeScanner mBluetoothLeScanner;
    private Callback connectCallback;
    private HashMap<String,JSONObject> hashStore = new HashMap<>();
    private String device_id;

    public ScanCentralDevices(ReactApplicationContext reactContext) {
        super(reactContext);
            reactContext.addActivityEventListener(mActivityEventListener);
    }

    @Override
    public String getName() {
        return "ScanCentral";
    }

    @ReactMethod
    public void scan(final Callback callback,Callback error_callback){
        this.callback = callback;
        this.error_callback = callback;

        Context react_context = getReactApplicationContext();
        final BluetoothManager bluetoothManager = (BluetoothManager) react_context.getSystemService(Context.BLUETOOTH_SERVICE);
        mBluetoothAdapter = bluetoothManager.getAdapter();

        // Ensures Bluetooth is available on the device and it is enabled. If not,
        // displays a dialog requesting user permission to enable Bluetooth.
        if(mBluetoothAdapter == null){
            error_callback.invoke(true);

        }else{
            if(!mBluetoothAdapter.isEnabled()){
                try {
                    Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                    getCurrentActivity().startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
                }catch(Exception e){
                    System.out.println(e);
                }
            }else{
                startScan();
            }
        }

    }

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == REQUEST_ENABLE_BT) {

                if (resultCode == Activity.RESULT_CANCELED) {
                    error_callback.invoke(true);
                } else if (resultCode == Activity.RESULT_OK) {
                    startScan();
                }
            }
        }
    };


    private void startScan(){
        mBluetoothLeScanner = BluetoothAdapter.getDefaultAdapter().getBluetoothLeScanner();
        mHandler = new Handler();
        mBluetoothLeScanner.startScan(mScanCallback);

        mHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                mBluetoothLeScanner.stopScan(mScanCallback);
                JSONArray devices = new JSONArray();

                for (JSONObject value : hashStore.values()) {
                    devices.put(value);
                }
                callback.invoke(devices.toString());
            }
        }, 10000);
    }


    public static boolean setBluetooth(boolean enable) {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        boolean isEnabled = bluetoothAdapter.isEnabled();
        if (enable && !isEnabled) {
            return bluetoothAdapter.enable();
        }
        else if(!enable && isEnabled) {
            return bluetoothAdapter.disable();
        }
        // No need to change bluetooth state
        return true;
    }

    private ScanCallback mScanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            super.onScanResult(callbackType, result);

            if (result == null
                    || result.getDevice() == null
                    || TextUtils.isEmpty(result.getDevice().getName()))
                return;

            if (!hashStore.containsKey(result.getDevice().getAddress()) && result.getDevice().getName().equals("SF Bridge")) {
                JSONObject obj = new JSONObject();

                SparseArray<byte[]> array = result.getScanRecord().getManufacturerSpecificData();
                String new_representation = Arrays.toString(array.valueAt(0));

                try {

                    obj.put("name", result.getDevice().getName());
                    obj.put("address", result.getDevice().getAddress());
                    obj.put("manufacturerData", new_representation);
                    obj.put("uuids", result.getScanRecord().getServiceUuids());
                    obj.put("all", result.getScanRecord().toString());
                    hashStore.put(result.getDevice().getAddress(), obj);

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }
    };
}




