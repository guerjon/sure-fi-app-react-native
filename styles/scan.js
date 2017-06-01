import {StyleSheet,Dimensions} from 'react-native'

var {width, height} = Dimensions.get('window');


export const scan_styles = StyleSheet.create({
	button: {
	    flexDirection: 'row',
	    justifyContent: 'center',
	    alignItems: 'center',
	    backgroundColor: 'pink',
	    borderRadius: 3,
	    padding: 32,
	    width: 100,
	    marginTop: 64,
	    marginBottom: 64,
  	},
	centerText: {
		flex: 1,
		fontSize: 18,
		padding: 32,
		color: '#777',
	},

	textBold: {
		fontWeight: '500',
		color: '#000',
	},

	buttonText: {
		fontSize: 21,
		color: 'rgb(0,122,255)',
	},

	buttonTouchable: {
		padding: 16,
	}
})