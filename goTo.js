export default class GoTo{

	static	goToDebugLog(navigator){
		navigator.push(
			{
				screen:"BluetoothDebugLog",
				title: "Bluetooth Debug Log",
			}
		)
	}

	static goToVideos(navigator){
		navigator.push({
			screen : "Videos",
			title : "Instruction Videos",
			animated: false,
			animationType: 'slide-up'
		})		
	}
}