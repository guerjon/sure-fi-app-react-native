import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TextInput,
  	TouchableHighlight,
  	FlatList,
  	Alert
} from 'react-native'
import {styles,first_color,width,option_blue} from './styles/index.js'
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { 
	LOADING,
	COMMAND,
	NOTIFICATION,
	CONNECTED,
	DISCONNECTED,
	ERROR,
	LOOKED
} from './constants'

import Background from './helpers/background'
const searchIcon = (<Icon name="search" size={30} color="black" />)

class BluetoothDebugLog extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true,
    }

    static navigatorButtons = {
	 fab: {
	    collapsedId: 'search',
	    collapsedIcon: require('./images/search.png'),
	    expendedId: 'clear',
	    expendedIcon: require('./images/search.png'),
	    backgroundColor: option_blue,
	    actions: [
		    {
		    	id : 'clear',
		    	icon : require('./images/remove_filters.png'), 
		    	backgroundColor: "white"
		    },
	      	{
		        id: 'command',
		        icon: require('./images/log_in.imageset/log_in.png'),
		        backgroundColor: 'white'
	      	},
	      	{
		        id: 'notification',
		        icon: require('./images/log_out.imageset/log_out.png'),
		        backgroundColor: 'white'
	      	},
	      	{
		        id: 'connected',
		        icon: require('./images/log_connect.imageset/log_connect.png'),
		        backgroundColor: 'white'
	      	},
	      	{
		        id: 'disconnected',
		        icon: require('./images/log_disconnect.imageset/log_disconnect.png'),
		        backgroundColor: 'white'
	      	},
	      	{
		        id: 'looked',
		        icon: require('./images/bluetooth-icon.png'),
		        backgroundColor: 'white'
	      	}	      	
	    ]
	  }	
	};



    constructor(props) {
      super(props);
      this.commands = props.commands
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event){
    	var commands = this.props.commands
		switch(event.id){
			case "clear":
				var new_commands = commands
				this.props.dispatch({type:"UPDATE_INNER_COMMANDS",inner_commands: new_commands})
			break
			case "command":
				var new_commands = this.filter(commands,COMMAND)
				this.props.dispatch({type:"UPDATE_INNER_COMMANDS",inner_commands: new_commands})
			break
			case "notification":
				var new_commands = this.filter(commands,NOTIFICATION)
				this.props.dispatch({type:"UPDATE_INNER_COMMANDS",inner_commands: new_commands})
			break
			case "connected":
				var new_commands = this.filter(commands,CONNECTED)
				this.props.dispatch({type:"UPDATE_INNER_COMMANDS",inner_commands: new_commands})
			break
			case "disconnected":
				var new_commands = this.filter(commands,DISCONNECTED)
				this.props.dispatch({type:"UPDATE_INNER_COMMANDS",inner_commands: new_commands})
			break
			case "looked":
				var new_commands = this.filter(commands,LOOKED)
				this.props.dispatch({type:"UPDATE_INNER_COMMANDS",inner_commands: new_commands})
			break			
			default:
				
			break
		}   
    }

    
    filter(data,type){
    	console.log("filter",type)
    	var new_commands = []
    	var send_notification = false
    	if(data){
    		if(data.length > 0){
    			data.map(command => {
    				console.log('command type:'+ command.type +' type: ' + type)
    				if(command.type == type){
    					new_commands.push(command)
    				}
    			})
    			var send_notification = true
    		}else{
    			console.log("The array is empty")
    		}
    	}else{
    		console.log("The array doesn't exits filter(data,type)")
    		
    	}
    	if(new_commands.length == 0 && send_notification)
    		Alert.alert("No results found.")

    	return new_commands
    }


    selectImage(type){
		switch(type){
			case COMMAND:
				var image_source = require("./images/log_in.imageset/log_in.png")
			break
			case NOTIFICATION:
				var image_source = require("./images/log_out.imageset/log_out.png")
			break
			case CONNECTED:
				var image_source = require("./images/log_connect.imageset/log_connect.png")
			break
			case DISCONNECTED:
				var image_source = require("./images/log_disconnect.imageset/log_disconnect.png")
			break
			case LOOKED:
				var image_source = require("./images/bluetooth-icon.png")
			break
			default:
				var image_source = require("./images/bluetooth-icon.png")
			break
		}

		return (
			<Image 
				source={image_source}
				style={{width:30,height:30}}
			/>    					
		)

    }

    checkHex(value){
    	if(value.length == 1)
    		return "0" + value
    	else 
    		return value
    }

    formatHex(value){
    	return "0x" + value
    }

    renderCommand(command){
    	
    	var value = parseInt(command.value).toString(16).toUpperCase()
    	var current_date = new Date()
    	var time = command.time
    	var diff_time = (time - current_date) * -1
    	var image = this.selectImage(command.type)
    	var data = ""
    	value = this.checkHex(value)

    	if(value == "A1" || value == "A2" || value == "A3" || "A4")
    		value = ""
    	else
    		value = this.formatHex(value) 

    	if(command.data.length > 0){
    		var data = command.data
    		var new_data = [] 
    		data.map(old_command => {
    			let value_1 = old_command.toString(16).toUpperCase()
    			value_1 = this.checkHex(value_1)
    			value_1 = this.formatHex(value_1) 
    			new_data.push(value_1)
    		})

    		data = "Data: " + "[" + new_data + "]"
    	}

    	return (
    		<View style={{width:width,backgroundColor:"white",borderBottomWidth:0.5}}>
    			<View style={{flexDirection:"row",paddingTop:10}}>
    				<View style={{width:40,alignItems:"center",justifyContent:"center"}}>
						{image}
    				</View>
					<View>
	    				<View style={{width:width-90,flexDirection:"row"}}>
	    					<Text style={{color:"red",marginRight:10}}>
	    						{value}
	    					</Text>
		    				<Text style={{color:command.getColor()}}>
		    					 {command.getTypeString()} - {command.getName()}-
		    				</Text>
	    				</View>
						<View style={{width:width-90}}>
							<Text style={{fontSize:12,color:"gray"}}>
								{data}
							</Text>    				
						</View>
					</View>
					<View style={{width:40}}>
						<Text style={{fontSize:10}}>
							{diff_time}
						</Text>
					</View>
				</View>
			</View>    		
    	)
    }
    
	render(){	
/*

						<View style={{flexDirection:"row",alignItems:"center"}}>
							<View style={{width:width-70,height:40,backgroundColor:"white",margin:10,borderWidth:1,borderRadius:10}}>
								<View style={{alignItems:"center",height:40,width:80}}>
									<TextInput 
										maxLength={4}
										style={{flex:1,justifyContent:"center",fontSize:25,width:80}} 
										keyboardType="numeric" 
										underlineColorAndroid="transparent" 
										onChangeText={(t) => this.handleNumberChange(t)}
									/>
								</View>
							</View>
							<TouchableHighlight style={{width:50}}>
								{searchIcon}
							</TouchableHighlight>							
						</View>
*/
		return(
			<View style={{flex:1}}>
				<Background>
					<View >

						<View>
							<FlatList data={this.props.inner_commands.length > 0 ? this.props.inner_commands : this.props.commands} renderItem={({item}) => this.renderCommand (item)} keyExtractor={(item,index) => item.id } />	
						</View>
					</View>
				</Background>
			</View>
		);	
	}
}

const mapStateToProps = state => ({
	commands : state.bluetoothDebugLog.commands,
	inner_commands : state.bluetoothDebugLog.inner_commands
});

export default connect(mapStateToProps)(BluetoothDebugLog);

