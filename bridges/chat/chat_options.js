import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	StyleSheet,
  	Dimensions,
  	Button,
  	TouchableHighlight,
} from 'react-native'
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { 
	LOADING,
} from '../../constants'

const option_blue = "#5AB0E3"

var modal_width = Dimensions.get('window').width * 0.8



class ChatOptions extends Component{
	
  render() {
	    return (
	      	<View style={styles.container}>
	        	<TouchableHighlight
	        		onPress={() => this.props.sendLocation()}
	        		style={{backgroundColor:"white",height:50,borderTopRightRadius:10, borderTopLeftRadius: 10}} 
	        	>
	        		<View style={{flexDirection:"row",padding:10,width: modal_width,alignItems:"center",justifyContent:"center"}}>
		        		<View style={{flex:0.3,justifyContent:"flex-end"}}>
		        			<Icon  name="map-marker" size={32}/> 
		        		</View>
		        		<View style={{flex:0.6,justifyContent:"flex-start"}}>
			        		<Text style={{fontSize:20}}>
			        			Send Location
			        		</Text>
		        		</View>
	        		</View>
	        	</TouchableHighlight>
	        	<TouchableHighlight
	        		onPress={() => this.props.sendPing()}
	        		style={{backgroundColor:"white",height:50}} 
	        	>
	        		<View style={{flexDirection:"row",padding:10,width: modal_width,alignItems:"center",justifyContent:"center"}}>
		        		<View style={{flex:0.3,justifyContent:"center"}}>
		        			<Icon  name="thumb-tack" size={32}/> 
		        		</View>
		        		<View style={{flex:0.6,justifyContent:"center"}}>
			        		<Text style={{fontSize:20}}>
			        			Send Ping
			        		</Text>
		        		</View>
	        		</View>
	        	</TouchableHighlight>	        	
	        	<TouchableHighlight
	        		onPress={() => this.props.closeModal()}
	        		style={{backgroundColor:"white",height:50,borderBottomRightRadius:10, borderBottomLeftRadius: 10}} 
	        	>
	        		<View style={{flexDirection:"row",padding:10,width: modal_width,alignItems:"center",justifyContent:"center"}}>
		        		<Text style={{fontSize:20,color:option_blue}}>
		        			Cancel
		        		</Text>
	        		</View>
	        	</TouchableHighlight>
	         
	      	</View>
	    );
	}
}

const styles = StyleSheet.create({
  container: {
    width: modal_width,
    borderTopRightRadius:10,
    borderTopLeftRadius: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    marginTop: 8,
  },
});

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(ChatOptions);
