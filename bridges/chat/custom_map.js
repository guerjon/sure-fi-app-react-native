import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	StyleSheet,
  	PermissionsAndroid,
  	ActivityIndicator
} from 'react-native'
import {styles,first_color,width,height} from '../../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	IS_EMPTY
} from '../../constants'
import Background from '../../helpers/background'
import MapView from 'react-native-maps';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	console.log(lat1,lon1,lat2,lon2);
  	var R = 6371; // Radius of the earth in km
  	var dLat = deg2rad(lat2-lat1);  // deg2rad below
  	var dLon = deg2rad(lon2-lon1); 
  	var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  	var d = R * c; // Distance in km
  	return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


class CustomMap extends Component{

	constructor(props) {
		super(props);
		console.log("props-Custom-Map",props);
		this.my_coordenates = props.my_coordenates
		this.other_guy_coordenates = props.other_guy_coordenates
	}	

    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }

    componentWillMount() {
    }

    getCurrentPosition(){
		navigator.geolocation.getCurrentPosition(
            (position) => {
            	this.my_latitude = position.coords.latitude  
            	this.my_longitude = position.coords.longitude
            	this.props.dispatch({type: "SHOW_CUSTOM_MAP"})
            },
            (error) => alert(error.message)
        )      	
    }

   	onRegionChange(region){
   		
   	}

   	renderMarker(latitude,longitude,title){
   		return (
			<MapView.Marker
			  coordinate={ {latitude : latitude, longitude: longitude }}
			  title={title}
			/>			   			
   		)
   	}

   	renderLength(){
   		if(!IS_EMPTY(this.other_guy_coordenates) && !IS_EMPTY(this.my_coordenates))
   			return (
		        <View style={{width:width,height:50,backgroundColor:"#E4E2E1",alignItems:"center",justifyContent:"center"}}>
		            <Text style={{padding:20}}>
		                {getDistanceFromLatLonInKm(
		                	this.other_guy_coordenates.latitude,
		                	this.other_guy_coordenates.longitude,
		                	this.my_coordenates.latitude,
		                	this.my_coordenates.longitude
		                )}
		            </Text>
		        </View>
   			)

   		return null
   	}

	render(){	

   		var title = "My Position"
   		var original_position = IS_EMPTY(this.my_coordenates) ? this.other_guy_coordenates : this.my_coordenates
   		var coordinates = []

   		if(!IS_EMPTY(this.my_coordenates)){
   			coordinates.push({
   				latitude: this.my_coordenates.latitude,
   				longitude : this.my_coordenates.longitude
   			})
   		}

   		if(!IS_EMPTY(this.other_guy_coordenates)){
   			coordinates.push({
   				latitude: this.other_guy_coordenates.latitude,
   				longitude: this.other_guy_coordenates.longitude
   			})
   		}

   		return(
			<View>
				{this.renderLength()}
				<MapView
					style={[map_styles.mapView]}
					region={{
						latitude : original_position.latitude,
						longitude : original_position.longitude,
						latitudeDelta : 0.0922,
						longitudeDelta : 0.09764849156142702
					}}
					onRegionChange={(region) => this.onRegionChange(region)}
					scrollEnabled={true}
					zoomEnabled={true}
				>
	
					{IS_EMPTY(this.my_coordenates) ?  null : this.renderMarker(this.my_coordenates.latitude,this.my_coordenates.longitude,"My position")}
					{IS_EMPTY(this.other_guy_coordenates) ? null : this.renderMarker(this.other_guy_coordenates.latitude,this.other_guy_coordenates.longitude,"Other guy position")}

		            <MapView.Polyline
		              coordinates={coordinates}
		              strokeColor="#000"
		              fillColor="rgba(255,0,0,0.5)"
		              strokeWidth={5}
		            />

	  			</MapView>			
			</View>
		); 
	}
}

const mapStateToProps = state => ({
	show_custom_map : state.chatReducer.show_custom_map,
	my_coordenates : state.chatReducer.my_coordenates,
	other_guy_coordenates : state.chatReducer.other_guy_coordenates
});

export default connect(mapStateToProps)(CustomMap);


const map_styles = StyleSheet.create({
    container: {},
    mapView: {
        width: width,
        height: height,
    },
});