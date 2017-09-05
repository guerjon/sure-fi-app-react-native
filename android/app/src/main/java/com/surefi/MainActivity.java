package com.surefi;

import com.reactnativenavigation.controllers.SplashActivity;
import android.widget.LinearLayout;
import android.graphics.Color;
import android.widget.TextView;
import android.view.Gravity;
import android.util.TypedValue;

public class MainActivity extends SplashActivity {

    @Override
    public LinearLayout createSplashLayout() {
        LinearLayout view = new LinearLayout(this);
        TextView textView = new TextView(this);
        
        view.setGravity(Gravity.CENTER);
        textView.setTextColor(Color.parseColor("#2BC7F1"));
        textView.setText("Sure-Fi");
        textView.setGravity(Gravity.CENTER);
        textView.setTextSize(TypedValue.COMPLEX_UNIT_DIP, 60);
        
        view.addView(textView);

        return view;
    }

}
