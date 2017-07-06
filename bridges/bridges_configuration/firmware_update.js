import React, {Component} from 'react'
import {
	View,
	Text,
	Image,
	StyleSheets,
	ScrollView,
	TouchableHighlight,
	NativeEventEmitter,
	NativeModules,
	ActivityIndicator,
	Dimensions,
	Alert

} from 'react-native'
import {styles,success_green} from '../../styles/index.js'
import {
	GET_HEADERS,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	SUREFI_CMD_READ_UUID,
	UINT8TOSTRING,
	HEX_TO_BYTES,
	BYTES_TO_HEX
} from '../../constants.js'
import {connect} from 'react-redux'
import RNFetchBlob from 'react-native-fetch-blob'
import ProgressBar from 'react-native-progress/Bar';
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const window = Dimensions.get('window');

var rows_to_write = 0

class UpdateFirmwareCentral extends Component{

	static navigationOptions = {
		title : "Update Firmware"
	}

	componentDidMount() {
		
		bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',() =>  this.handleDisconnectedPeripheral() );
		if(this.props.kind_firmware == "application"){
			bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',(data) => this.handleCharacteristicNotification(data) );
		}else{
			bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',(data) => this.handleCharacteristicRadioNotification(data) );
		}
    	

		this.fetchFirmwareFile()
		this.row_number = [0,0]
		this.current_row = {}
		this.write_status = 0
		this.kind_firmware = this.props.kind_firmware;

	}

	startNotification(){
		var {central_device,dispatch} = this.props
		dispatch({type:"STARING_FIRMWARE_UPDATE"})
        BleManagerModule.retrieveServices(
        	central_device.id,
        	() => {
        		BleManagerModule.startNotification(
					central_device.id,
					SUREFI_CMD_SERVICE_UUID,
					SUREFI_CMD_READ_UUID,
					() => this.requestBootloaderInfo()	
				)
        	}
        )
	}

	temporalyConnect(){
		BleManagerModule.start({},start => {})
		var {central_device,dispatch} = this.props
	    dispatch({type: "LOADING"})
	    BleManagerModule.connect(central_device.id,() => this.startNotification())
	}

	handleCharacteristicNotification(data){
		var {dispatch} = this.props

		var response = data.value[0]

		switch(response){
			case 1:
				console.log("BleRsp_FirmwareVersion")
				return
			case 2:
				console.log("BleRsp_QosConfig")
				return
			case 3:
				console.log("BleRsp_UpdateStartSuccess")
				this.startRow()
				return								
			case 4: 
				console.log("BleRsp_PageSuccess")
				this.write_status = 0
				this.calculateProgress()
				if(this.new_rows.length > 0)
					this.processRows()
				else{
					this.write([7])
				}
				return
			case 5:
				console.log("BleRsp_GenericOk")
					this.writeFirstPiece()
				return
			case 6:
				console.log("BleRsp_UpdateFinishSuccess")
				return
			case 7:
				console.log("BleRsp_BootloaderInfo")
				this.findProgramingNumber(data)
				return	
			case 224:
				console.log("BleRsp_SecurityError")
				return
			case 225:
				console.log("BleRsp_StartUpdateError")
				return
			case 226:
				console.log("BleRsp_AlreadyStartedError")
				return
			case 227:
				console.log("BleRsp_NotStartedError")
				return
			case 228:
				console.log("BleRsp_InvalidNumBytesError")

				Alert.alert("Error","Error on firmware update")
				//this.errorProcessRows()
				return
			case 229:
				console.log("BleRsp_PageFailure")

				return
			case 230:
				console.log("BleRsp_ImageCrcFailureError")
				return
			default:
				console.log("No" + response + " option found")
			return
		}
	}




	handleCharacteristicRadioNotification(data){
		var {dispatch} = this.props
		var response = data.value[0]
		console.log("notification",data)
		switch(response){
			case 1:
				console.log("BleRsp_FirmwareVersion")
				return
			case 2:
				console.log("BleRsp_QosConfig")
				return
			case 0x0A:
				console.log("BleRsp_UpdateStartSuccess")
				this.startRadioRow()
				return								
			case 0x0E: 
				console.log("BleRsp_PageSuccess")
				this.write_status = 0
				this.calculateProgress()
				if(this.new_rows.length > 0)
					this.processRows()
				else{
					this.write([7])
				}
				return
			case 0x05:
				console.log("BleRsp_GenericOk")
				this.calculateProgress()
				this.writeRadioPiece()
				return
			case 0x10:
				console.log("BleRsp_UpdateFinishSuccess")
				
				return
			case 11: 
				console.log("BleRsp_BootloaderInfo")
				this.processRadioRows()
				return
			case 224:
				console.log("BleRsp_SecurityError")
				return
			case 225:
				console.log("BleRsp_StartUpdateError")
				return
			case 226:
				console.log("BleRsp_AlreadyStartedError")
				return
			case 227:
				console.log("BleRsp_NotStartedError")
				return
			case 228:
				console.log("BleRsp_InvalidNumBytesError")
				this.errorHandleRow()
				return
			case 229:
				console.log("BleRsp_PageFailure")

				return
			case 230:
				console.log("BleRsp_ImageCrcFailureError") //BleRsp_ImageCrcFailureError
				return
			default:
				console.log("No " + response + " option found")
			return
		}		
	}

	errorHandleRow(){
		this.processRadioRow(this.new_current_row)
	}

	startRadioRow(){
		var {dispatch} = this.props
		dispatch({type: "STAR_ROW"})

		if(this.bytes_file){
			let rows = this.bytes_file
			new_rows = []
			rows.map(row => {
				let pages = this.cutRadioRowToPages(row)
				new_rows.push(this.cutRadioRowToPages(row))						
			})  

			this.new_rows = new_rows
			rows_to_write = this.new_rows.length
			this.processRadioRows()
		}else{
			console.log("There are not bytes_file")	
		}
	}
					
				
	startRow(){
		console.log("startRow()")
		var {dispatch} = this.props
		dispatch({type: "STAR_ROW"})

		if(this.bytes_file){
			let rows = this.bytes_file
			new_rows = []
			rows.map(row => {
					let pages = this.cutRowToPages(row)
					new_rows.push(this.cutRowToPages(row))	
					
			})  

			this.new_rows = new_rows

			rows_to_write = this.new_rows.length
			
			this.processRows()
		}else{
			console.log("There are not bytes_file")	
		}
	}
	
	processRadioRows(){
		if(this.new_rows){
			if(this.new_rows.length > 0){
				this.new_current_row = this.new_rows.shift()
				this.processRadioRow(this.new_current_row) //solo pasamos la primer row de new_rows donde estan todos a processRow	
			}else{
				this.new_rows = null;
				console.log("write 0x11")
				this.write([0x11]) //finish the rows sending
			}
		}else{
			console.log("there is not rows array on processRows")
		}
	}

	processRows(){
		
		if(this.new_rows){
			if(this.new_rows.length > 0){
				this.new_current_row = this.new_rows.shift()
				this.processRow(this.new_current_row) //solo pasamos la primer row de new_rows donde estan todos a processRow	
			}else{
				
				this.new_rows = null;
				this.write([7]) //finish the rows sending
			}
		}else{
			console.log("there is not rows array on processRows")
		}
	}

	errorProcessRows(){
		if(this.new_rows){
			if(this.new_rows.length > 0){
				this.processRow(this.new_current_row) 
			}else{

				console.log("the new_rows varibale is empty")
				this.new_rows = null;
				this.write([7]) //finish the rows sending
			}
		}else{
			console.log("there is not rows array on processRows")
		}
	}

	processRow(row){
		this.current_row = row.row
		console.log("row.length",row.row_length)	

		this.write(
			[
				4,
				row.number.first,
				row.number.second,
				row.crc.first,
				row.crc.second,
				row.row_length.first,
				row.row_length.second
			]
		)
	}

	processRadioRow(row){ // init the radio row
		this.current_row = row.row
		console.log("row.length",row )

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

	writeFirstPiece(){
		var sum = 0
			var command = [5]
		
		while(this.current_row.length > 0){
			let page = this.current_row.splice(0,19)
			
			data = command.concat(page)
			this.writeWithoutResponse(data)
		}

		this.write([6])
		
	}

	writeRadioPiece(){
		console.log("writeRadioPiece()")
		var sum = 0
		var command = [0x0F]

		while(this.current_row.length > 0){
			let page = this.current_row.splice(0,19)	
			data = command.concat(page)
			console.log("Write 0x0f with data")
			this.writeWithoutResponse(data) // no response to this commando
		}
	
		this.write([0x10])  // you should wait a 11 if all is ok 

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

	calculateProgress(){
		var {dispatch} = this.props
		var columnas_restantes =  this.new_rows.length
		var columnas_totales = rows_to_write

		var restante = 1 - (columnas_restantes / columnas_totales);

		dispatch({type: "CHANGE_PROGRESS", new_progress: restante})
	}

	dec2hex(i)
	{
	  var result = "0000";
	  if      (i >= 0    && i <= 15)    { result = "000" + i.toString(16); }
	  else if (i >= 16   && i <= 255)   { result = "00"  + i.toString(16); }
	  else if (i >= 256  && i <= 4095)  { result = "0"   + i.toString(16); }
	  else if (i >= 4096 && i <= 65535) { result =         i.toString(16); }
	  return result
	}

	crc16(bytes){
		var crc = 0
		var k = 0
		var CRC_TABLE = [0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
             0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef]

		bytes.map(data_byte => {
			k = 0xFFFFFFFF & ((crc >> 12) ^ (data_byte >> 4))
	        crc = 0xFFFF & (CRC_TABLE[k & 0x0F] ^ (crc << 4))
	        k = 0xFFFFFFFF & ((crc >> 12) ^ (data_byte >> 0))
	        crc = 0xFFFF & (CRC_TABLE[k & 0x0F] ^ (crc << 4))
		})

		return crc & 0xFFFF
	}

	fiveCrc16(buf){
		var crc = typeof previous !== 'undefined' ? ~~previous : 0x0;

		for (var index = 0; index < buf.length; index++) {
			var byte = buf[index];
			var code = crc >>> 8 & 0xFF;

			code ^= byte & 0xFF;
			code ^= code >>> 4;
			crc = crc << 8 & 0xFFFF;
			crc ^= code;
			code = code << 5 & 0xFFFF;
			crc ^= code;
			code = code << 7 & 0xFFFF;
			crc ^= code;
		}

		return crc;		
	}

	cutRadioRowToPages(row){
		var {dispatch,row_number} = this.props
		var row_number = this.row_number
		var first_number = row_number[0]
		var second_number = row_number[1]
		var hex_lenght = this.dec2hex(row.length)
		var byte_lenght = HEX_TO_BYTES(this.dec2hex(row.length))
		var row_length = byte_lenght
		let curt_pages = []
		let crc = HEX_TO_BYTES(this.dec2hex(this.crc16(row)))

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

	cutRowToPages(row){

		var {dispatch,row_number} = this.props
		var row_number = this.row_number
		var first_number = row_number[0]
		var second_number = row_number[1]

		if(first_number == 0 && second_number == 0){
			row[3] = this.programNumber[0]
			row[2] = this.programNumber[1]
		}


		var hex_lenght = this.dec2hex(row.length)
		var byte_lenght = HEX_TO_BYTES(this.dec2hex(row.length))
		var row_length = byte_lenght
		let curt_pages = []
		let crc = HEX_TO_BYTES(this.dec2hex(this.crc16(row)))

		var json = 
			{
				command: 4,
				number : {
					first :  first_number,
					second : second_number
				},
				crc : {
					first:  crc[0],
					second: crc[1]
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


	writeWithoutResponse(data){
		var {central_device} = this.props
		
		BleManagerModule.specialWriteWithoutResponse(central_device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,data,20,4)		
	}

	handleDisconnectedPeripheral(evn){
		console.log("evn",evn)
	}

	write(data){
		var {central_device} = this.props

		BleManagerModule.retrieveServices(central_device.id,() => {
			BleManagerModule.specialWrite(central_device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,data,20)
		})
	}

	fetchFirmwareFile(){
		var {dispatch} = this.props

		dispatch({type:"START_FETCH"})
		
		var {firmware_file} = this.props

		let path = firmware_file.firmware_path
		
		// send http request in a new thread (using native code) 
		
		RNFetchBlob.fetch('GET', path,GET_HEADERS)
		.then((res) => {
		  	var byteCharacters = res.text()
		  	var byteArrays = [];
		  	var sliceSize = 2048
		  	//var command = 0x03
		  	
			for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			    const slice = byteCharacters.slice(offset, offset + sliceSize);
			    
			    const byteNumbers = new Array(slice.length);
			    for (let i = 0; i < slice.length; i++) {
			      byteNumbers[i] = slice.charCodeAt(i);
			    }
			    
			    byteArrays.push(byteNumbers);

			}	
			this.bytes_file = byteArrays;
			
			this.temporalyConnect()
		 	dispatch({type: "STARING_FIRMWARE_UPDATE"})
		  })
		 .catch((errorMessage, statusCode) => {
		    console.log("ERROR",errorMessage)
		    //dispatch({"FIRMWARE_UPDATE_ERROR",error : })
		    // error handling 
		  })
	}

	writeStartRadioUpdate(){
		let {central_device,dispatch} = this.props
		let callback = () => dispatch({type:"STARED_FIRMWARE_UPDATE"})
		if(this.new_rows.length > 0)
			this.processRadioRows()
		else{
			this.write([7])
		}
	}

	writeStartUpdate(){

		let {central_device,dispatch} = this.props
		let callback = () => dispatch({type:"STARED_FIRMWARE_UPDATE"})
		this.write([3])
		
	}

	requestBootloaderInfo(){
		console.log("requestBootloaderInfo()")
		if(this.props.kind_firmware == "application"){
			this.write([8])	
		}else{
			this.write([0x0D])
		}
		
	}

	uint8ToString(u8a){
	  var CHUNK_SZ = 0x8000;
	  var c = [];
	  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
	    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
	  }
	  return c.join("");
	}

	restarProcess(){
		var {central_device}  = this.props 
		if(central_device){
			if(central_device.id){
				BleManagerModule.disconnect(central_device.id,(callback) => console.log(callback))
			}else{
				console.log("central device id was not found on restarProcess")
			}
		}else{
			console.log("central device was not found on restarProcess")
		}
	}

	getStaringFirmwareUpdate(){
		return(
			<View>
				<Text>
					Starign firmware update
				</Text>
			</View>
		)
	}

	getStaredFirmwareUpdate(){
		return(
			<View>
				<Text>
					Stared firmware update
				</Text>
			</View>
		)
	}

	findProgramingNumber(data){
		var data = data.value
		
		var bootloader_info = BYTES_TO_HEX(data)
		bootloader_info = bootloader_info.substr(2,bootloader_info.length).toUpperCase()
		
		var lowerReadCrc            = bootloader_info.substr(0,4)
		var lowerCalculatedCrc      = bootloader_info.substr(4,4)
		var lowerVersionNumberMajor = bootloader_info.substr(8,2)
		var lowerVersionNumberMinor = bootloader_info.substr(10,2)
		var lowerProgramNumber      = bootloader_info.substr(12,4)
		var upperReadCrc            = bootloader_info.substr(16,4)
		var upperCalculatedCrc      = bootloader_info.substr(20,4)
		var upperVersionNumberMajor = bootloader_info.substr(24,2)
		var upperVersionNumberMinor = bootloader_info.substr(26,2)
		var upperProgramNumber      = bootloader_info.substr(28,4)
		var bootingUpperMemory      = bootloader_info.substr(32,2)

		if(lowerProgramNumber == "FFFF") {
		    lowerProgramNumber = "0000"
		}

		if( upperProgramNumber == "FFFF" ){
		    upperProgramNumber = "0000"
		}

		if( lowerReadCrc == lowerCalculatedCrc) {
		    lowerImageOK = true
		    lowerProgramNumber = this.incrementProgramNumber(lowerProgramNumber)
		}

		if (upperReadCrc == upperCalculatedCrc){
		    upperImageOK = true
		    upperProgramNumber = this.incrementProgramNumber(upperProgramNumber)
		}

		if( bootingUpperMemory == "00") {
			this.writeImageNumber(lowerProgramNumber)   
		}

		else if  (bootingUpperMemory == "01") {
			this.writeImageNumber(upperProgramNumber)
		}

		else {
			console.log("CRC ERROR","Error Updating Firmware. CRC Error on Bridge Device")
		    return
		}
	}

	longToByteArray (long) {
	    // we want to represent the input as a 8-bytes array
	    var byteArray = [0, 0];

	    for ( var index = byteArray.length -1; index >= 0; index -- ) {
	        var byte = long & 0xff;
	        byteArray [ index ] = byte;
	        long = (long - byte) / 256 ;
	    }

	    return byteArray;
	};

	/**
	* @program Number should be a string
	*/
	incrementProgramNumber(programNumber){
		programNumber = parseInt(programNumber, 10) + 1
		var byte_program_number = this.longToByteArray(programNumber)		
		return byte_program_number
	}

	writeImageNumber(programNumber){
		this.programNumber  = programNumber
		this.writeStartUpdate()
	}

	getStartRow(){
		var {progress} = this.props

		if(progress > 0){
			var content = (
				<View>
					<View style={{margin:20,flexDirection:"row"}}>
						<View style={{flex:1}}>
							<Text style={{fontSize:16}}>
								Updating
							</Text>
						</View>
						<View style={{flex: 1}}>
							<Text style={{alignSelf:"flex-end"}}>
								{progress.toFixed(2) * 100 } %
							</Text>
						</View>
					</View>
					
						<View>
							<View>
								<ProgressBar progress={progress} width={250} height={40}/>
							</View>

							{
								progress == 1 && (
									<View style={{alignItems:"center",marginTop:20}}>
										<Text style={{fontSize: 16,marginBottom:20}}>
											Success on updating !
										</Text>
										<TouchableHighlight onPress={() => this.props.navigation.goBack()} style={{backgroundColor:success_green,padding:20}}>
											<Text style={{color:"white",fontSize:16}}>
												Continue
											</Text>
										</TouchableHighlight>
									</View>
								)
								
								
							}
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

	render(){
		var {firmware_update_state} = this.props


		switch(firmware_update_state){
			case "fetch_stared":
				var content = <ActivityIndicator/>
			break
			case "staring":
				var content = this.getStaringFirmwareUpdate()
			break
			case "stared":
				var content = this.getStaredFirmwareUpdate()
			break
			case "start_row":
				var content = this.getStartRow()
			break
			default :
				var content = <View style={{flex:1,alignItems:"center",justifyContent:"center",flexDirection:"column"}}><ActivityIndicator/></View>
			break
		}

		return (
			<ScrollView style={styles.pairContainer}>
				<Image  
					source={require('../../images/temp_background.imageset/temp_background.png')} 
					style={styles.image_complete_container}
				>				
					<View style={{flex:1,alignItems:"center"}}>
						{content}
					</View>
				</Image>
			</ScrollView>			
		)

	}
}


const mapStateToProps = state => ({
	firmware_file : state.updateFirmwareCentralReducer.firmware_file,
	
	//central_device: state.scanCentralReducer.central_device,
	central_device : { 
    	new_representation: '01020C03FF0FF0FF1FF1',
		rssi: -63,
		name: 'Sure-Fi Brid',
		id: 'C1:BC:40:D9:93:B9',
		advertising: 
		{ CDVType: 'ArrayBuffer',
		data: 'AgEGDf///wECBgP/D/D/H/ENCFN1cmUtRmkgQnJpZBEHeM6DVxUtQyE2JcUOCgC/mAAAAAAAAAAAAAAAAAA=' },
		manufactured_data: 
		{ hardware_type: '01',
		firmware_version: '02',
		device_state: '0C03',
		device_id: 'FF0FF0',
		tx: 'FF1FF1',
		address: 'C1:BC:40:D9:93:B9',
		security_string: [ 178, 206, 206, 71, 196, 39, 44, 165, 158, 178, 226, 19, 111, 234, 113, 180 ] } 
    },
	firmware_update_state : state.firmwareUpdateReducer.firmware_update_state,
	progress : state.firmwareUpdateReducer.progress,
	kind_firmware : state.selectFirmwareCentralReducer.kind_firmware
});

export default connect(mapStateToProps)(UpdateFirmwareCentral)
