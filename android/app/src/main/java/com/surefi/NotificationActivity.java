package com.surefi;

import android.app.Activity;
import android.os.Bundle;

/**
 * Created by hiddenbutler on 7/6/17.
 */

public class NotificationActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // If this activity is the root activity of the task, the app is not running
        if (isTaskRoot()) {
            // Start the app before finishing

        }

        // Now finish, which will drop you to the activity at which you were at the top of the task stack
        finish();
    }
}
