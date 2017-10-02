package com.surefi;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.airbnb.android.react.maps.MapsPackage;
import com.inprogress.reactnativeyoutube.ReactNativeYouTube;
import com.reactnativecomponent.barcode.RCTCapturePackage;
//import com.reactnativecomponent.barcode.RCTCapturePackage;
//import com.bitgo.randombytes.RandomBytesPackage;
import com.oblador.keychain.KeychainPackage;
import com.github.xfumihiro.react_native_image_to_base64.ImageToBase64Package;
//import io.invertase.firebase.RNFirebasePackage;
//import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.polidea.reactnativeble.BlePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import it.innove.BleManagerPackage;
import com.reactnativenavigation.NavigationApplication;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication implements ReactApplication {

   @Override
   public boolean isDebug() {
       // Make sure you are using BuildConfig from your own application
       return BuildConfig.DEBUG;
   }

   protected List<ReactPackage> getPackages() {
       // Add additional packages you require here
       // No need to add RnnPackage and MainReactPackage
       return Arrays.<ReactPackage>asList(
              new VectorIconsPackage(),
              new RNFetchBlobPackage(),
              new RCTCameraPackage(),
              new BleManagerPackage(),
              new PushNotificationsPackage(),
              new BluetoothPackage(),
              new BlePackage(),
              new KeychainPackage(),
              new ReactNativeYouTube(),
              new MapsPackage()

       );
   }

     @Override
     public List<ReactPackage> createAdditionalReactPackages() {
         return getPackages();
     }

}