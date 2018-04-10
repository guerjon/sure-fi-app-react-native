
import {NOTIFICATION,COMMAND,ERROR,LOOKED,CONNECTED,DISCONNECTED} from './constants'
import {COMMANDS,RESPONSES,ERRORS,ACTIONS} from "./commands"

var map_commands = new Map(COMMANDS)
var map_response = new Map(RESPONSES)
var map_actions = new Map(ACTIONS)
export default class Command{ 

	constructor(id,value,type,data,bridge_name,action) {
		this.id = id
	  	this.value = value
	  	this.bridge_name = bridge_name
	  	this.type = type
	  	this.action = action
	  	this.time = new Date()
	  	this.data = data
	}

	getName(){
		var value = this.value
		var type = this.type

		switch(type){
			case COMMAND:
				return this.searchName(value,map_commands)
			case NOTIFICATION:
				return this.searchName(value,map_response)
			case CONNECTED:
				return this.searchName(value,map_actions) + "-" + this.bridge_name
			case DISCONNECTED:
				return this.searchName(value,map_actions) + "-" + this.bridge_name
			case LOOKED:
				if(this.value == 0xA4){
					return this.bridge_name	
				}else{
					return this.searchName(value,map_actions) + "-" + this.bridge_name
				}
				
			default:
				return "UNDEFINED"
		}
	}

	searchName(value,map_array){
		var result = map_array.get(value)
		if(result){
			return result
		}else{
			return "UNDEFINED"
		}
	}

	getJson(){
		return {
			value: this.value,
			name : this.name,
			type: this.type,
			action : this.action,
			date: this.time.getTime()
		}
	}


	getColor(){
		switch(this.type){
			case COMMAND:
				return "orange"
			case NOTIFICATION:
				return "purple"
			case CONNECTED:
				return "green"
			case DISCONNECTED:
				return "#a52727"
			case LOOKED:
				return "blue"
			default:
			return "black"
		}
	}

	getTypeString(){
		switch(this.type){
			case COMMAND:
				return "WRITE"
			case NOTIFICATION:
				return "READ"
			case CONNECTED:
				return "CONNECTED"
			case DISCONNECTED:
				return "DISCONNECTED"
			case LOOKED:
				return "SCANNED"
			default:
			return "black"
		}
	}

	getBackgroundColor(){
		switch(this.action){
			case "single_command":
				return "#F2D7D5" 
			case "app_firmware_update":
				return "#EBDEF0"
			case "radio_firmware_update":
				return "#D4E6F1"
			case "bluetooth_firmware_update":
				return "#D1F2EB"
			case "pairing":
				return "#FDEBD0"
			case "configuration_radio":
				return "#FDEBD0"
			default:
				return "#FBFCFC"
			
		}
	}
}