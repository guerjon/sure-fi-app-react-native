import React, {
    Component
} from 'react'
import {
    Text,
    View,
    Image,
    ScrollView,
    NativeModules,
    NativeEventEmitter,
    Alert,
    Modal,
    TouchableHighlight,
    PermissionsAndroid,
    AsyncStorage
} from 'react-native'
import {
    styles,
    first_color,
    height,
    width,
    option_blue
} from '../../styles/index.js'
import {
    connect
} from 'react-redux';
import {
    LOADING,
    SUREFI_CMD_SERVICE_UUID,
    SUREFI_CMD_WRITE_UUID,
    SUREFI_CMD_READ_UUID,
    HEX_TO_BYTES,
    BYTES_TO_HEX,
    IS_EMPTY,
    NOTIFICATION
} from '../../constants'
import {
    WRITE_COMMAND,
    LOG_INFO
} from '../../action_creators'
import {
    GiftedChat,
    Actions,
    Bubble
} from 'react-native-gifted-chat'
import {
    COMMAND_START_MSG_PACKAGE,
    COMMAND_PACKAGE_MSG_PIECE,
    COMMAND_SEND_MSG_PACKAGE
} from '../../commands'
import Icon from 'react-native-vector-icons/FontAwesome';

import CustomActions from './custom_actions'
import CustomView from './custom_view';
import Background from '../../helpers/background'

import BleManager from 'react-native-ble-manager'
const Permissions = require('react-native-permissions')
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const locationIcon = (<Icon name="map-marker" size={40} color="white" />)
var message_id = 100

class Chat extends Component {

    static navigatorStyle = {
        navBarBackgroundColor: first_color,
        navBarTextColor: "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true, 
    }

    static navigatorButtons = {
        rightButtons: [
            {
                id: "clear",
                title: "Clear", 
            }
        ]
    }

    constructor(props) {
        super(props);
        this.text = " "
        this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.device = this.props.device
    }

    componentWillMount() {
        this.handleCharacteristic = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleCharacteristicNotification)
        this.device_id = parseInt(this.device.manufactured_data.device_id, 16)
        this.other_guy_device_id = parseInt(this.device.manufactured_data.tx, 16)
        this.initDataBase()
    }

    componentWillUnmount() {
        this.handleCharacteristic.remove()
        this.props.activateHandleCharacteristic()
    }

    componentDidMount() {
        PermissionsAndroid.check("android.permission.ACCESS_FINE_LOCATION")
            .then(response => {
                if (response) {
                     this.getCurrentPosition()
                    
                }else{
                    this.props.dispatch({type:"SHOW_LOCATION_MODAL"})
                }
            })
            .catch(error => Alert.alert("Error", error))
    }

    renderLocationModal(){
        return (
            <Modal 
                animationType={"slide"}
                transparent={true}
                visible={this.props.show_location_modal}
                onRequestClose={() => this.props.dispatch({type: "HIDE_LOCATION_MODAL"})}

            >
                <View style={{backgroundColor: 'rgba(10,10,10,0.5)',flex:1,alignItems:"center",justifyContent:"center"}}>
                    
                    <View style={{backgroundColor:"white",width: width-80,height:300,alignSelf:'center',borderRadius:10,alignItems:"center"}}>
                        <View style={{width:width-80,backgroundColor:option_blue,height:100,borderTopLeftRadius:10,borderTopRightRadius:10,alignItems:"center",justifyContent:"center"}}>
                            {locationIcon}
                        </View>
                        <View style={{marginHorizontal:20,marginVertical:15,height:100,alignItems:"center",justifyContent:"center"}}>
                            <Text style={{fontSize:17}}>
                                In order to user all the Sure-Fi chat features the Location its required
                            </Text>
                        </View>
                        <TouchableHighlight 
                            onPress={() => this.requestLocationPermissons()} 
                            style={{
                                marginTop:10,
                                borderTopWidth: 0.2,
                                width:width,
                                height: 60,
                                alignItems:"center",
                                justifyContent:"center",
                                borderRadius: 10
                            }}>
                            <Text style={{color:option_blue}}>
                                Activate Location
                            </Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        )
    }   

    requestLocationPermissons(){
            Permissions.request('location')
            .then(response => {
                if(response == "authorized")
                    this.getCurrentPosition()
                
                this.props.dispatch({type:"HIDE_LOCATION_MODAL"})
            })
            .catch(error => Alert.alert("Error", error))        
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "clear":
                    this.clear()
                break
                default:
                break
            }
        } 
    }

    clear(){
        console.log("clear()")
        this.clearFromMemory()
        this.props.dispatch({type : "SET_MESSAGES",messages: []})
    }

    clearFromMemory(){
        AsyncStorage.removeItem(this.props.device.manufactured_data.device_id)
    }

    initDataBase() {
        const value = AsyncStorage.getItem(this.props.device.manufactured_data.device_id)
        .then(value => {
            console.log("no hay ni madres :(",value);
            if(value !== null){
                value = JSON.parse(value)
                console.log("value",value.messages);
                this.props.dispatch({type:"SET_MESSAGES",messages:value.messages})
            }
        });
        
    }



    handleCharacteristicNotification(data) {
        console.log("dataNotification on chat", data.value)
        var value = data.value[0]
        LOG_INFO(data.value,NOTIFICATION)
        switch (value) {

            case 0x21: //MsgPackageSending
                this.props.dispatch({
                    type: "UPDATE_MESSAGE_STATUS",
                    message_status: "sended"
                })
                break
            case 0x22: //MsPackateComplete

                break
            case 0x23: //MsPackageReceived 
                data.value.shift()
                break
            case 0x24: //MsPackagePiece

                data.value.shift()
                switch(data.value[0]){
                    case 0x0F:
                        this.handleReceivedLocation(data.value,0x1F)
                    break
                    case 0x0E:
                        this.handleReceivedPing(data.value)
                    break
                    case 0x1F:
                        this.handleReceivedLocation(data.value)
                    break
                    default:
                        this.handleReceivedMessage(data.value)
                    break;
                }
                break
            case 0xE0:
                Alert.alert("Error","Security Error")
                break
            case 0xE1:
                Alert.alert("Error","Start update error")
                break
            case 0xE2:
                Alert.alert("Error","Already started Error")
                break
            case 0xE3:
                Alert.alert("Error","Not stared error")
                break
            case 0xE4:
                Alert.alert("Error", "Number of bytes incorrect.")
                break
            case 0xE5:
                Alert.alert("Error", "Page failure.")
                break
            case 0xE6:
                Alert.alert("Error","Image Crc Failure Error")
                break
            case 0xE7:
                Alert.alert("Error","Register Failure")
                break
            case 0xE8:
                Alert.alert("Error", "Deploy failure")
                break
            case 0xE9:
                Alert.alert("Error","Unsoported CMD")
                break
            case 0xEA:
                Alert.alert("Error","Package Failed")
                break
            default:
                console.log("There are no option to :" + data.value[0])
                break;
        }
    }

    handleReceivedMessage(data){

        var message = this.stringFromUTF8Array(data)
        message_id += 1
        var message_object = [{
            _id: Math.round(Math.random() * 1000000),
            text: message,

            createdAt: new Date(),
            user: {
                _id: this.other_guy_device_id,
                name: this.props.device_name
            },
        }]
        var current_messages = message_object.concat(this.props.messages)

        this.saveOnMemory(current_messages)

        this.props.dispatch({
            type: "SET_MESSAGES",
            messages: current_messages
        })
    }

    byteArrayToLong(byteArray){
        var value = 0;
        for ( var i = byteArray.length - 1; i >= 0; i--) {
            value = (value * 256) + byteArray[i];
        }

        return value;
    };    

    onSend(message = []) {
        console.log("onSend()", message)

        var current_messages = message.concat(this.props.messages)

        var message_bytes = this.toUTF8Array(message[0].text) //transform the string to bytes

        var lenght_bytes = this.numberToBytes(message_bytes.length) // transform the lenght of the message on a lenght on bytes
       
        this.writeStartMsgPackage(lenght_bytes[1])
        this.writeMessage(message_bytes)
        this.saveOnMemory(current_messages)

        this.props.dispatch({
            type: "SET_MESSAGES",
            messages: current_messages
        })
    }
    
    saveOnMemory(messages){
        var messages = JSON.stringify({messages:messages})

        try{
            AsyncStorage.setItem(this.props.device.manufactured_data.device_id,messages)
        }
        catch(error){
            console.error("error",error);
        }
    }

    writeStartMsgPackage(message_length_bytes) {
        console.log("writeStartMsgPackage()")
        const command = 0x30
        const data = [command, message_length_bytes]
        let id = this.device.id

        this.write(data)
    }

    writeMessage(message_bytes){
        console.log("writeMessage(message_bytes)")
        if (message_bytes.length > 20) {
            setTimeout(() => this.writeLongMessage(message_bytes), 1000)

        } else {
            setTimeout(() => this.writeNormalMessage(message_bytes), 1000)
        }        
    }

    writeLongMessage(message_bytes) {
        console.log("writeLongMessage()")
        var command = 0x31
        var id = this.device.id

        while (message_bytes.length) {
            let page = message_bytes.splice(0, 19)
            page.unshift(command)

            this.writeWithoutResponse(page)
        }

        setTimeout(() => this.write([0x32]), 2000) // finish command
    }

    writeNormalMessage(message_bytes) {
        console.log("writeNormalMessage()")
        var command = 0x31
        var id = this.device.id

        message_bytes.unshift(command)
        WRITE_COMMAND(id, message_bytes)

        setTimeout(() => this.write([0x32]), 2000) // finish command
    }

    /*--------------- Location ---------------------------*/

    sendLocation() {
        console.log("sendLocation-Chat()")
        this.props.navigator.dismissLightBox();
       
        PermissionsAndroid.check("android.permission.ACCESS_FINE_LOCATION")
            .then(response => {
                if (response) {
                    this.onSendLocation(0x0F)
                } else {    
                    Permissions.request('location')
                        .then(response => {
                            console.log("response",response);
                            if (response == "authorized") {
                                this.getCurrentPosition()
                                setTimeout(() => this.onSendLocation(0x0F),2000)
                            } else {
                                this.props.dispatch({type:"SHOW_LOCATION_MODAL"})
                            }
                        })
                }
                
            })
            .catch(error => Alert.alert("Error", error))
    }

    onSendLocation(command){
        console.log("onSendLocation()");
        
        if(!IS_EMPTY(this.props.my_coordenates)){
            var coordenates = this.props.my_coordenates
            var location_object = this.createLocationObject(coordenates.latitude,coordenates.longitude)
            this.doSendLocation(location_object,command)
        }else{
            Alert.alert("Error","The coordenates are empty")
        } 
    }

    createLocationObject(latitude,longitude){

        var location_object = [{
            location: {
                latitude: latitude,
                longitude: longitude
            },
            user: {
                _id: this.device_id
            },
            createdAt: new Date(),
            _id: Math.round(Math.random() * 1000000),
            type: "sended_location",
            goToCustomMap: (type) => this.goToCustomMap(type)
        }]    

        return location_object
    }

    getCurrentPosition() {
        console.log("getCurrentPosition()")
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.props.dispatch({type: "UPDATE_MY_COORDENATES", my_coordenates: {latitude: position.coords.latitude,longitude: position.coords.longitude}})
            },
            (error) => alert(error.message)
        )
    }


    doSendLocation(location,command) {
        console.log("doSendLocation()")
        
        this.writeStartMsgLocationPackage()
        this.writeLocation(location,command)
        this.renderSendedLocation(location)
    }


    writeStartMsgLocationPackage() {
        console.log("writeStartMsgLocationPackage()")
        var command = [0x30,11]
        this.write(command)
    }

    writeLocation(location,command) {
        console.log("writeLocation()")
        location = location[0].location
        var new_latitude = this.coordenateToBytes(location.latitude).reverse()
        var new_longitude = this.coordenateToBytes(location.longitude).reverse()
        var accuracy = [0x00,0x00]
        var location_command = [0x31,command]
        var data = location_command.concat(new_latitude.concat(new_longitude.concat(accuracy)))
        setTimeout(() => {
            this.write(data)
            setTimeout(() => this.write([0x32] ),1000)
        } ,2000) 
    }

    renderSendedLocation(location){
        console.log("renderSendedLocation");
        var data = location.concat(this.props.messages)
        
        this.saveOnMemory(data)

        this.props.dispatch({
            type: "SET_MESSAGES",
            messages: data
        })
    }

    renderRecivedLocation(location,command){
        console.log("renderRecivedLocation()");
        var data = location.concat(this.props.messages)

        this.saveOnMemory(data)
        
        this.props.dispatch({
            type: "SET_MESSAGES",
            messages: data
        })

        if(command == 0x1F){
            this.writeStartMsgLocationPackage()
            this.writeLocation(location,command)
        }
    }

    coordenateToBytes(coordenate) {
        if(coordenate < 0)
            coordenate = coordenate * -1
        
        coordenate = Math.rounpard(coordenate * 10000000) 
        coordenate = coordenate.toString(16)
        coordenate = HEX_TO_BYTES(coordenate)
        return coordenate
    }


    handleReceivedLocation(data,command){
        console.log("handleReceivedLocation()");
        if(data.length == 11){
            
            var latitude  = data.slice(1,5)
            var longitude = data.slice(5,9)
            var accuracy = data.slice(9,11)
            
            var latitude = this.byteArrayToLong(latitude);
            var longitude = this.byteArrayToLong(longitude)
           
            latitude = latitude / 10000000
            longitude = (longitude / 10000000) * -1
            
            message_id  += 1
            var message_object = [{
                _id: Math.round(Math.random() * 1000000),
                createdAt: new Date(),
                type : "received_location",
                user: {
                    _id: this.other_guy_device_id,
                    name: this.props.device_name
                },             
                location: {
                    latitude: latitude,
                    longitude: longitude
                },
                goToCustomMap: (data) => this.goToCustomMap(data)
            }]

            this.props.dispatch({type:"UPDATE_OTHER_GUY_COORDENATES",other_guy_coordenates:{latitude: latitude,longitude:longitude}})
            
            this.renderRecivedLocation(message_object,command)

        }else{
            Alert.alert("Error","The location wasn't not received correctly")
        }
    }

    /*--------------- END LOCATION ---------------------------*/


    /*--------------- PING ---------------------------*/

    handleReceivedPing(message){
        console.log("message on pin",message)
        
        var message_object = [{
            _id: Math.round(Math.random() * 1000000),
            type : "received_ping",
            createdAt: new Date(),
            user: {
                _id: this.other_guy_device_id,
                name: this.props.device_name
            },
        }]

       var current_messages = message_object.concat(this.props.messages)
       this.saveOnMemory(current_messages)
        this.props.dispatch({
            type: "SET_MESSAGES",
            messages: current_messages
        })        
    }

    /*--------------- PING ---------------------------*/
    

    goToCustomMap(data){
        this.props.navigator.push({
            screen: "CustomMap",
            title : "Location",
            passProps: {
                data : data
            }
        })  
    }

    numberToBytes(number) {
        return HEX_TO_BYTES(this.dec2hex(number))
    }

    write(data) {
        console.log("write(data)",data)
        var id = this.device.id
        WRITE_COMMAND(id, data)
    }

    dec2hex(i) {
        var result = "0000";
        if (i >= 0 && i <= 15) {
            result = "000" + i.toString(16);
        } else if (i >= 16 && i <= 255) {
            result = "00" + i.toString(16);
        } else if (i >= 256 && i <= 4095) {
            result = "0" + i.toString(16);
        } else if (i >= 4096 && i <= 65535) {
            result = i.toString(16);
        }
        return result
    }

    writeWithoutResponse(data) {
        BleManagerModule.specialWriteWithoutResponse(this.device.id, SUREFI_CMD_SERVICE_UUID, SUREFI_CMD_WRITE_UUID, data, 20, 16)
    }

    stringFromUTF8Array(data) {
        const extraByteMap = [1, 1, 1, 1, 2, 2, 3, 0];
        var count = data.length;
        var str = "";

        for (var index = 0; index < count;) {
            var ch = data[index++];
            if (ch & 0x80) {
                var extra = extraByteMap[(ch >> 3) & 0x07];
                if (!(ch & 0x40) || !extra || ((index + extra) > count))
                    return null;

                ch = ch & (0x3F >> extra);
                for (; extra > 0; extra -= 1) {
                    var chx = data[index++];
                    if ((chx & 0xC0) != 0x80)
                        return null;

                    ch = (ch << 6) | (chx & 0x3F);
                }
            }

            str += String.fromCharCode(ch);
        }

        return str;
    }

    setCustomText(text) {
        this.text = text
    }

    toUTF8Array(str) {
        var utf8 = [];
        for (var i = 0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                    0x80 | (charcode & 0x3f));
            } else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                    0x80 | ((charcode >> 6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
                i++;
                // UTF-16 encodes 0x10000-0x10FFFF by
                // subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
                    (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >> 18),
                    0x80 | ((charcode >> 12) & 0x3f),
                    0x80 | ((charcode >> 6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            }
        }
        return utf8;
    }

    getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1); 
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    sendPing() {
        this.closeModal()
        setTimeout(() => {
            this.write([0x30,0x01])
            setTimeout(() => {
                this.write([0x31,0x0E])
                setTimeout(() => {
                    this.write([0x32])

                    var message_object = [{
                        _id: Math.round(Math.random() * 1000000),
                        type: "sended_ping",
                        createdAt: new Date(),
                        user: {
                            _id: this.device_id,
                            name: this.props.device_name
                        },
                    }]

                    var current_messages = message_object.concat(this.props.messages)

                    this.props.dispatch({
                        type: "SET_MESSAGES",
                        messages: current_messages
                    })
                },1000)
            },1000)
        },1000)
    }

    closeModal() {
        this.props.navigator.dismissLightBox();
    }

    renderModal() {
        this.props.navigator.showLightBox({
            screen: "ChatOptions",
            passProps: {
                sendLocation: () => this.sendLocation(),
                sendPing: () => this.sendPing(),
                closeModal: () => this.closeModal()
            },
            style: {
                backgroundBlur: "dark", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                backgroundColor: "backgroundColor: 'rgba(10,10,10,0.5)" // tint color for the background, you can specify alpha here (optional)
            },
            adjustSoftInput: "resize", // android only, adjust soft input, modes: 'nothing', 'pan', 'resize', 'unspecified' (optional, default 'unspecified')
        });
    }

    renderCustomActions(props) {
        return (
            <Actions
                onPressActionButton = {() => this.renderModal()}
            />
        );
    }


    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                left: {
                    backgroundColor: '#f0f0f0',
                }
                }}
            />
        );
    }


    renderCustomView(props) {

        return (
            <CustomView
                {...props}
            />
        );
    }


    renderFooter(props) {
        if (this.props.typingText) {
            return (
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>
                    {this.props.typingText}
                  </Text>
                </View>
            );
        }
        return null;
    }

    render() {
        return (
            <View style={{flex:1,backgroundColor:"white"}}>
                <GiftedChat 
                    messages={this.props.messages}
                    renderActions={() => this.renderCustomActions()}
                    onSend={(messages) => this.onSend(messages)}
                    renderCustomView={this.renderCustomView}
                    user={{ _id: this.device_id }}
                />
                {this.renderLocationModal()}
            </View>
        );
    }
}

const mapStateToProps = state => ({
    messages: state.chatReducer.messages,
    text: state.chatReducer.text,
    show_chat_modal: state.chatReducer.show_chat_modal,
    device_name: state.setupCentralReducer.device_name,
    message_status: state.chatReducer.message_status,
    typingText: state.chatReducer.typingText,
    show_location_modal : state.chatReducer.show_location_modal,
    my_coordenates : state.chatReducer.my_coordenates,
    other_guy_coordenates : state.chatReducer.other_guy_coordenates,
    device : state.scanCentralReducer.central_device,
});

export default connect(mapStateToProps)(Chat);