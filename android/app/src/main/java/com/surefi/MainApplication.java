package com.surefi;

import com.facebook.react.ReactApplication;
import com.gettipsi.stripe.StripeReactPackage;

import com.inprogress.reactnativeyoutube.ReactNativeYouTube;
import com.oblador.keychain.KeychainPackage;
import com.facebook.react.ReactPackage;
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
 
               new StripeReactPackage()
       );
   }

     @Override
     public List<ReactPackage> createAdditionalReactPackages() {
         return getPackages();
     }
}