import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	NativeModules,
  	NativeEventEmitter,
  	ActivityIndicator,
  	TouchableHighlight,
  	Alert,
  	BackHandler
} from 'react-native'
import {styles,first_color,height,width,success_green,option_blue} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	GET_HEADERS,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	FIND_PROGRAMING_NUMBER,
	DEC2HEX,
	CRC16,
	HEX_TO_BYTES
} from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome';
import SelectFirmwareCentral from './bridges_configuration/select_firmware_central'
import RNFetchBlob from 'react-native-fetch-blob'
import ProgressBar from 'react-native-progress/Bar';
import {
    NavigationActions
} from 'react-navigation'

import {
	WRITE_COMMAND
} from '../action_creators'


var rows_to_write = 0
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class RadioFirmwareUpdate extends Component{
	
	constructor(props) {
		super(props);
		this.device = this.props.device
		this.row_number = [0,0]
		this.current_row = {}
		this.write_status = 0
		this.firmware_file = props.firmwareFile
		console.log("firmware_file",props.firmwareFile);
		this.view_kind = props.viewKind
		this.handleCharacteristicRadioNotification = this.handleCharacteristicRadioNotification.bind(this);
	}	

	componentWillMount() {
		this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleCharacteristicRadioNotification );
	}

	componentWillUnmount() {
		this.handlerUpdate.remove()
	}	

	componentDidMount() {
		if(this.view_kind == "normal")
			this.fetchFirmwareUpdate(this.firmware_file)
	}

	fetchFirmwareUpdate(path){
		console.log("fetchFirmwareUpdate",path);
		var {dispatch} = this.props		

		//this.props.dispatch({type: "RESET_FIRMWARE_UPDATE_REDUCER"})
		//this.props.dispatch({type: "RESET_FIRMWARE_CENTRAL_REDUCER"})

		if(path){
			
			RNFetchBlob.fetch('GET', path,GET_HEADERS)
			.then((res) => {
				
			  	var byteCharacters = res.text()
			  	var byteArrays = [];
			  	var sliceSize = 2048
			  	
				for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				    const slice = byteCharacters.slice(offset, offset + sliceSize);
				    
				    const byteNumbers = new Array(slice.length);
				    for (let i = 0; i < slice.length; i++) {
				      byteNumbers[i] = slice.charCodeAt(i);
				    }
				    
				    byteArrays.push(byteNumbers);

				}	
				this.bytes_file = byteArrays;
				this.requestBootloaderInfo()
		  	})
		 	.catch((errorMessage, statusCode) => {
			    //console.log("ERROR",errorMessage)
			    //dispatch({"FIRMWARE_UPDATE_ERROR",error : })
			    // error handling 
		  	})
		}else{
			Alert.alert("File not found","The file firmware was not found.")
		}	
	}

	handleCharacteristicRadioNotification(data){
		
		var {dispatch} = this.props
		var response = data.value[0]

		

		switch(response){
			case 1:
				console.log("BleRsp_FirmwareVersion")
				return
			case 2:
				console.log("BleRsp_QosConfig")
				return
			case 0xA:
				console.log("BleRsp_UpdateStartSuccess")
				this.startRadioRow()
				return								
			case 0x0E: 
				console.log("BleRsp_PageSuccess")
				this.write_status = 0
				this.calculateProgress()
				if(this.new_rows.length > 0){
					
					this.processRadioRows()
				}else{
					
					this.write([0x11])	
				}
				return
			case 0x05:
				this.calculateProgress()
				this.writeRadioPiece()
				return
			case 0x0D: 
				this.interval = setInterval(() => this.writeAllStateCommand(),1000)
				return
			case 0x0B: 
				//console.log("BleRsp_BootloaderInfo")
				this.processRadioRows()
				return
			case 0x1F:
					console.log("0x1F",data)
					if(!data.value[1] && !data.value[2] && !data.value[3] && !data.value[4]){
						clearInterval(this.interval)
						if(this.props.viewKind == "normal"){
							this.props.startNextUpdate("radio")
						}else{
							this.props.closeModal()
							Alert.alert("Success","The radio was update successfully.")							
						}
					}
				return
			case 0x13:
				console.log(data)
				let radio_status = data.value[3]
				if(!radio_status){
					clearInterval(this.interval)
					this.props.startNextUpdate("radio")
				}
				return
			case 224:
				console.log("BleRsp_SecurityError")
				return
			case 225:
				console.log("BleRsp_StartUpdateError")
				return
			case 226:
				console.log("BleRsp_AlreadyStartedError")
				Alert.alert("Error","Disconnect and connect the bluetooth to continue.")
				return
			case 227:
				console.log("BleRsp_NotStartedError")
				return
			case 228: // 0xE4
				if(!this.error_handle){				
					console.log("BleRsp_InvalidNumBytesError")
					this.error_handle = true
					this.errorHandleRow()
				}else{
					Alert.alert("Error","Something was wrong with the firmware update.")
					this.props.dispatch({type: "RESET_FIRMWARE_UPDATE_REDUCER"})
					this.props.closeModal()
				}
				return
			case 229:
				console.log("BleRsp_PageFailure")

				return
			case 230:
				Alert.alert("Error","Something was wrong on the firmware update.")
				console.log("BleRsp_ImageCrcFailureError") //BleRsp_ImageCrcFailureError
				return
			case 0xE9:
				if(data.value[1] == 0x1D){
					clearInterval(this.interval)
					this.interval = setInterval(() => WRITE_COMMAND(this.device.id,[0x2E]),1000) 

				}else{				
					
					Alert.alert("Error","Error on firmware update")
					this.props.dispatch({type: "RESET_FIRMWARE_UPDATE_REDUCER"})
					this.props.closeModal()

				}
				return
			default:
				console.log("No " + response + " option found")
			return
		}		
	}

	writeAllStateCommand(){
		this.write([0x1D])
	}

	requestBootloaderInfo(){
		console.log("requestBootloaderInfo()")
		this.write([0x0D]) //should return a 0xA on handleCharacteristicNotification
		this.props.dispatch({type: "START_UPDATE"})
	}

	startRadioRow(){
		console.log("startRadioRow()")
		var {dispatch} = this.props
		
		if(this.bytes_file){
			let rows = this.bytes_file 

			new_rows = []
			rows.map(row => {
				new_rows.push(this.cutRadioRowToPages(row))
			})  // each piece on the byte file its push on an array called new_rows to easy handle

			this.new_rows = new_rows //now we have the rows ready for start
			rows_to_write = this.new_rows.length 
			this.processRadioRows()
		}else{
			console.log("There are not bytes_file")	
		}
	}

	/**
		To run this function startRadioRow must be called before 
	*/
	processRadioRows(){
		//console.log("processRadioRows()")
		if(this.new_rows){
			if(this.new_rows.length > 0){
				this.new_current_row = this.new_rows.shift()
				this.processRadioRow(this.new_current_row) //solo pasamos la primer row de new_rows donde estan todos a processRow	
			}else{
				
				this.new_rows = null;
				this.write([0x11]) //finish the rows sending should return 0x0D or 13
			}
		}else{
			
			console.log("there is not rows array on processRows")
		}
	}


	processRadioRow(row){ // init the radio row
		this.current_row = row.row
		this.write(
			[
				0x0E, //you should expect a 0x05 if all its ok
				row.number.first,
				row.number.second,
				row.crc.first,
				row.crc.second,
				row.row_length.first,
				row.row_length.second
			]
		)
	}

	writeRadioPiece(){
		var sum = 0
		var command = [0x0F]
		while(this.current_row.length > 0){
			let page = this.current_row.splice(0,19)
			data = command.concat(page)
			
			this.writeWithoutResponse(data) // no response to this command
		}
		this.write([0x10])  // you should wait a 11 if all is ok 	
	}

	errorHandleRow(){
		this.processRadioRow(this.new_current_row)
	}

	cutRadioRowToPages(row){
		var {dispatch,row_number} = this.props
		var row_number = this.row_number
		var first_number = row_number[0]
		var second_number = row_number[1]
		var hex_lenght = DEC2HEX(row.length)
		var byte_lenght = HEX_TO_BYTES(DEC2HEX(row.length))
		var row_length = byte_lenght
		let curt_pages = []
		let crc = HEX_TO_BYTES(DEC2HEX(CRC16(row)))

		var json = 
			{
				command: 0x0E,
				crc : {
					first:  crc[0],
					second: crc[1]
				},
				number : {
					first :  first_number,
					second : second_number
				},
				row_length: {
					first : row_length[0],
					second: row_length[1] ? row_length[1] : 0
				},
				row: row
			}
		this.sumRow()
		return json
	}	

	write(data){
		let device = this.device;
		BleManagerModule.retrieveServices(device.id,() => {
			BleManagerModule.specialWrite(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,data,20)
		})
	}

	writeWithoutResponse(data){
		let device = this.device;
		BleManagerModule.specialWriteWithoutResponse(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,data,20,16)
	}

	calculateProgress(){
		var {dispatch} = this.props
		var columnas_restantes =  this.new_rows.length
		var columnas_totales = rows_to_write

		var restante = 1 - (columnas_restantes / columnas_totales);

		dispatch({type: "CHANGE_PROGRESS", new_progress: restante})
	}

	sumRow(){
		var row_number = this.row_number
		let first_num = row_number[0]
		let second_num = row_number[1]

		if(second_num >= 255){
			if(first_num >= 255){
			  console.log("error on firmwareReducer you can't sum anymore")
			}else{
			  first_num = first_num + 1 
			}
		}else{
			second_num = second_num + 1
		}
		this.row_number = [first_num,second_num]
	}	

	limitSize(n){
		if(n){
				let n_string = n.toString()
			if(n < 10){
				let short_string = n_string.substring(0,1)
				return short_string

			}else if (n == 100){
				let short_string = n_string.substring(0,3)
				return short_string
			}
			else{
				let short_string = n_string.substring(0,2)
				return short_string	
			}
		}
	}

	getStartRow(){
		var {progress,radio_version} = this.props
		
		if(progress > 0){
			console.log("progress",progress);
			let progress_number = this.limitSize(progress.toFixed(2) * 100) 

			var content = (
				<View style={{backgroundColor:"white",width:width,height:100,alignItems:"center"}}>
					<View style={{justifyContent:"space-between"}}>
						<View>
							<Text style={{fontSize:16,padding:10,textAlign:"center"}}>
								Updating Radio
							</Text>
						</View>
						<View style={{padding:10}}>
							<Text style={{textAlign:"center"}}>
								{progress_number} %
							</Text>
						</View>
					</View>
					<View style={{marginHorizontal:20}}> 	
						<ProgressBar progress={progress} width={width-60} height={5} borderRadius={5} color={option_blue}/>
					</View>
				</View>
			)
		}else{
			var content = (
				<ActivityIndicator />
			)
		}
		return(
			<View style={{padding:50}}>
				{content}
			</View>
		)
	}

	getAdvanceView(){
		return (
			<View>
				<Text style={{fontSize:18,color:"black",fontWeight:"900"}}>
					{this.props.app_version}
				</Text>				
				<View style={{height:100,width:width,marginVertical:5}}>
					<View style={{padding:10,backgroundColor:"white",marginHorizontal:15,borderRadius:10}}>
						<Text style={{color:"black",fontSize:18,marginBottom:10}}>
							Bootloader App Data
						</Text>
						<Text>
							Upper CRC: 0000|0000 Version: 00.00 Prgm:0000
						</Text>
						<Text>
							Lower CRC: 0000|0000 Version: 00.00 Prgm:0000
						</Text>
					</View>

				</View>	
				<View>	
					<SelectFirmwareCentral 
						device ={this.device}
						kind_firmware="radio" 
						fetchFirmwareUpdate={(file) => this.fetchFirmwareUpdate(file)}
						getStartRow={() => this.getStartRow()}
						firmware_files={this.props.firmware_files}
					/>
				</View>
			</View>
		)
	}

	render(){
		return(
			<View style={{flex:1}}>
				<View style={{alignItems:"center"}}>
					<View style={{height:400}}>
						{this.props.viewKind == "normal" ? this.getStartRow() : this.getAdvanceView()}
					</View>
				</View>
			</View>
		);
	}

}

const mapStateToProps = state => ({
	firmware_update_state: state.firmwareUpdateReducer.firmware_update_state,
    progress: state.firmwareUpdateReducer.progress,
	radio_version : state.setupCentralReducer.radio_version,
});

export default connect(mapStateToProps)(RadioFirmwareUpdate);
