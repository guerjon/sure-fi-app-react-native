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
    ActivityIndicator,
    TouchableOpacity
} from 'react-native'
import {
    styles,
    first_color,
    height,
    width,
    option_blue,
    success_green,
    hvac_red,
    relay_blue
} from '../styles/index.js'
import {
    connect
} from 'react-redux';
import {
    LOADING,
    GET_DEVICE_DOCUMENTS,
    MATCH_DEVICE,
    HEADERS_FOR_POST,
    GET_PRICE_URL,
    SUCCESS_STATUS,
    FAIL_STATUS
} from '../constants'
import Background from '../helpers/background'
import {
    WhiteRowLink
} from '../helpers/white_row_link'
import Icon from 'react-native-vector-icons/FontAwesome';

var device_not_matched_interval = 0
var wait_for_internet_interval = 0
const exclamationTriangle = (<Icon name="exclamation-triangle" size={100} color="red"/>)

class Documentation extends Component {

    static navigatorStyle = {
        navBarBackgroundColor: first_color,
        navBarTextColor: "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true,
    }

    constructor(props) {
        super(props);
        this.path = ""
        this.devices = this.props.devices
        this.manager = props.manager
    }

    componentWillMount() {
        this.setLoadingDocumentation()
        this.createInterval() 
        this.loadDocumentation()
    }

    async loadDocumentation(){
        let scan_result = this.props.device_scan_link
        
        if(scan_result){
            var device_id = scan_result.substr(-6).toUpperCase();

            try{
                let response = await this.getManualsAndVideos(device_id)
                if(response == SUCCESS_STATUS){
                    let response_2 = await this.getSystemProductType(device_id)    
                    if(response_2 == SUCCESS_STATUS){
                        this.setLoadedDocumentation()
                        this.deleteWaitForInternetInterval()                             
                    }
                }
            }catch(e){
                console.log(e)                
            }
            
        }else{
            Alert.alert("Error","The Scanner was incorrect try again.")
        }
    }
    /*
    * getManualsAndVideos is doing a fetch in order to get the manual and videos from the cloud
    */
    async getManualsAndVideos(device_id){
        console.log("getManualsAndVideos()")
        const body = JSON.stringify({
            hardware_serial: device_id
        })
        
        var videos = []
        var docs = []

        try{
            const device_documents_response = await fetch(GET_DEVICE_DOCUMENTS, {
                method: "POST",
                headers: HEADERS_FOR_POST,
                body: body
            })

            if(device_documents_response._bodyInit){
                let data = JSON.parse(device_documents_response._bodyInit).data.documents

                data.map(single_response => {
                    if(single_response.document_type == "INSTRUCTIONS"){
                        docs.push(single_response)
                    }else if(single_response.document_type == "VIDEO"){
                        videos.push(single_response)
                    }
                })

                this.props.dispatch({type: "SET_DOCUMENTATION_INFO",documentation_info: docs})
                this.props.dispatch({type: "SET_VIDEOS_INFO",videos_info: videos})
                this.props.dispatch({type: "SHOW_NO_INTERNET_CONNECTION",show_no_internet_connection:false})
                return new Promise(resolve => {
                    resolve(SUCCESS_STATUS)
                })
            }else{
                throw "The network request failed." 
            }
        }catch(e){

            this.props.dispatch({type: "SHOW_NO_INTERNET_CONNECTION",show_no_internet_connection:true})
            this.setLoadedDocumentation()
            this.createWaitForInternetInterval()

            return new Promise((resolve,reject) => {
                resolve(FAIL_STATUS)  
            })
        }
    }

    async getSystemProductType(device_id){
        console.log("getSystemProductType()")
        const body = JSON.stringify({
            serial: device_id
        })

        try{
            const new_response = await fetch(GET_PRICE_URL,{
                method: "POST",
                headers: HEADERS_FOR_POST,
                body: body
            })

            if(new_response._bodyInit){

                const new_data = JSON.parse(new_response._bodyInit).data.system

                this.props.dispatch({type:"SET_SYSTEM_HARDWARE_TYPE",system_hardware_type: new_data.system_product_id})               
                this.props.dispatch({type: "SHOW_NO_INTERNET_CONNECTION",show_no_internet_connection:false})
                return new Promise(resolve => {
                    resolve(SUCCESS_STATUS)
                })
            }else{
                throw "The network request failed."     
            }                 
        }catch(e){
            this.props.dispatch({type: "SHOW_NO_INTERNET_CONNECTION",show_no_internet_connection:true})
            this.setLoadedDocumentation()
            return new Promise((resolve,reject) => {
                resolve(FAIL_STATUS)
            })
            this.createWaitForInternetInterval()
        }
    }

    showFetchAlertError(error){
        if (typeof error === 'string' || error instanceof String)
            Alert.alert("Error",error)
        else                    
            Alert.alert("Error","The network request failed.")        
    }

    createWaitForInternetInterval(){    
        if(wait_for_internet_interval == 0){
           setTimeout(() => {
                this.loadDocumentation()
            },3000)
        }            
    }

    deleteWaitForInternetInterval(){
        clearInterval(wait_for_internet_interval)
    }

    componentWillUnmount(){
        console.log("componentWillUnmount()");
        this.props.showCamera()
        this.eraseInterval()
        this.setDeviceFoundToFalse()
    }

    setDeviceFoundToFalse(){
        this.props.dispatch({type: "DEVICE_FOUND",device_found: false})        
    }

    createInterval() {
        console.log("createInterval()")
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
        var devices = this.props.devices
        const scan_result = this.props.device_scan_link

        if(scan_result){

            var device_id = scan_result.substr(-6).toUpperCase();
                
            this.matched_devices = MATCH_DEVICE(devices, device_id)
            if (this.matched_devices.length > 0) {
                this.eraseInterval()
                this.props.dispatch({
                    type: "DEVICE_FOUND",
                    device_found: true
                })
                
            } else {
                this.setDeviceFoundToFalse()
            }
        }
    }

    setLoadingDocumentation(){
        console.log("setLoadingDocumentation()")
        this.props.dispatch({type: "SET_LOADED_DOCUMENTATION_STATE",loaded_documentation_state: "loading"})
    }

    setLoadedDocumentation(){
        console.log("setLoadedDocumentation()")
        this.props.dispatch({type: "SET_LOADED_DOCUMENTATION_STATE",loaded_documentation_state: "loaded"})
    }

    openLink(path) {
        console.log("openLink()",path);
        if (path)
            Linking.openURL(path)
        else
            Alert.alert("Error", "The link wasn't found.")            
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
                
                this.props.checkDeviceType(matched_device)

            }else{
                Alert.alert("Error","No devices founded.")
                this.props.navigator.pop()    
            }
        }else{
            Alert.alert("Error","No devices founded.")
            this.props.navigator.pop()    
        }
    }

    openDocumentationModal(){
        this.props.navigator.showLightBox({
            screen: "DocumentationModal",
            style: {
                flex:1,
                backgroundBlur: "none", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                backgroundColor: "backgroundColor: 'rgba(10,10,10,0.7)'" // tint color for the background, you can specify alpha here (optional)
            },
            passProps: {
                openLink: (link) => this.openLink(link)
            }
        });    
    }

    closeDocumentationModal(){
        this.props.dispatch({type:"SHOW_DOCUMENTATION_MODAL",show_documentation_modal:false})   
    }

    openVideoModal(){   
        //this.props.dispatch({type:"SHOW_VIDEOS_MODAL",show_videos_modal:true})
        this.props.navigator.showLightBox({
            screen: "VideosModal",
            style: {
                flex:1,
                backgroundBlur: "none", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                backgroundColor: "backgroundColor: 'rgba(10,10,10,0.7)'" // tint color for the background, you can specify alpha here (optional)
            },
            passProps: {
                openLink: (link) => this.openLink(link)
            }            
        });
    }    

    closeDocumentationModal(){
        this.props.dispatch({type:"SHOW_VIDEOS_MODAL",show_videos_modal:false})
    }

    renderDocumentationInfo(){
        const documentation_info = this.props.documentation_info

        if(documentation_info && documentation_info.length > 0){
            var action = () => this.openDocumentationModal()
            if(documentation_info.length == 1){
                action = () => this.openLink(documentation_info[0].document_path)
            }
            return(
                <View style={{width:width,alignItems:"center",justifyContent:"center"}} >
                    <TouchableOpacity onPress={action}>
                        <Image source={require('../images/menu_manual/menu_manual.png')} style={{width:175,height:175,margin:10}}/>
                    </TouchableOpacity>
                </View>
            )
        }
        
        return null    
        
    }

    renderVideoInfo(){
        const videos_info = this.props.videos_info

        if(videos_info && videos_info.length > 0){
            var action = () => this.openVideoModal()
            if(videos_info.length == 1){
                action = () => this.openLink(videos_info[0].document_path)
            }

            return(
                <View style={{width:width,alignItems:"center",justifyContent:"center"}}>
                    <TouchableOpacity  onPress={action}>
                        <Image source={require('../images/menu_instruction_video/menu_instruction_video.png')} style={{width:175,height:175,margin:10}}/>
                    </TouchableOpacity>
                </View>
            )
        }else
        return null
    }

    renderHeaderType(){
        console.log("this.props.system_hardware_type",this.props.system_hardware_type)
        if(this.props.system_hardware_type){
            var type = "Uknown type"
            var color = "white"

            switch(this.props.system_hardware_type){
                case 7:
                    type = "HVAC Bridge"
                    color = hvac_red
                break
                case 4:
                    type = "Wiegand Bridge" 
                    color = success_green
                break
                case 8:
                    type = "Relay Bridge"
                    color = relay_blue
                break
                case 9:
                    type = "Relay Bridge"
                    color = relay_blue
                break

                default:
                break
            }

            return(
                <View style={{width:width,height:50,backgroundColor:color,alignItems:"center",justifyContent:"center"}}>
                    <Text style={{color:"white",fontSize:22}}>
                        {type}
                    </Text>
                </View>
            )            
        }

        return null

    }

    renderAdvancedSettings(){
        if(this.props.device_found){
            return(
                <TouchableOpacity style={{alignItems:"center",width:width}} onPress={() => this.handleDeviceSelected()}>
                    <View style={{borderWidth:2,borderColor:success_green,flexDirection:"row",width:width-30,borderRadius:40,height:70,alignItems:"center"}}>
                        <Image source={require("../images/power_online/power_online.png")} style={{marginLeft:5}}/>
                        <Text style={{marginLeft:30,fontSize:25,color:success_green}}>
                            Advanced Settings
                        </Text>
                    </View>
                </TouchableOpacity>
            )            
        }else{
            return(
                <TouchableOpacity style={{alignItems:"center",width:width}} onPress={() => Alert.alert("Device not found","The device can not be found Via Bluetooth. Please make sure the device is powered on and within Bluetooth range.")}>
                    <View style={{borderWidth:2,borderColor:hvac_red,flexDirection:"row",width:width-30,borderRadius:40,height:70,alignItems:"center"}}>
                        <Image source={require("../images/power_offline/power_offline.png")} style={{marginLeft:5}}/>
                        <Text style={{marginLeft:30,fontSize:25,color:hvac_red}}>
                            Advanced Settings
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }


    renderNoInternetConnection(){
        if(this.props.show_no_internet_connection){
            return(
                <View style={{width:width,alignItems:"center"}}>
                    <View style={{alignItems:"center",justifyContent:"center",height:height - 400,backgroundColor:"white",marginTop:80,width:width - 80,borderRadius:20,borderWidth:1}}>
                        <Text style={{color:"black",fontSize:20}}>
                            No internet connection.
                        </Text>
                        <View style={{marginTop:20}}>
                            {exclamationTriangle}
                        </View>
                    </View>
                </View>
            )
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
				<ScrollView style={{height:height}}>
                    <View style={{height:height-170}}>
                        {this.renderNoInternetConnection()}
                        {this.renderHeaderType()}
                        {this.renderDocumentationInfo()}
                        {this.renderVideoInfo()}
                    </View>
                    <View>
                        {this.renderAdvancedSettings()}
                    </View>

				</ScrollView>
	  		</Background>
        );
    }
}

const mapStateToProps = state => ({
    central_device: state.scanCentralReducer.central_device,
    documentation_path: state.loginReducer.documentation_path,
    documentation_info : state.loginReducer.documentation_info,
    show_documentation_modal : state.loginReducer.show_documentation_modal,
    show_videos_modal : state.loginReducer.show_videos_modal,
    videos_info: state.loginReducer.videos_info,
    loaded_documentation_state: state.loginReducer.loaded_documentation_state,
    device_found: state.loginReducer.device_found,
    devices : state.pairReducer.devices,
    manager : state.scanCentralReducer.manager,
    device_scan_link : state.scanCentralReducer.device_scan_link,
    system_hardware_type: state.loginReducer.system_hardware_type,
    show_no_internet_connection: state.loginReducer.show_no_internet_connection
});

export default connect(mapStateToProps)(Documentation);