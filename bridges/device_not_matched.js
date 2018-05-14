import React, {
    Component
} from 'react'
import {
    Text,
    View,
    Image,
    ScrollView,
    Linking,
    Alert,
    TouchableHighlight,
    ActivityIndicator
} from 'react-native'
import {
    styles,
    first_color,
    height,
    width,
    option_blue
} from '../styles/index.js'
import {
    connect
} from 'react-redux';
import {
    LOADING,
    GET_DEVICE_DOCUMENTS,
    MATCH_DEVICE,
    HEADERS_FOR_POST
} from '../constants'
import Background from '../helpers/background'
import {
    WhiteRowLink
} from '../helpers/white_row_link'
var device_not_matched_interval = 0
class DeviceNotMatched extends Component {

    static navigatorStyle = {
        navBarBackgroundColor: first_color,
        navBarTextColor: "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true,
    }

    static navigatorButtons = {
        leftButtons: [{
            id: 'back',
            title: 'Back'
        }]
    }

    constructor(props) {
        super(props);
        this.path = ""
        this.devices = this.props.devices
        this.manager = props.manager
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    createInterval() {
        if (device_not_matched_interval == 0) {
            device_not_matched_interval = setInterval(() => this.checkForDevice(), 2000)
            console.log("interval created")
        } else {
            console.log("the interval can't be created it was created previosly")
        }
    }

    eraseInterval(){
        if(device_not_matched_interval){
            clearInterval(device_not_matched_interval)
            device_not_matched_interval = 0
        }else{
            console.log("The interval was erase previously");
        }
    }

    checkForDevice() {
        console.log("checkForDevice()")
        var device_id = this.props.device_id
        var devices = this.props.devices

        this.matched_devices = MATCH_DEVICE(devices, device_id)

        if (this.matched_devices.length > 0) {
            this.props.dispatch({
                type: "DEVICE_FOUND",
                device_found: true
            })
            this.eraseInterval()
        } else {
            this.props.dispatch({
                type: "DEVICE_FOUND",
                device_found: false
            })
        }
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        console.log("event", event)
        switch (event.id) {
            case "willDisappear":
                this.props.showCamera()
                break
            default:
                break
        }
    }

    componentWillMount() {
        this.setLoadingDocumentation()
        fetch(GET_DEVICE_DOCUMENTS, {
            method: "POST",
            headers: HEADERS_FOR_POST,
            body: JSON.stringify({
                hardware_serial: this.props.device_id
            })
        }).then(response => {        
            let data = JSON.parse(response._bodyInit).data.documents

            this.props.dispatch({
                type: "SET_DOCUMENTATION_INFO",
                documentation_info: data[0]
            })
            this.setLoadedDocumentation()
        })
        this.createInterval()
    }

    componentWillUnmount(){
        console.log("componentWillUnmount()");
        this.eraseInterval()
    }

    setLoadingDocumentation(){
        this.props.dispatch({type: "SET_LOADED_DOCUMENTATION_STATE",loaded_documentation_state: "loading"})
    }

    setLoadedDocumentation(){
        this.props.dispatch({type: "SET_LOADED_DOCUMENTATION_STATE",loaded_documentation_state: "loaded"})
    }

    goToAccessControlInstructions() {
        console.log("goToAccessControlInstructions()");
        if(this.props.documentation_info){
            const path = this.props.documentation_info.document_path
            if (path)
                Linking.openURL(path)
            else
                Alert.alert("Error", "The link wasn't found.")            
        }else{
            Alert.alert("Error","No documentation found for this device.")
        }
    }

    renderDeviceNotFound() {
    	console.log("renderDeviceNotFound()");
		return (
			<View style={{backgroundColor:"white",flexDirection:"row"}}>
			    <View style={{width:width * .20,alignItems:"center",justifyContent:"center"}}>
				    <Image source={require('../images/menu_fail.imageset/menu_fail.png')} style={{width:50,height:50,margin:10}}/>
			    </View>
			    <View style={{margin:20,width: width * .75}}>
				    <Text style={{color:"red"}}>
				        Sure-Fi was unable to find the Device  {this.props.device_id} via Bluetooth. 
				        Please make sure you are within range and the device is powered on.
				    </Text>
			     </View>
			</View>
		)
    }

    renderDeviceFound(){
    	console.log("renderDeviceFound()");
    	return(
			<TouchableHighlight onPress={() => this.handleDeviceSelected()}>
				<View style={{backgroundColor:"white",flexDirection:"row"}}>
				  	<View style={{width:width * .20,alignItems:"center",justifyContent:"center"}}>
						<Image source={require('../images/menu_success.imageset/menu_success.png')} style={{width:50,height:50,margin:10}}/>
				  	</View>
				  	<View style={{margin:20,width: width * .75}}>
						<Text style={{color:"green"}}>
							Your Device: {this.props.device_id} has been discoverd via Bluetooth. Touch here to connect to your device.  	
						</Text>
				  	</View>
			  	</View>
			</TouchableHighlight>
    	)
    }

    handleDeviceSelected(){
        if(this.matched_devices){
            if(this.matched_devices.length > 0){
                var matched_device = this.matched_devices[0]
                delete matched_device._manager;
                this.props.navigator.pop()
                this.props.checkDeviceType(matched_device)          
            }else{
                this.props.navigator.pop()    
            }
        }else{
            this.props.navigator.pop()    
        }
    }

    renderMessage(){
    	console.log("renderMessage()");
    	if(this.props.showAlert){
	    	if(this.props.device_found)
	    		return this.renderDeviceFound()
	    	
	    	return this.renderDeviceNotFound()    		
    	}

    	return null
    }

    render() {

        if (this.props.loaded_documentation_state == "loading") {
            return (
                <Background>
                    <View style={{height:height,justifyContent:"center",alignItems:"center"}}>
                        <ActivityIndicator/>
                    </View>
                </Background>

            )
        }
        let title = "Download documentation"
        if(this.props.documentation_info){
            if(this.props.documentation_info.document_title){
                title = this.props.documentation_info.document_title 
            }            
        }

        return (
	        <Background>
				<View style={{height:height}}>
                    <View>
                        {this.renderMessage()}
                    </View>
				  	<View>
						<Text style={styles.device_control_title}>AVAILABLE DOCUMENTS</Text>
                        <TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center"}} onPress={() => this.goToAccessControlInstructions()}>
                            <View style={{padding:15,flexDirection:"row"}}>
                                <View style={{width:(width * .75),justifyContent:"center"}}>
                                    <Text style={{fontSize:16,color:option_blue}}>
                                        {title}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={{fontSize:20,alignItems:"flex-end",justifyContent:"center",alignItems:"center"}}>
                                        >
                                    </Text>                                
                                </View>
                            </View>
                        </TouchableHighlight>
				  	</View>
				</View>
	  		</Background>
        );
    }
}

const mapStateToProps = state => ({
    documentation_path: state.loginReducer.documentation_path,
    documentation_info : state.loginReducer.documentation_info,
    loaded_documentation_state: state.loginReducer.loaded_documentation_state,
    device_found: state.loginReducer.device_found,
    devices : state.pairReducer.devices,
    manager : state.scanCentralReducer.manager,
});

export default connect(mapStateToProps)(DeviceNotMatched);