import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	ActivityIndicator,
  	NativeModules,
  	NativeEventEmitter
} from 'react-native'
import {styles,first_color} from '../styles/index.js'
import { connect } from 'react-redux';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

import BleManager from 'react-native-ble-manager'
import { 
	LOADING,
	IS_EMPTY,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID
} from '../constants'

import {IS_CONNECTED} from '../action_creators/'

class StatusBox extends Component{

	renderConnectingBox(){
		return (
			<View>
	            <View style={{flexDirection: "row",backgroundColor: "white"}}>
					<View style={{flexDirection:"row"}}>
						<Text style={{padding: 10,margin:5}}>
							Status
						</Text >
						<View style={{width:180}}>
							<Text style={{fontSize:15}}>
								Hold the Test button on the Bridge for 5 seconds
							</Text>
						</View>
					</View>
					<View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
						<ActivityIndicator />
					</View>							
				</View>
			</View>
		)
	}

	disconnect(){
		BleManager.disconnect(this.props.device.id)
		.then(response => {
			this.props.dispatch({
				type : "DISCONNECT_CENTRAL_DEVICE"
			})
		}).catch(error => console.log("error",error))
	}

	renderDisconnectingBox(){
		return (
			<View>
	            <View style={{flexDirection: "row",backgroundColor: "white"}}>
					<View style={{flexDirection:"row"}}>
						<Text style={{padding: 10,margin:5}}>
							Status
						</Text >
						<Text style={{color: "red",padding: 10,margin: 5}}>
							"Disconnected"
						</Text>
					</View>
					<View style={{flex:1}}>
						<TouchableHighlight 
							style={{backgroundColor:"#00DD00",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
							onPress={()=> this.tryToConnect(this.props.device)}
						>
							<Text style={styles.bigGreenButtonText}>
								Connect
							</Text>
						</TouchableHighlight>
					</View>							
				</View>
			</View>
		)
	}


    tryToConnect(device){
        var {
            navigation
        } = this.props;
        this.interval = setInterval(() => this.connect(device),3000);
    }

    connect(device) {
        var {
            dispatch
        } = this.props
        
        dispatch({
            type: "CONNECTING_CENTRAL_DEVICE"
        })
        
        IS_CONNECTED(device.id).then(response => {
        	console.log("response",response)
        	if(!response){
	            BleManager.connect(device.id)
	            	.then((peripheralInfo) => {
	                this.writeSecondService(device)
	            })
	            .catch((error) => {
	            	console.log("error",error)
	                //Alert.alert("Error",error)
	            });
        	}else{ //IF IS ALREADY CONNECTED
        		if(this.interval){
        			clearInterval(this.interval)
        			this.connected = true
        		}
        		this.props.dispatch({
        			type: "CONNECTED_CENTRAL_DEVICE"
        		})
        	}
        }).catch(error => console.log(error))
    }

    writeSecondService(device){       
        if(!this.connected){
            BleManagerModule.retrieveServices(device.id,() => {
                BleManager.write(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,device.manufactured_data.security_string,20).then((response) => {
       	
                    if(this.interval){
                        clearInterval(this.interval)
                        this.connected = true;
                    }
                    this.props.dispatch({
                        type: "CONNECTED_CENTRAL_DEVICE"
                    })

                }).catch(error => console.log("Error",error));
            })
        }
    }	

    renderStatusDevice(){
    	var {device_status,remote_devices,remote_device_status,device} = this.props

    	switch(device_status){
			case "connecting":
				return this.renderConnectingBox()
			case "disconnected":
	            return this.renderDisconnectingBox();
			case "connected":
 				return(
					<View>
						<View style={{backgroundColor:"white"}}>
				            <View style={{flexDirection: "row",margin:10}}>
								<View style={{flex:1,flexDirection:"row"}}>
									<Text style={{padding: 10,margin:5}}>
										Status
									</Text >
									<Text style={{color: "#00DD00",padding: 10,margin: 5}}> 
										Connected
									</Text>
								</View>
								<View style={{flex:1}}>
									<TouchableHighlight 
										style={{backgroundColor:"red",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
										onPress={() => this.disconnect()}
									>
										<Text style={styles.bigGreenButtonText}>
											Disconnect
										</Text>
									</TouchableHighlight>
								</View>
							</View>
						</View>
					</View>	            	
	            )
	        default:
	        	return <Text>Error</Text>
    	}
    }
	
	render(){	
		var {device} = this.props;
		
		if (!IS_EMPTY(device)) {
            return (
                <ScrollView style={styles.pairContainer}>
						<View style={styles.pairSectionsContainer}>
							<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Central Unit
								</Text>
							</View>
							<View style={styles.touchableSectionContainer}>
								<TouchableHighlight onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
									<View style={styles.touchableSectionInner}>
										<Image 
											source={require('../images/bridge_icon.imageset/bridge_icon.png')} 
											style={styles.touchableSectionInnerImage}
										>
										</Image>
										<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
											<Text >
												Sure-Fi Bridge Central
											</Text>
											<Text style={{fontSize:22}}>
												{device.manufactured_data ? (device.manufactured_data.device_id ? device.manufactured_data.device_id.toUpperCase() : ("UNKNOWN") ) : ("UNKNOWN") }
											</Text>

											<Text style={{fontSize:18}}>
												{this.props.device.manufactured_data.hardware_type == "01" ? "Central Unit" : "Remote Unit" } {this.props.device.manufactured_data.device_state == "1301" ? "Unpaired" : "Paired"}
											</Text>
										</View>
									</View>
								</TouchableHighlight>
							</View>					
							{this.renderStatusDevice()}
						</View>
				</ScrollView>
            );

        } else {
            return (
                <ScrollView style={styles.pairContainer}>
						<View style={styles.pairSectionsContainer}>
							<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Central Unit
								</Text>
							</View>
							<View style={styles.touchableSectionContainer}>
								<TouchableHighlight onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
									<View style={styles.touchableSectionInner}>
										<Image 
											source={require('../images/hardware_select.imageset/hardware_select.png')} 
											style={styles.touchableSectionInnerImage}
										>
										</Image>
										<Text style={styles.touchableSectionInnerText}>
											Select Central Unit
										</Text>
									</View>
								</TouchableHighlight>
							</View>
							{this.renderStatusDevice()}
						</View>
				</ScrollView>
            );
        }
	}
}




export default connect()(StatusBox);