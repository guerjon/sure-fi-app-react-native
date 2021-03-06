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

    public static final String METHOD_TAG = "METHOD";
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
            Log.d(METHOD_TAG,"onDeviceConnecting()");
            this.sendDFUEvent("onDeviceConnecting()");
        }

        @Override
        public void onDfuProcessStarting(final String deviceAddress) {
            Log.d(METHOD_TAG,"onDfuProcessStarting()");
            this.sendDFUEvent("onDfuProcessStarting()");
        }

        @Override
        public void onEnablingDfuMode(final String deviceAddress) {
            Log.d(METHOD_TAG,"onEnablingDfuMode()");
            this.sendDFUEvent("onEnablingDfuMode()");

        }

        private void sendDFUEvent(String eventName){
            try{
                JSONObject json = new JSONObject();
                json.put("dfu_event",eventName);
                Bundle bundle = null;
                bundle = BundleJSONConverter.convertToBundle(json);
                WritableMap map = Arguments.fromBundle(bundle);
                sendEvent("DFUEvent",map);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onFirmwareValidating(final String deviceAddress) {
            Log.d(METHOD_TAG,"onFirmwareValidating()");
            this.sendDFUEvent("onFirmwareValidating()");
        }

        @Override
        public void onDeviceDisconnecting(final String deviceAddress) {
            Log.d(METHOD_TAG,"onDeviceDisconnecting()");
            this.sendDFUEvent("onDeviceDisconnecting()");
        }

        @Override
        public void onDfuCompleted(final String deviceAddress) {
            Log.d(METHOD_TAG,"onDfuCompleted()");

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
            Log.d(METHOD_TAG,"onDfuAborted()");
            try {
                JSONObject json = new JSONObject();
                json.put("error","DFU aborted");
                Bundle bundle = null;
                bundle = BundleJSONConverter.convertToBundle(json);
                WritableMap map = Arguments.fromBundle(bundle);
                sendEvent("DFUOnDfuAborted",map);
            } catch (JSONException e) {
                e.printStackTrace();
            }
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
            Log.d(METHOD_TAG,"onError()");
            try {
                JSONObject json = new JSONObject();
                json.put("error",error);
                json.put("errorType",errorType);
                json.put("message",message);
                Bundle bundle = null;
                bundle = BundleJSONConverter.convertToBundle(json);
                WritableMap map = Arguments.fromBundle(bundle);
                sendEvent("DFUOnError",map);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            Log.d(METHOD_TAG, "OnError() " + deviceAddress + " error: " + error + "errorType: " + errorType + " message:" + message);
        }
    };

    public void sendEvent(String eventName, @Nullable WritableMap params) {
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
        Log.d(METHOD_TAG, "initService() address" + address + " , name: " + name + " path : " + path);
        final DfuServiceInitiator starter = new DfuServiceInitiator(address)
            .setDeviceName(name)
            .setDisableNotification(true);


        DfuServiceListenerHelper.registerProgressListener(getReactApplicationContext(), mDfuProgressListener);

        starter.setZip(path);
        final DfuServiceController controller = starter.start(getReactApplicationContext(), DfuService.class);
    }
}


