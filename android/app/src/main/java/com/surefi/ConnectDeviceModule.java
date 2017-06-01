package com.surefi;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.telecom.Call;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Created by hiddenbutler on 5/10/17.
 */

public class ConnectDeviceModule extends ReactContextBaseJavaModule{

    private Callback callback;
    private String device_id;
    private BluetoothLeScanner mBluetoothLeScanner;
    private BluetoothAdapter mBluetoothAdapter;
    private static final int ENABLE_REQUEST = 539;
    private BluetoothDevice device;
    private ScanCallback mScanConnectCallback;
    private ReactApplicationContext reactContext;


    public ConnectDeviceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ConnectDevice";
    }

    @ReactMethod
    public void connect(final String device_id,final String address,final Callback callback){

        this.device_id = device_id.toUpperCase();
        this.callback = callback;

        Context react_context = getReactApplicationContext();
        final BluetoothManager bluetoothManager = (BluetoothManager) react_context.getSystemService(Context.BLUETOOTH_SERVICE);
        mBluetoothAdapter = bluetoothManager.getAdapter();

        if (mBluetoothAdapter == null || !mBluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            getCurrentActivity().startActivityForResult(enableBtIntent, ENABLE_REQUEST);
        }

        mBluetoothLeScanner = BluetoothAdapter.getDefaultAdapter().getBluetoothLeScanner();

        MScannCallback mScannCallback = new MScannCallback(reactContext,mBluetoothLeScanner,mBluetoothAdapter,callback);


        ScanFilter.Builder builder = new ScanFilter.Builder();
        builder.setDeviceAddress(address);
        List<ScanFilter> filters = new ArrayList<ScanFilter>();
        filters.add(builder.build());
        ScanSettings.Builder builder1 = new ScanSettings.Builder();
        ScanSettings settings = builder1.build();

        mBluetoothLeScanner.startScan(filters,settings,mScannCallback.getmScanConnectCallback());

    }


}

class MScannCallback{

    private ScanCallback mScanConnectCallback;
    private ReactApplicationContext reactContext;
    private BluetoothDevice device;
    private BluetoothLeScanner blutootLeScanner;
    private BluetoothAdapter mBluetoothAdapter;
    private Callback callback;

    public MScannCallback(ReactApplicationContext reactContext,BluetoothLeScanner bluetoothLeScanner,BluetoothAdapter mBluetoothAdapter,Callback callback){
        this.reactContext = reactContext;
        this.blutootLeScanner = bluetoothLeScanner;
        this.mBluetoothAdapter = mBluetoothAdapter;
        this.callback = callback;
    }

    public ScanCallback getmScanConnectCallback() {

        mScanConnectCallback = new ScanCallback() {
            @Override
            public void onScanResult(int callbackType, ScanResult result) {

                device = result.getDevice();
                System.out.println(device.getName());
                System.out.println(device.getAddress());


                GattCallback gattcallback = new GattCallback(blutootLeScanner,this,mBluetoothAdapter,callback);

                try{

                    device.connectGatt(reactContext, false,gattcallback.getmBluetoothGattCallback());

                }catch (IllegalArgumentException e){
                    System.out.println(e);
                }
            }


            @Override
            public void onBatchScanResults(List<ScanResult> results) {
                super.onBatchScanResults(results);
            }

            @Override
            public void onScanFailed(int errorCode) {
                super.onScanFailed(errorCode);
            }
        };
        return mScanConnectCallback;

    }
}

