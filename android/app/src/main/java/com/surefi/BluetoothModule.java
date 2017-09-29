package com.surefi;

import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

import org.json.JSONException;
import org.json.JSONObject;
import it.innove.BundleJSONConverter;
import no.nordicsemi.android.dfu.DfuProgressListener;
import no.nordicsemi.android.dfu.DfuProgressListenerAdapter;
import no.nordicsemi.android.dfu.DfuServiceController;
import no.nordicsemi.android.dfu.DfuServiceInitiator;
import no.nordicsemi.android.dfu.DfuServiceListenerHelper;


/**
 * Created by hiddenbutler on 7/6/17.
 */


public class BluetoothModule extends ReactContextBaseJavaModule {


    /**
     * The progress listener receives events from the DFU Service.
     * If is registered in onCreate() and unregistered in onDestroy() so methods here may also be called
     * when the screen is locked or the app went to the background. This is because the UI needs to have the
     * correct information after user comes back to the activity and this information can't be read from the service
     * as it might have been killed already (DFU completed or finished with error).
     */
    private final DfuProgressListener mDfuProgressListener = new DfuProgressListenerAdapter() {
        @Override
        public void onDeviceConnecting(final String deviceAddress) {
            Log.d("onDeviceConnecting()",deviceAddress);
        }

        @Override
        public void onDfuProcessStarting(final String deviceAddress) {
            Log.d("onDfuProcessStarting()",deviceAddress);
        }

        @Override
        public void onEnablingDfuMode(final String deviceAddress) {
            Log.d("onEnablingDfuMode()",deviceAddress);
        }

        @Override
        public void onFirmwareValidating(final String deviceAddress) {
            Log.d("onFirmwareValidating()",deviceAddress);
        }

        @Override
        public void onDeviceDisconnecting(final String deviceAddress) {
            Log.d("onDeviceDisconnecting()",deviceAddress);
        }

        @Override
        public void onDfuCompleted(final String deviceAddress) {
            Log.d("onDfuCompleted()",deviceAddress);

            // let's wait a bit until we cancel the notification. When canceled immediately it will be recreated by service again.
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {

                    JSONObject json = new JSONObject();
                    Bundle bundle = null;
                    try {
                        bundle = BundleJSONConverter.convertToBundle(json);
                        WritableMap map = Arguments.fromBundle(bundle);
                        sendEvent("DFUCompletedEvent",map);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }, 200);

        }

        @Override
        public void onDfuAborted(final String deviceAddress) {
            Log.d("onDfuAborted()",deviceAddress);
        }

        @Override
        public void onProgressChanged(final String deviceAddress, final int percent, final float speed, final float avgSpeed, final int currentPart, final int partsTotal) {
            Log.d("CHANGE",String.valueOf(percent));
            try {
                JSONObject json = new JSONObject();
                json.put("percent",percent);
                Bundle bundle = null;
                bundle = BundleJSONConverter.convertToBundle(json);
                WritableMap map = Arguments.fromBundle(bundle);
                sendEvent("DFUUpdateGraph",map);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            Log.d("onProgressChanged()",deviceAddress + "percent: " + percent + " speed :" + speed + " avg: " + avgSpeed + " currengPart" + currentPart +" partsTotal: " + partsTotal);
        }

        @Override
        public void onError(final String deviceAddress, final int error, final int errorType, final String message) {
            Log.d("onError()",deviceAddress + " error: " + error + "errorType: " + errorType + " message:" + message);
        }
    };

    public void sendEvent(String eventName,
                          @Nullable WritableMap params) {
        getReactApplicationContext()
                .getJSModule(RCTNativeAppEventEmitter.class)
                .emit(eventName, params);
    }

    public BluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BluetoothModule";
    }

    @ReactMethod
    public void initService(String address,String name,String path){

        final DfuServiceInitiator starter = new DfuServiceInitiator(address)
            .setDeviceName(name)
            .setDisableNotification(true);


        DfuServiceListenerHelper.registerProgressListener(getReactApplicationContext(), mDfuProgressListener);

        starter.setZip(path);
        final DfuServiceController controller = starter.start(getReactApplicationContext(), DfuService.class);
    }
}


