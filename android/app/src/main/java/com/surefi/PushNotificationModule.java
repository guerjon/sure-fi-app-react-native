package com.surefi;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.telephony.TelephonyManager;
import android.util.JsonReader;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JsonWriter;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import android.accounts.Account;
import android.accounts.AccountManager;

import android.os.Build;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONStringer;

import java.util.Locale;

import it.innove.BundleJSONConverter;

/**
 * Created by hiddenbutler on 6/27/17.
 */

public class PushNotificationModule extends ReactContextBaseJavaModule {

    ReactApplicationContext context;
    static ReactApplicationContext static_context;

    public PushNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        static_context = reactContext;
    }

    @Override
    public String getName() {
        return "PushNotification";
    }

    @ReactMethod
    public void getBuildInfo(Callback callback){

        TelephonyManager tMgr = (TelephonyManager)context.getSystemService(Context.TELEPHONY_SERVICE);
        String mPhoneNumber = tMgr.getLine1Number();

        MyFirebaseInstanceIDService service = new MyFirebaseInstanceIDService();
        String token = service.getToken();

        String version = "1";

        try {
            PackageManager manager = context.getPackageManager();
            PackageInfo info = manager.getPackageInfo(
                    context.getPackageName(), 0);
            version = info.versionName;
        } catch (Exception e) {
            Log.e("YourActivity", "Error getting version");
        }



        JSONObject json = new JSONObject();

        try {

            json.put("id",Build.ID);
            json.put("model",Build.MODEL);
            json.put("android_version",Build.VERSION.RELEASE);
            json.put("language",Locale.getDefault().getDisplayLanguage());
            json.put("country",getUserCountry(context));
            json.put("app_version",version);
            json.put("number",mPhoneNumber);
            json.put("device_title",getDeviceName());
            json.put("email",getEmail(context));
            json.put("token",token);


        } catch (JSONException e) {
            e.printStackTrace();
            callback.invoke(e.toString());
        }
        BundleJSONConverter bjc = new BundleJSONConverter();
        try {
            Bundle bundle = bjc.convertToBundle(json);
            WritableMap map = Arguments.fromBundle(bundle);
            callback.invoke(map);
        } catch (JSONException e) {
            e.printStackTrace();
            callback.invoke(e.toString());
        }

    }

    @ReactMethod
    public void openSmsBox(Callback callback){
        Log.d("MABY","MAYBE");
        Intent sendIntent = new Intent(Intent.ACTION_VIEW);
        sendIntent.setData(Uri.parse("sms:"));
        sendIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        MyFirebaseInstanceIDService service = new MyFirebaseInstanceIDService();
        String token = service.getToken();
        sendIntent.setType("vnd.android-dir/mms-sms");
        sendIntent.putExtra("address", "14804007873");
        sendIntent.putExtra("sms_body", "Please send the following Registration Code to SureFi: {" + token + "}");
        sendIntent.putExtra("exit_on_sent", true);
        context.startActivity(sendIntent);
    }


    /**
     * Get ISO 3166-1 alpha-2 country code for this device (or null if not available)
     * @param context Context reference to get the TelephonyManager instance from
     * @return country code or null
     */
    private String getUserCountry(Context context) {
        try {
            final TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
            final String simCountry = tm.getSimCountryIso();
            if (simCountry != null && simCountry.length() == 2) { // SIM country code is available
                return simCountry.toLowerCase(Locale.US);
            }
            else if (tm.getPhoneType() != TelephonyManager.PHONE_TYPE_CDMA) { // device is not 3G (would be unreliable)
                String networkCountry = tm.getNetworkCountryIso();
                if (networkCountry != null && networkCountry.length() == 2) { // network country code is available
                    return networkCountry.toLowerCase(Locale.US);
                }
            }
        }
        catch (Exception e) { }
        return null;
    }

    public String getDeviceName() {
        String manufacturer = Build.MANUFACTURER;
        String model = Build.MODEL;
        if (model.startsWith(manufacturer)) {
            return capitalize(model);
        } else {
            return capitalize(manufacturer) + " " + model;
        }
    }


    private String capitalize(String s) {
        if (s == null || s.length() == 0) {
            return "";
        }
        char first = s.charAt(0);
        if (Character.isUpperCase(first)) {
            return s;
        } else {
            return Character.toUpperCase(first) + s.substring(1);
        }
    }

    public static ReactContext getContext(){
        return static_context;
    }


    private String getEmail(Context context) {
        AccountManager accountManager = AccountManager.get(context);
        Account account = getAccount(accountManager);

        if (account == null) {
            return null;
        } else {
            return account.name;
        }
    }

    private Account getAccount(AccountManager accountManager) {
        Account[] accounts = accountManager.getAccountsByType("com.google");
        Account account;
        if (accounts.length > 0) {
            account = accounts[0];
        } else {
            account = null;
        }
        return account;
    }

}

