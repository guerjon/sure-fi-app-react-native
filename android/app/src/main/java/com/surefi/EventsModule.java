package com.surefi;

import android.support.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

/**
 * Created by hiddenbutler on 6/29/17.
 */

public class EventsModule extends ReactContextBaseJavaModule {

    public EventsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "EventsModule";
    }

    public void sendEvent(String eventName,
                          @Nullable WritableMap params) {
        getReactApplicationContext()
                .getJSModule(RCTNativeAppEventEmitter.class)
                .emit(eventName, params);
    }

    public void sendCodeEvent(int code){
        WritableMap map = Arguments.createMap();
        map.putString("code",String.valueOf(code) );
        sendEvent("GetConfirmationCode",map);
    }

}
