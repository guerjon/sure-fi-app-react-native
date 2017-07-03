package com.surefi;

import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.FirebaseInstanceIdService;

/**
 * Created by hiddenbutler on 6/27/17.
 */

public class MyFirebaseInstanceIDService extends FirebaseInstanceIdService {
    private String token = "";

    @Override
    public void onTokenRefresh() {
        // Get updated InstanceID token.
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();
        this.token = refreshedToken;
        Log.d("TOKEN", "Refreshed token: " + refreshedToken);
    }

    public String getToken(){
        String token = FirebaseInstanceId.getInstance().getToken();
        return token;
    }


}
