package com.surefi;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.util.Log;
import com.facebook.react.bridge.Callback;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.nio.charset.Charset;
import java.util.List;
import java.util.UUID;

/**
 * Created by hiddenbutler on 5/11/17.
 */

public class GattCallback {

    private BluetoothGattCallback mBluetoothGattCallback;
    private BluetoothLeScanner bluetoothLeScanner;
    private ScanCallback scanCallback;
    private BluetoothAdapter mBluetoothAdapter;
    private String service_uuid = "98BF000A-0EC5-2536-2143-2D155783CE78";
    private String characteristic_uuid = "98BF000C-0EC5-2536-2143-2D155783CE78";
    private BluetoothGattService service;
    private String direccion_id = "FF7FF7";
    private Callback callback;
    byte[] bytes = hexStringToByteArray(direccion_id);


    public GattCallback(BluetoothLeScanner bluetoothLeScanner,ScanCallback scanCallback,BluetoothAdapter mBluetoothAdapter,Callback callback){
        this.bluetoothLeScanner = bluetoothLeScanner;
        this.scanCallback = scanCallback;
        this.mBluetoothAdapter = mBluetoothAdapter;
        this.callback = callback;
    }

    public BluetoothGattCallback getmBluetoothGattCallback() {

        mBluetoothGattCallback = new BluetoothGattCallback() {

            @Override
            public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {

                if(gatt != null) {

                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        gatt.discoverServices();

                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {

                        gatt.close();
                        gatt = null;
                        bluetoothLeScanner.stopScan(scanCallback);
                        System.out.println("GattConnection close");
                        callback.invoke(true);

                    }
                }
            }

            @Override
            public void onServicesDiscovered(BluetoothGatt gatt, int status) {

                if (status == BluetoothGatt.GATT_SUCCESS) {

                    BluetoothGattService service = gatt.getService(UUID.fromString(service_uuid));
                    if(service != null){

                        BluetoothGattCharacteristic characteristic = service.getCharacteristic(UUID.fromString(characteristic_uuid));
                        if (characteristic != null){

                            //gatt.beginReliableWrite();
                            //characteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
                            //characteristic.setValue(bytes);

                            gatt.readCharacteristic(characteristic);
                            gatt.writeCharacteristic(characteristic);

                        }else{
                            System.out.println("Characteristic don't found");
                        }
                    }else{
                        System.out.println("Service not found");
                    }

                } else {
                    System.out.println("Gatt adapter is not working");
                }
            }


            @Override
            public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
                System.out.println(status);
                gatt.executeReliableWrite();
/*                if(characteristic.getValue() != bytes ) {
                    System.out.println("aborto alv" + status + " characteristic value in queue" + characteristic.getValue());
                    gatt.abortReliableWrite();
                } else {
                    System.out.println("no aborto alv" + status + " characteristic value " + characteristic.getValue());
                    gatt.executeReliableWrite();
                }
*/
            }

            @Override
            public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {

                System.out.println("esta madre si se debe de invocar onCharacteristicChanged" );
            }

            @Override
            public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {

                System.out.println("esta madre si se debe de invocar onDescriptorRead");

            }

            @Override
            public void onReliableWriteCompleted(BluetoothGatt gatt, int status) {

                System.out.println("esta madre si se debe de invocar onReliableWriteCompleted status:" + status);

                //gatt.close();


                BluetoothGattService service = gatt.getService(UUID.fromString(service_uuid));
                BluetoothGattCharacteristic characteristic = service.getCharacteristic(UUID.fromString(characteristic_uuid));
                gatt.readCharacteristic(characteristic);


            }

            @Override
            public void onCharacteristicRead (BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status){
                String decodedDataUsingUTF8;
                gatt.disconnect();
            }

        };
        return mBluetoothGattCallback;
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
