package com.surefi;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

/**
 * Created by hiddenbutler on 5/17/17.
 */

public class InitiateRemoteWrite extends ReactContextBaseJavaModule {

    private String remote_address;
    private String central_id;
    private Callback remote_connection_result;
    private Callback error_callback;
    private BluetoothAdapter mBluetoothAdapter;
    private BluetoothLeScanner mBluetoothLeScanner;
    private ScanCallback mScanCallback;
    private static final int ENABLE_REQUEST = 539;
    private HashMap<String,BluetoothDevice> hashStore;
    private UUID service_id = UUID.fromString("98BF000A-0EC5-2536-2143-2D155783CE78");
    private UUID characteristic_id = UUID.fromString("98BF000C-0EC5-2536-2143-2D155783CE78");
    private byte[] central_bytes_id;

    public InitiateRemoteWrite(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "InitiateRemoteWrite";
    }
    @ReactMethod
    public void write(
            String remote_address,
            String central_id,
            Callback remote_connection_result,
            Callback error_callback
    ){

        //init all the variables
        initVariables(remote_address,central_id,remote_connection_result,error_callback);
        //init bluetooth adapter
        this.mBluetoothAdapter = getBluetoothAdapter();
        //check if bluetooh is turn on
        checkBluetooth(mBluetoothAdapter);
        // get the scanner to search the devices
        this.mBluetoothLeScanner = getScanner(mBluetoothAdapter);
        // get the callback to pass after scanned
        this.mScanCallback = getScanCallback();
        mBluetoothLeScanner.startScan(mScanCallback);
        stopScan(mScanCallback,this.remote_address,getReactApplicationContext(),getRemoteGattCallback());


    }

    private void initVariables(
            String remote_address,
            String central_id,
            Callback remote_connection_result,
            Callback error_callback
    ){

        this.remote_address = remote_address;
        this.central_id = central_id;

        this.remote_connection_result = remote_connection_result;
        this.error_callback = error_callback;
        this.hashStore = new HashMap<>();
        this.central_bytes_id = hexStringToByteArray(central_id);
    }

    private BluetoothAdapter getBluetoothAdapter(){
        Context react_context = getReactApplicationContext();
        final BluetoothManager bluetoothManager = (BluetoothManager) react_context.getSystemService(Context.BLUETOOTH_SERVICE);
        return bluetoothManager.getAdapter();
    }

    private void checkBluetooth(BluetoothAdapter mBluetoothAdapter){
        if (mBluetoothAdapter == null || !mBluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            getCurrentActivity().startActivityForResult(enableBtIntent, ENABLE_REQUEST);
        }
    }

    private BluetoothLeScanner getScanner(BluetoothAdapter mBluetoothAdapter){
        return BluetoothAdapter.getDefaultAdapter().getBluetoothLeScanner();
    }

    private ScanCallback getScanCallback(){
        return new ScanCallback() {
            @Override
            public void onScanResult(int callbackType, ScanResult result) {
                super.onScanResult(callbackType, result);
                hashStore.put(result.getDevice().getAddress(),result.getDevice());
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
    }


    private BluetoothGattCallback getRemoteGattCallback(){
        final Callback remote_connection_result = this.remote_connection_result;

        return new BluetoothGattCallback() {
            @Override
            public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                super.onConnectionStateChange(gatt, status, newState);
                if(newState == BluetoothProfile.STATE_CONNECTED){

                    gatt.discoverServices();
                }else if(newState == BluetoothProfile.STATE_DISCONNECTED){
                    gatt.close();
                    gatt = null;
                    remote_connection_result.invoke("success");
                }
            }

            @Override
            public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                super.onServicesDiscovered(gatt, status);
                BluetoothGattService service = gatt.getService(service_id);

                if(service != null){
                    BluetoothGattCharacteristic characteristic = service.getCharacteristic(characteristic_id);
                    if(characteristic != null){
                        gatt.beginReliableWrite();
                        characteristic.setValue(central_bytes_id);
                        gatt.writeCharacteristic(characteristic);
                    }
                }
            }

            @Override
            public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
                super.onCharacteristicRead(gatt, characteristic, status);
            }

            @Override
            public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
                super.onCharacteristicWrite(gatt, characteristic, status);
                Log.d("WRITE STATUS REMOTE",String.valueOf(status));
                gatt.executeReliableWrite();

            }

            @Override
            public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
                super.onCharacteristicChanged(gatt, characteristic);
            }

            @Override
            public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
                super.onDescriptorRead(gatt, descriptor, status);
            }

            @Override
            public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
                super.onDescriptorWrite(gatt, descriptor, status);
            }

            @Override
            public void onReliableWriteCompleted(BluetoothGatt gatt, int status) {
                super.onReliableWriteCompleted(gatt, status);
                Log.d("RELIAWRITECOMPLE-REMO",String.valueOf(status));
                gatt.disconnect();
            }

            @Override
            public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
                super.onReadRemoteRssi(gatt, rssi, status);
            }

            @Override
            public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
                super.onMtuChanged(gatt, mtu, status);
            }
        };
    }

    private void stopScan(
            final ScanCallback mScanCallback,
            final String remote_address,
            final ReactApplicationContext context,
            final BluetoothGattCallback remoteGattCallback

    ){
        Handler mHandler = new Handler();
        mHandler.postDelayed(new Runnable() {

            @Override
            public void run() {

                mBluetoothLeScanner.stopScan(mScanCallback);

                for (BluetoothDevice device : hashStore.values()) {
                    if(device.getAddress().equals(remote_address)){
                        Log.d("REMOTE DEVICE FOUNDED","REMOTE DEVICE FOUNDED");
                        BluetoothGatt gatt = device.connectGatt(context,false,remoteGattCallback);
                        if(!gatt.connect()){
                            error_callback.invoke("Central Gatt connection can't be established.");
                            return;
                        }
                    }
                }
            }
        }, 10000);
    }

    public static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }
}

