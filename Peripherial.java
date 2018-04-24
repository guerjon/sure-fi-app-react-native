package it.innove;

import android.app.Activity;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.support.annotation.Nullable;
import android.util.Base64;
import android.util.Log;
import java.security.*;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import org.json.JSONException;
import org.json.JSONObject;
import java.lang.reflect.Array;
import java.security.MessageDigest;
import java.util.*;
import static android.bluetooth.BluetoothGatt.*;

/**
 * Peripheral wraps the BluetoothDevice and provides methods to convert to JSON.
 * ^(?!.*(parseFromBytes|first manudata for manu ID|STATE_ON|Start Scan|Stop Scan|stopLeScan()|startLeScan():)).*$
 * ^(D/ScanRecord: parseFromBytes)
 */
public class Peripheral extends BluetoothGattCallback {

	private static final String CHARACTERISTIC_NOTIFICATION_CONFIG = "00002902-0000-1000-8000-00805f9b34fb";
	public static final String LOG_TAG = "LOG_TAG";
	public static final String METHOD_TAG = "METHOD";
	public static final String LOG_ERROR_TAG = "ERROR";

	private static final UUID MODULE_SERVICE_SHORT_UUID = UUIDHelper.uuidFromString("E8BF000A-0EC5-2536-2143-2D155783CE78");
	private static final UUID RX_DATA_CHAR_SHORT_UUID = UUIDHelper.uuidFromString("E8BF000B-0EC5-2536-2143-2D155783CE78"); //subscribe
	private static final UUID TX_DATA_CHAR_SHORT_UUID = UUIDHelper.uuidFromString("E8BF000C-0EC5-2536-2143-2D155783CE78");
	private static final UUID RADIO_STATUS_CHAR_SHORT_UUID = UUIDHelper.uuidFromString("E8BF000D-0EC5-2536-2143-2D155783CE78");
	private static final UUID ADV_DATA_CHAR_SHORT_UUID = UUIDHelper.uuidFromString("E8BF000E-0EC5-2536-2143-2D155783CE78"); //subscribe

	/*
	*  ADV_DATA_CHAR_SHORT_UUID_VALUE structure [type, major_version, minor_version, status,rx,rx,rx,tx,tx,tx]
	*/
	private byte[] ADV_DATA_CHAR_SHORT_UUID_VALUE = {};

	private BluetoothDevice device;
	private byte[] advertisingData;
	private int advertisingRSSI;
	private boolean connected = false;
	private ReactContext reactContext;
	private Activity activity;
	private BluetoothGatt gatt;
	private int WIEGAND_TYPE = 3;
	private int HVAC_TYPE = 4;
	private int device_type = WIEGAND_TYPE;
	private Callback connectCallback;
	private Callback retrieveServicesCallback;
	private Callback readCallback;
	private Callback readRSSICallback;
	private Callback writeCallback;
	private Callback registerNotifyCallback;
	private String new_representation;
    int connectionState = BluetoothProfile.STATE_DISCONNECTED;
	private boolean first_connecting = false;
	private byte[] connection_data = null;
	private boolean simple_connect = false;
	public boolean security_clear = false;
	private int device_status = 0;
	private int device_major = 0;
	private int device_minor = 0;
	public int type = 0; // this variable  tell us the operation type
	private List<byte[]> writeQueue = new ArrayList<>();
    public final boolean VDBG = true;
	public Peripheral(BluetoothDevice device, int advertisingRSSI, byte[] scanRecord, ReactContext reactContext) {
		this.device = device;
		this.advertisingRSSI = advertisingRSSI;
		this.advertisingData = scanRecord;
		this.reactContext = reactContext;
	}


	public Peripheral(BluetoothDevice device, int advertisingRSSI, byte[] scanRecord, ReactContext reactContext,String new_representation) {
		this.device = device;
		this.advertisingRSSI = advertisingRSSI;
		this.advertisingData = scanRecord;
		this.reactContext = reactContext;
		this.new_representation = new_representation;
	}


	public Peripheral(BluetoothDevice device, ReactContext reactContext) {
		this.device = device;
		this.reactContext = reactContext;
	}

	private void sendEvent(String eventName, @Nullable WritableMap params) {
		reactContext
				.getJSModule(RCTNativeAppEventEmitter.class)
				.emit(eventName, params);
	}

	private void sendConnectionEvent(BluetoothDevice device, String eventName,@Nullable  HashMap<String, String> params) {
		Log.d(METHOD_TAG,"sendConnectionEvent()");
		WritableMap map = Arguments.createMap();
		map.putString("peripheral", device.getAddress());
		if(params != null){
			for (Map.Entry<String, String> entry : params.entrySet()) {
				Log.d(LOG_TAG,"Key : " + entry.getKey() + " Value : " + entry.getValue());
				map.putString(entry.getKey(),entry.getValue());
			}
		}else{
			Log.d(LOG_TAG,"Params are null");
		}

		sendEvent(eventName, map);
	}

	public void resetVariables(){
		Log.d(LOG_TAG,"resetVariables");
		this.connectionState = BluetoothProfile.STATE_DISCONNECTED;
		this.first_connecting = false;
		this.connection_data = null;
		this.simple_connect = false;
		this.security_clear = false;
	}

	public <T> T[] concatenate(T[] a, T[] b) {
		int aLen = a.length;
		int bLen = b.length;

		@SuppressWarnings("unchecked")
		T[] c = (T[]) Array.newInstance(a.getClass().getComponentType(), aLen + bLen);
		System.arraycopy(a, 0, c, 0, aLen);
		System.arraycopy(b, 0, c, aLen, bLen);

		return c;
	}

	public void connect(Callback callback, Activity activity,boolean simple_connect,String connection_status) {
		Log.d(LOG_TAG,"connect()" + String.valueOf(connected));
		//this.connection_status = connection_status;
		this.activity = activity;
		this.simple_connect = simple_connect;
		connectGatt(activity);

		this.connectCallback = callback;
	}

	public void controllConnect(Callback callback, Activity activity,byte[] data,int type,int device_type){
		Log.d(LOG_TAG, "controllConnect: " + String.valueOf(connectionState) +" "+ String.valueOf(security_clear) + " " + type);

		this.device_type = device_type;

		if(security_clear){
			if(type == 1){
				this.connection_data = data;
				this.type = type;
				connect(callback,activity,true,"connecting");
			}else{
				Log.d(LOG_ERROR_TAG,"The security string was write before.");
			}
		}else{
			if(connectionState == BluetoothProfile.STATE_DISCONNECTED){
				connect(callback,activity,this.simple_connect,"disconnected");
				connectionState = BluetoothProfile.STATE_CONNECTING;
				this.connectCallback = callback;
				this.connection_data = data;
				connectGatt(activity);
			}
			else if(connectionState == BluetoothProfile.STATE_CONNECTING) {
				Log.d(LOG_TAG, "connecting: ");
			}
			else{
				callback.invoke("The Connection was make previously. (ControlConnnect - Peripheral)");
			}
		}
	}

	public void connectGatt(Activity activity){
		Log.d(METHOD_TAG,"connectGatt");
		gatt = getDevice().connectGatt(activity, false, this);
	}

	public void controllHVACConnect(Callback callback,Activity activity,byte[] data,int type,int device_type,int device_id,String tx){
		Log.d(METHOD_TAG, "controllHVACConnect: " + String.valueOf(connectionState) +" "+ String.valueOf(security_clear) + " " + type + " " + device_type);

		this.device_type = device_type;
		if(connectionState == BluetoothProfile.STATE_DISCONNECTED){
		    connectionState = BluetoothProfile.STATE_CONNECTING;
			this.connectCallback = callback;
			this.connection_data = data;
			connectGatt(activity);

		}
		else if(connectionState == BluetoothProfile.STATE_CONNECTING) {
			Log.d(LOG_TAG, "connecting: ");
		}
		else{
			callback.invoke("The Connection was make previously. (ControlConnnect - Peripheral)");
		}
	}

	public String readADVCharacteristic() {
		Log.d(METHOD_TAG,"readADVCharacteristic()");
		this.read(MODULE_SERVICE_SHORT_UUID,ADV_DATA_CHAR_SHORT_UUID,null);
		return "";
	}

	private String reverseString(String s){
		String reverse = "";
		for(int i = s.length() -1;i >= 0; i--){
			reverse = reverse + s.charAt(i);
		}
		return reverse;
	}

	private String showByteArrayLikeHex(byte[] bytes,boolean withSpace){
		StringBuilder sb = new StringBuilder();
		String format = "%02X";
		if(withSpace){
			format = "%02X ";
		}
		for (byte b : bytes) {
			sb.append(String.format(format, b));
		}
		return sb.toString();
	}

	public int getHVACDeviceStatus(){
		return this.device_status;
	}

	public void writesecurityStringForHVAC(){
		Log.d(METHOD_TAG,"writesecurityStringForHVAC()");


		if(ADV_DATA_CHAR_SHORT_UUID_VALUE.length > 9){
			this.device_type = ADV_DATA_CHAR_SHORT_UUID_VALUE[0];
			this.device_major = ADV_DATA_CHAR_SHORT_UUID_VALUE[1];
			this.device_major = ADV_DATA_CHAR_SHORT_UUID_VALUE[2];
			this.device_status = ADV_DATA_CHAR_SHORT_UUID_VALUE[3];
			byte [] rx = {ADV_DATA_CHAR_SHORT_UUID_VALUE[4],ADV_DATA_CHAR_SHORT_UUID_VALUE[5],ADV_DATA_CHAR_SHORT_UUID_VALUE[6]};
			byte [] tx = {ADV_DATA_CHAR_SHORT_UUID_VALUE[7],ADV_DATA_CHAR_SHORT_UUID_VALUE[8],ADV_DATA_CHAR_SHORT_UUID_VALUE[9]};
			MessageDigest md = null;

			try {

				String rx_string = showByteArrayLikeHex(rx,false);
				String tx_string = reverseString(showByteArrayLikeHex(tx,false));
				String garbage = "x~sW5-C\"6fu>!!~X";
				String complete_string = rx_string + tx_string + garbage;

				byte[] complete_string_bytes = complete_string.getBytes();

				md = MessageDigest.getInstance("MD5");

				byte[] md5_bytes = md.digest(complete_string_bytes);

				byte[] command = new byte[]{0x7E,0x40,0x10};
				byte[] data_to_write = new byte[command.length + md5_bytes.length];

				System.arraycopy(command , 0, data_to_write , 0, command.length);
				System.arraycopy(md5_bytes, 0, data_to_write , command.length, md5_bytes.length);
				/*
					Log.d(LOG_TAG,"ADV_DATA_CHAR_SHORT_UUID_VALUE: " + showByteArrayLikeHex(ADV_DATA_CHAR_SHORT_UUID_VALUE,true));
					Log.d(LOG_TAG,"complete_string: " + complete_string);
					Log.d(LOG_TAG,"md5_bytes: " + showByteArrayLikeHex(md5_bytes,true));
					Log.d(LOG_TAG,"data_to_write: " + showByteArrayLikeHex(data_to_write,true));
				*/

				write(MODULE_SERVICE_SHORT_UUID, TX_DATA_CHAR_SHORT_UUID,data_to_write, null,BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
			}
			catch (NoSuchAlgorithmException e) {
				Log.d(LOG_TAG,"I'm sorry, but MD5 is not a valid message digest algorithm");
			}

		}else{
			Log.d(LOG_TAG,"Error the characteristic structure haven't enough size.");
		}
	}

	public void startHVACNotifications(){
		Log.d(METHOD_TAG,"startHVACNotifications()");
		registerNotify(MODULE_SERVICE_SHORT_UUID,RX_DATA_CHAR_SHORT_UUID,null);
	}

	public void writeSecurityString(){
		Log.d(METHOD_TAG,"writeSecurityString() device_type" +  " "  + this.device_type + " "  + security_clear);
		if(!security_clear){
			UUID serviceUUID = UUIDHelper.uuidFromString("58BF000A-0EC5-2536-2143-2D155783CE78");
			UUID characteristicUUID = UUIDHelper.uuidFromString("58BF000B-0EC5-2536-2143-2D155783CE78");

			byte[] data = this.connection_data;

			if (gatt == null) {
				Log.e(LOG_ERROR_TAG,"BluetoothGatt is null");
			} else {


				BluetoothGattService service = gatt.getService(serviceUUID);

				if(service == null){
					Log.e(LOG_ERROR_TAG,"Service is null");
					return;
				}

				BluetoothGattCharacteristic characteristic = findWritableCharacteristic(service, characteristicUUID, BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
				Log.d(METHOD_TAG,"1.");

				if (characteristic == null) {

					Log.d(LOG_ERROR_TAG,"characteristic is null.");

				} else {
					Log.d(METHOD_TAG,"2.");
					characteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
					characteristic.setValue(data);

					if (!gatt.writeCharacteristic(characteristic)) {
						Log.d(LOG_ERROR_TAG,"Write Fail.");
					}
				}
			}
		}
	}

	public void startNotifications(){
		Log.d(LOG_TAG,"startNotifications()");
		UUID PAIR_SUREFI_SERVICE = UUIDHelper.uuidFromString("98BF000A-0EC5-2536-2143-2D155783CE78");
		UUID PAIR_SUREFI_READ_UUID = UUIDHelper.uuidFromString("98BF000D-0EC5-2536-2143-2D155783CE78");

		UUID SUREFI_CMD_SERVICE_UUID = UUIDHelper.uuidFromString("C8BF000A-0EC5-2536-2143-2D155783CE78");
		UUID SUREFI_CMD_READ_UUID = UUIDHelper.uuidFromString("C8BF000C-0EC5-2536-2143-2D155783CE78");

		registerNotify(PAIR_SUREFI_SERVICE,PAIR_SUREFI_READ_UUID,null);
		registerNotify(SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_READ_UUID,null);
	}

	public void disconnect() {
		connectCallback = null;
		connected = false;
		Log.d(METHOD_TAG,"The method discconect is been executed");
		if (gatt != null) {
			try {
				Log.d(METHOD_TAG,"GATT DISCONNECTED");
				killTheGatt();
				resetVariables();
				sendConnectionEvent(device, "BleManagerDisconnectPeripheral",null);
			} catch (Exception e) {
				Log.d(METHOD_TAG,e.toString());
				sendConnectionEvent(device, "BleManagerDisconnectPeripheral",null); // esto esta mal
			}
		}else
			Log.d(LOG_TAG, "GATT is null");
	}

	private void killTheGatt(){
		gatt.disconnect();
		gatt.close();
		gatt = null;

	}

	public JSONObject asJSONObject() {
		JSONObject json = new JSONObject();
		try {
			json.put("name", device.getName());
			json.put("id", device.getAddress()); // mac address
			json.put("advertising", byteArrayToJSON(advertisingData));
			json.put("new_representation",new_representation);
			// TODO real RSSI if we have it, else
			json.put("rssi", advertisingRSSI);
		} catch (JSONException e) { // this shouldn't happen
			e.printStackTrace();
		}

		return json;
	}

	public WritableMap asWritableMap() {

		WritableMap map = Arguments.createMap();

		try {
			map.putString("name", device.getName());
			map.putString("id", device.getAddress()); // mac address
			//map.putMap("advertising", byteArrayToWritableMap(advertisingData));
			map.putInt("rssi", advertisingRSSI);
		} catch (Exception e) { // this shouldn't happen
			e.printStackTrace();
		}

		return map;
	}

	public WritableMap asWritableMap(BluetoothGatt gatt) {

		WritableMap map = asWritableMap();

		WritableArray servicesArray = Arguments.createArray();
		WritableArray characteristicsArray = Arguments.createArray();

		if (connected && gatt != null) {
			for (Iterator<BluetoothGattService> it = gatt.getServices().iterator(); it.hasNext(); ) {
				BluetoothGattService service = it.next();
				WritableMap serviceMap = Arguments.createMap();
				serviceMap.putString("uuid", UUIDHelper.uuidToString(service.getUuid()));


				for (Iterator<BluetoothGattCharacteristic> itCharacteristic = service.getCharacteristics().iterator(); itCharacteristic.hasNext(); ) {
					BluetoothGattCharacteristic characteristic = itCharacteristic.next();
					WritableMap characteristicsMap = Arguments.createMap();

					characteristicsMap.putString("service", UUIDHelper.uuidToString(service.getUuid()));
					characteristicsMap.putString("characteristic", UUIDHelper.uuidToString(characteristic.getUuid()));

					characteristicsMap.putMap("properties", Helper.decodeProperties(characteristic));

					if (characteristic.getPermissions() > 0) {
						characteristicsMap.putMap("permissions", Helper.decodePermissions(characteristic));
					}


					WritableArray descriptorsArray = Arguments.createArray();

					for (BluetoothGattDescriptor descriptor : characteristic.getDescriptors()) {
						WritableMap descriptorMap = Arguments.createMap();
						descriptorMap.putString("uuid", UUIDHelper.uuidToString(descriptor.getUuid()));
						if (descriptor.getValue() != null)
							descriptorMap.putString("value", Base64.encodeToString(descriptor.getValue(), Base64.NO_WRAP));
						else
							descriptorMap.putString("value", null);

						if (descriptor.getPermissions() > 0) {
							descriptorMap.putMap("permissions", Helper.decodePermissions(descriptor));
						}
						descriptorsArray.pushMap(descriptorMap);
					}
					if (descriptorsArray.size() > 0) {
						characteristicsMap.putArray("descriptors", descriptorsArray);
					}
					characteristicsArray.pushMap(characteristicsMap);
				}
				servicesArray.pushMap(serviceMap);
			}
			map.putArray("services", servicesArray);
			map.putArray("characteristics", characteristicsArray);
		}

		return map;
	}

	static JSONObject byteArrayToJSON(byte[] bytes) throws JSONException {
		JSONObject object = new JSONObject();
		object.put("CDVType", "ArrayBuffer");
		object.put("data", bytes != null ? Base64.encodeToString(bytes, Base64.NO_WRAP) : null);
		return object;
	}

	static WritableMap byteArrayToWritableMap(byte[] bytes) throws JSONException {
		WritableMap object = Arguments.createMap();
		object.putString("CDVType", "ArrayBuffer");
		object.putString("data", Base64.encodeToString(bytes, Base64.NO_WRAP));
		return object;
	}

	public boolean isConnected() {
		return connected;
	}

	public BluetoothDevice getDevice() {
		return device;
	}

	public Boolean hasService(UUID uuid){
		if(gatt == null){
			return null;
		}
		return gatt.getService(uuid) != null;
	}

	private void printServices(List<BluetoothGattService> service_list){
		Log.d(METHOD_TAG,"printServices()");
		for (BluetoothGattService service: service_list ){
			Log.d(LOG_TAG,service.getUuid().toString());
			printCharacteristics(service.getCharacteristics());
		}
	}

	private void printCharacteristics(List<BluetoothGattCharacteristic> characteristic_list){
		Log.d(METHOD_TAG,"printCharacteristics()");
		for(BluetoothGattCharacteristic characteristic: characteristic_list){
			Log.d(LOG_TAG,characteristic.getUuid().toString());
		}
	}

	@Override
	public void onServicesDiscovered(BluetoothGatt gatt, int status) {
		super.onServicesDiscovered(gatt, status);
		Log.d(METHOD_TAG," onServicesDiscovered()" + "status: " + status);

		List<BluetoothGattService> service_list =  gatt.getServices();
		//this.printServices(service_list);

		if(this.first_connecting){
			if(device_type == HVAC_TYPE){
				readADVCharacteristic();
			}else{
				writeSecurityString();
			}
		}

		if (retrieveServicesCallback != null) {
			WritableMap map = this.asWritableMap(gatt);

			retrieveServicesCallback.invoke(null, map);
			retrieveServicesCallback = null;
		}
	}

	@Override
	/*
		* status means
		* Programmatically disconnected - 0
		* connected - 2
		* Disconnected by device - 19
		* Issue with bond - 22
		* Device not found - 133 (some phones give you 62)

	* */
	public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) { // status is the result of the operation and new state is the new status with respect to the bridge
		Log.d(LOG_TAG, "onConnectionStateChange status:(" + status + ") newState: ("+ newState + ") this.simple_connect:(" + this.simple_connect + ") type: ("+ type + ") devuce,getAddres():" + device.getAddress() + " first_connecting: ("+ first_connecting +")");
        connectionState = newState;
		this.gatt = gatt;
		if (newState == BluetoothGatt.STATE_CONNECTED) {
			this.first_connecting = true;
			if(!this.simple_connect)
				retrieveServices(null);
			else{
				// means it comes from a simple_connect
				if(type == 1){
					if(device_type == HVAC_TYPE){
						this.readADVCharacteristic();
					}else{
						writeSecurityString();
					}
				}else{
				    connectionState = BluetoothProfile.STATE_CONNECTED;
					security_clear = true;

					sendConnectedEvent();
					this.first_connecting = false;
				}
			}
		} else if (newState == BluetoothGatt.STATE_DISCONNECTED){
			if(status == 19){
				killTheGatt();
			}
			resetVariables();
			sendConnectionEvent(device, "BleManagerDisconnectPeripheral",null);
		}
	}

	public void updateRssi(int rssi) {
		advertisingRSSI = rssi;
	}

	public void updateData(byte[] data) {
		advertisingData = data;
	}

	public int unsignedToBytes(byte b) {
		return b & 0xFF;
	}

	@Override
	public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
		super.onCharacteristicChanged(gatt, characteristic);

		byte[] dataValue = characteristic.getValue();
		WritableMap map = Arguments.createMap();
		map.putString("peripheral", device.getAddress());
		map.putString("characteristic", characteristic.getUuid().toString());
		map.putString("service", characteristic.getService().getUuid().toString());
		map.putArray("value", BleManager.bytesToWritableArray(dataValue));
		sendEvent("BleManagerDidUpdateValueForCharacteristic", map);
	}

	@Override
	public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
		super.onCharacteristicRead(gatt, characteristic, status);
		//Log.d(LOG_TAG, "onCharacteristicRead " + characteristic.getValue() + "status: " + status);
		//Log.d(LOG_TAG, characteristic.getUuid().toString());
		//Log.d(LOG_TAG, ADV_DATA_CHAR_SHORT_UUID.toString());
		if(characteristic.getUuid().toString().equals(ADV_DATA_CHAR_SHORT_UUID.toString())){
			ADV_DATA_CHAR_SHORT_UUID_VALUE = characteristic.getValue();
			this.writesecurityStringForHVAC();
		}else{
			if (readCallback != null) {

				if (status == BluetoothGatt.GATT_SUCCESS) {

					byte[] dataValue = characteristic.getValue();

					if (readCallback != null) {

						readCallback.invoke(null, BleManager.bytesToWritableArray(dataValue));
					}
				} else {
					readCallback.invoke("Error reading " + characteristic.getUuid() + " status=" + status, null);
				}

				readCallback = null;
			}
		}

	}

	@Override
	public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
		super.onCharacteristicWrite(gatt, characteristic, status);
		byte[] characteristic_value = characteristic.getValue();
		String characteristic_id = characteristic.getUuid().toString().toUpperCase();
		Log.d(METHOD_TAG,"onCharacteristicWrite() :" + characteristic_id +" - Status: " + String.valueOf(status) + " - " + "New Value: " + showByteArrayLikeHex(characteristic_value,true));

		if(characteristic_id.equals("98BF000C-0EC5-2536-2143-2D155783CE78")) { // characteristic to write the unpair or pair

			invokeWriteCallBack(status);

		}else if(characteristic_id.equals("58BF000B-0EC5-2536-2143-2D155783CE78")){ //characteristic to clear the security
			if(this.first_connecting){
				if(status == BluetoothGatt.GATT_SUCCESS) {
					this.setSecurityStatusClear();
				}
			}
		}
		else if(characteristic_id.equals(TX_DATA_CHAR_SHORT_UUID.toString().toUpperCase())){ //clear the security on the HVAC units
			if(this.first_connecting) {
				this.setSecurityStatusClear();
			}
		}
		else if (characteristic_id.equals("C8BF000B-0EC5-2536-2143-2D155783CE78")){
			this.invokeWriteCallBack(status);
		}else{
			Log.d(LOG_TAG,"No option found to the characteristic.");
		}
	}

	public void setSecurityStatusClear(){
		Log.d(METHOD_TAG, "setSecurityStatusClear");
		connectionState = BluetoothProfile.STATE_CONNECTED;
		security_clear = true;
		this.sendConnectedEvent();
		this.first_connecting = false;
	}

	private void sendConnectedEvent(){
		HashMap<String, String> map = new HashMap<String, String>();
		map.put("first_connecting",String.valueOf(first_connecting));
		map.put("connection_state", String.valueOf(connectionState));
		map.put("simple_connect",String.valueOf(simple_connect));
		map.put("device_status",String.valueOf(device_status));
		map.put("device_major",String.valueOf(device_major));
		map.put("device_minor",String.valueOf(device_minor));
		sendConnectionEvent(device, "BleManagerConnectPeripheral",map);
	}

	@Override
	public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
		super.onDescriptorWrite(gatt, descriptor, status);
		if (registerNotifyCallback != null) {
			if (status == BluetoothGatt.GATT_SUCCESS) {
				registerNotifyCallback.invoke();
			} else {
				registerNotifyCallback.invoke("Error writing descriptor stats=" + status, null);
			}

			registerNotifyCallback = null;
		}
	}

	@Override
	public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
		super.onReadRemoteRssi(gatt, rssi, status);
		if (readRSSICallback != null) {
			if (status == BluetoothGatt.GATT_SUCCESS) {
				updateRssi(rssi);
				readRSSICallback.invoke(null, rssi);
			} else {
				readRSSICallback.invoke("Error reading RSSI status=" + status, null);
			}

			readRSSICallback = null;
		}
	}

	private void invokeWriteCallBack(int status){
		if (writeCallback != null) {
			if (status == BluetoothGatt.GATT_SUCCESS) {
				writeCallback.invoke();
			} else {
				writeCallback.invoke("Error writing status: " + status);
			}
			writeCallback = null;
		}else {
			Log.e(LOG_TAG, "No callback on write: " + String.valueOf(status));
		}
	}

	private void setNotify(UUID serviceUUID, UUID characteristicUUID, Boolean notify, Callback callback){
		Log.d(LOG_TAG, "setNotify");

		if (gatt == null) {

			Log.d(LOG_ERROR_TAG,"The callback is null");
			return;
		}

		BluetoothGattService service = gatt.getService(serviceUUID);
		BluetoothGattCharacteristic characteristic = findNotifyCharacteristic(service, characteristicUUID);

		if (characteristic != null) {
			if (gatt.setCharacteristicNotification(characteristic, notify)) {

				BluetoothGattDescriptor descriptor = characteristic.getDescriptor(UUIDHelper.uuidFromString(CHARACTERISTIC_NOTIFICATION_CONFIG));
				if (descriptor != null) {

					// Prefer notify over indicate
					if ((characteristic.getProperties() & BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0) {
						Log.d(LOG_TAG, "Characteristic " + characteristicUUID + " set NOTIFY");
						descriptor.setValue(notify ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
					} else if ((characteristic.getProperties() & BluetoothGattCharacteristic.PROPERTY_INDICATE) != 0) {
						Log.d(LOG_TAG, "Characteristic " + characteristicUUID + " set INDICATE");
						descriptor.setValue(notify ? BluetoothGattDescriptor.ENABLE_INDICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
					} else {
						Log.d(LOG_TAG, "Characteristic " + characteristicUUID + " does not have NOTIFY or INDICATE property set");
					}

					try {
						if (gatt.writeDescriptor(descriptor)) {
							Log.d(LOG_TAG, "setNotify complete");
							registerNotifyCallback = callback;
						} else {
							Log.d(LOG_ERROR_TAG,"Failed to set client characteristic notification for " + characteristicUUID);
							callback.invoke("Failed to set client characteristic notification for " + characteristicUUID);
						}
					} catch (Exception e) {
						Log.d(LOG_TAG, "Failed to set client characteristic notification for " + characteristicUUID + ", error: " + e.getMessage());
					}

				} else {
					Log.d(LOG_ERROR_TAG,"Set notification failed for " + characteristicUUID);
				}

			} else {
				Log.d(LOG_ERROR_TAG,"Failed to register notification for " + characteristicUUID);
			}

		} else {
			Log.d(LOG_ERROR_TAG,"Characteristic " + characteristicUUID + " not found");
		}
	}

	public void registerNotify(UUID serviceUUID, UUID characteristicUUID, Callback callback) {
		Log.d(LOG_TAG, "registerNotify");
		this.setNotify(serviceUUID, characteristicUUID, true, callback);
	}

	public void removeNotify(UUID serviceUUID, UUID characteristicUUID, Callback callback) {
		Log.d(LOG_TAG, "removeNotify");
		this.setNotify(serviceUUID, characteristicUUID, false, callback);
	}

	// Some devices reuse UUIDs across characteristics, so we can't use service.getCharacteristic(characteristicUUID)
	// instead check the UUID and properties for each characteristic in the service until we find the best match
	// This function prefers Notify over Indicate
	private BluetoothGattCharacteristic findNotifyCharacteristic(BluetoothGattService service, UUID characteristicUUID) {
		BluetoothGattCharacteristic characteristic = null;

		try {
			// Check for Notify first
			List<BluetoothGattCharacteristic> characteristics = service.getCharacteristics();
			for (BluetoothGattCharacteristic c : characteristics) {
				if ((c.getProperties() & BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0 && characteristicUUID.equals(c.getUuid())) {
					characteristic = c;
					break;
				}
			}

			if (characteristic != null) return characteristic;

			// If there wasn't Notify Characteristic, check for Indicate
			for (BluetoothGattCharacteristic c : characteristics) {
				if ((c.getProperties() & BluetoothGattCharacteristic.PROPERTY_INDICATE) != 0 && characteristicUUID.equals(c.getUuid())) {
					characteristic = c;
					break;
				}
			}

			// As a last resort, try and find ANY characteristic with this UUID, even if it doesn't have the correct properties
			if (characteristic == null) {
				characteristic = service.getCharacteristic(characteristicUUID);
			}

			return characteristic;
		}catch (Exception e) {
			Log.e(LOG_TAG, "Errore su caratteristica " + characteristicUUID ,e);
			return null;
		}
	}

	public void read(UUID serviceUUID, UUID characteristicUUID, Callback callback) {
		Log.d(METHOD_TAG,"read()");
		if (gatt == null) {
			Log.d(LOG_TAG,"1");
			callback.invoke("BluetoothGatt is null", null);
			return;
		}

		Log.d(LOG_TAG,"2");
		BluetoothGattService service = gatt.getService(serviceUUID);
		BluetoothGattCharacteristic characteristic = findReadableCharacteristic(service, characteristicUUID);

		if (characteristic == null) {
			Log.d(LOG_TAG,"Characteristic " + characteristicUUID + " not found.");
		} else {
			Log.d(LOG_TAG,"4");
			readCallback = callback;
			if (!gatt.readCharacteristic(characteristic)) {
				Log.d(LOG_TAG,"5");
				readCallback = null;
				callback.invoke("Read failed", null);
			}
		}
	}

	public void readRSSI(Callback callback) {
		if (gatt == null) {
			callback.invoke("BluetoothGatt is null", null);
			return;
		}

		readRSSICallback = callback;

		if (!gatt.readRemoteRssi()) {
			readCallback = null;
			callback.invoke("Read RSSI failed", null);
		}
	}

	public void retrieveServices(Callback callback) {
		Log.d(METHOD_TAG,"retriveServices.");
		if (gatt == null) {
			if (callback != null)
				callback.invoke("BluetoothGatt is null", null);
			return;
		}
		if(callback != null)
			this.retrieveServicesCallback = callback;

		gatt.discoverServices(); //this call to onServicesDiscovered() callback
	}

	// Some peripherals re-use UUIDs for multiple characteristics so we need to check the properties
	// and UUID of all characteristics instead of using service.getCharacteristic(characteristicUUID)
	private BluetoothGattCharacteristic findReadableCharacteristic(BluetoothGattService service, UUID characteristicUUID) {
		BluetoothGattCharacteristic characteristic = null;
		if(gatt == null){
			this.connect(null,this.activity,false,"disconnected");
		}

		int read = BluetoothGattCharacteristic.PROPERTY_READ;
		if(service != null){

			List<BluetoothGattCharacteristic> characteristics = service.getCharacteristics();
			for (BluetoothGattCharacteristic c : characteristics) {
				if ((c.getProperties() & read) != 0 && characteristicUUID.equals(c.getUuid())) {
					characteristic = c;
					break;
				}
			}
		}else{
			Log.d(LOG_ERROR_TAG,"The gatt ist null.");
		}

		// As a last resort, try and find ANY characteristic with this UUID, even if it doesn't have the correct properties
		if (characteristic == null) {
			characteristic = service.getCharacteristic(characteristicUUID);
		}

		return characteristic;
	}

	public void doWrite(BluetoothGattCharacteristic characteristic, byte[] data) {
		characteristic.setValue(data);

		if (!gatt.writeCharacteristic(characteristic)) {
			Log.d(LOG_TAG, "Error on doWrite");
		}
	}

	public void write(UUID serviceUUID, UUID characteristicUUID, byte[] data,Callback callback, int writeType) {
		Log.d(METHOD_TAG,"write()" + showByteArrayLikeHex(data,true));
		if (gatt == null) {
			Log.e(LOG_TAG,"BluetoothGatt is null");
		} else {
			BluetoothGattService service = gatt.getService(serviceUUID);
			if(service == null){
				Log.e(LOG_TAG,"The service is null");
				return;
			}

			BluetoothGattCharacteristic characteristic = findWritableCharacteristic(service, characteristicUUID, writeType);

			if (characteristic == null) {
				Log.e(LOG_TAG,"The characteristic is null");
				callback.invoke("Characteristic " + characteristicUUID + " not found.");
			} else {
				characteristic.setWriteType(writeType);

				if ( writeCallback != null) {
					Log.e(LOG_TAG,"You're already writing 2");
					callback.invoke("You're already writing 2");
				}

				try {
					if(BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE == writeType){
						Thread.sleep(10);
					}

					characteristic.setValue(data);

					if (gatt.writeCharacteristic(characteristic)) {
						if (BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE == writeType) {
							callback.invoke();
							writeCallback = null;
						}
					} else {
						callback.invoke("Write failed");
						writeCallback = null;
					}

				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		}
	}

	public void unPair(UUID serviceUUID, UUID characteristicUUID, Integer maxByteSize, Integer queueSleepTime, Callback callback, int writeType){
		if (gatt == null) {
			Log.d(LOG_ERROR_TAG,"BluetoothGatt is null");
		} else {
			BluetoothGattService service = gatt.getService(serviceUUID);
			if(service == null)
				return;

			BluetoothGattCharacteristic characteristic = findWritableCharacteristic(service, characteristicUUID, writeType);

			if (characteristic == null) {
				callback.invoke("Characteristic " + characteristicUUID + " not found.");
			} else {
				characteristic.setWriteType(writeType);


				if (BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT == writeType) {
					writeCallback = callback;
				}

				byte[] data = {0,0,0,0,0,0};
				characteristic.setValue(data);

				if (gatt.writeCharacteristic(characteristic)) {
					if (BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE == writeType) {
						callback.invoke();
					}
				} else {
					callback.invoke("Write failed");
					writeCallback = null;
				}

			}
		}
	}



	// Some peripherals re-use UUIDs for multiple characteristics so we need to check the properties
	// and UUID of all characteristics instead of using service.getCharacteristic(characteristicUUID)
	private BluetoothGattCharacteristic findWritableCharacteristic(BluetoothGattService service, UUID characteristicUUID, int writeType) {
		try {
			BluetoothGattCharacteristic characteristic = null;

			// get write property
			int writeProperty = BluetoothGattCharacteristic.PROPERTY_WRITE;
			if (writeType == BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE) {
				writeProperty = BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE;
			}

			List<BluetoothGattCharacteristic> characteristics = service.getCharacteristics();
			for (BluetoothGattCharacteristic c : characteristics) {

				if ((c.getProperties() & writeProperty) != 0 && characteristicUUID.equals(c.getUuid())) {
					characteristic = c;
					break;
				}
			}

			// As a last resort, try and find ANY characteristic with this UUID, even if it doesn't have the correct properties
			if (characteristic == null) {
				characteristic = service.getCharacteristic(characteristicUUID);
			}

			return characteristic;
		}catch (Exception e) {
			Log.e(LOG_TAG, "Error on findWritableCharacteristic", e);
			return null;
		}
	}

	/*
		private String generateHashKey(BluetoothGattCharacteristic characteristic) {
			return generateHashKey(characteristic.getService().getUuid(), characteristic);
		}

		private String generateHashKey(UUID serviceUUID, BluetoothGattCharacteristic characteristic) {
			return String.valueOf(serviceUUID) + "|" + characteristic.getUuid() + "|" + characteristic.getInstanceId();
		}
	*/


}//(I/ReactNativeJS:|D/GATT_WRITE_CHARAC:|D/BtGatt.GattService:|D/BluetoothGatt:|D/logs:|D/METHOD:|D/LOG:|D/ERROR:|D/LOG_TAG:|D/METHOD:)
// (D/GATT_WRITE_CHARAC:|D/BtGatt.GattService:|D/logs:|D/METHOD:|D/LOG:|D/ERROR:|D/LOG_TAG:|D/METHOD:|D/ERROR:|D/BluetoothGatt:)
//^(?:(D/BluetoothLeScanner: onScanResult()))
//tag:^(?!(WifiMulticast|D/ScanRecord))
//^((?!(?:BluetoothLeScanner|D/ScanRecord:|D/BtGatt.ContextMap:|D/SignalClusterView:|D/StatusBar.NetworkController:|D/TimaService:|D/EnterpriseController:|D/BtGatt.ScanManager:|D/bt_upio:|D/bt_vendor:)).)*$
//^((?!(?:BluetoothLeScanner|D/ScanRecord:|D/BtGatt.ScanManager:|W/art:|I/art:)).)*$


//^((?!(?:BluetoothLeScanner|I/PermissionsUtil:|D/ScanRecord:|D/BtGatt.ContextMap:|D/bt_btif_gattc:|I/bt_btif:|D/SignalClusterView:|D/StatusBar.NetworkController:|D/TimaService:|D/EnterpriseController:|D/BtGatt.ScanManager:|D/bt_upio:|D/bt_vendor:|V/EPDG|V/EPDG|D/Netd:|D/BatteryMeterView:|D/EPDG|D/DateView:|D/BatteryService:|W/bt_btif:|D/PermissionsUtil:|I/mm-camera:|I/zygote:)).)*$