import PropTypes from 'prop-types';
import React from 'react';
import {
    Linking,
    Platform,
    StyleSheet,
    TouchableOpacity,
    ViewPropTypes,
    View,
    Text
} from 'react-native';
import MapView from 'react-native-maps';

export default class CustomView extends React.Component {

	constructor(props){
		super(props)
		this.currentMessage = props.currentMessage

		this.latitude = props.currentMessage.location ?  props.currentMessage.location.latitude : null
		this.longitude = props.currentMessage.location ? props.currentMessage.location.longitude :null
	}

    getRegionForCoordinates(points) {
        // points should be an array of { latitude: X, longitude: Y }
        let minX, maxX, minY, maxY;

        // init first point

        minX = points[0].latitude;
        maxX = points[0].latitude;
        minY = points[0].longitude;
        maxY = points[0].longitude;

        // calculate rect
        points.map((point) => {
            minX = Math.min(minX, point.latitude);
            maxX = Math.max(maxX, point.latitude);
            minY = Math.min(minY, point.longitude);
            maxY = Math.max(maxY, point.longitude);
        });

        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;
        const deltaX = (maxX - minX);
        const deltaY = (maxY - minY);

        return {
            latitude: midX,
            longitude: midY,
            latitudeDelta: 0.07750209420919418,
            longitudeDelta: 0.10523534688960012
        };
    }

    renderReceivedPing() {
        return (
            <View>
				<Text style={{color:"green",padding:10}}>
				  Ping Received.
				</Text>
			</View>
        )
    }

    renderSendedPing() {
        return (
            <View>
				<Text style={{color:"white",padding:10}}>
				  Ping sended.
				</Text>
			</View>
        )
    }

    renderSendedLocation(){
    	return this.renderLocation("sended")
    }

    renderReceivedLocation(){
    	return this.renderLocation("received")
    }

    renderLocation(type) {
    	console.log("renderLocation()-CustomView")
        var region = this.getRegionForCoordinates([{
            latitude: this.latitude,
            longitude: this.longitude
        }])

        var data = [region,type]

        return (
            <TouchableOpacity style={[styles.container, this.props.containerStyle]} onPress={() => this.props.currentMessage.goToCustomMap(data)}>
				<MapView
					style={[styles.mapView, this.props.mapViewStyle]}
					region={region}
					scrollEnabled={false}
					zoomEnabled={false}
				>
					<MapView.Marker
					  coordinate={ {latitude : this.latitude, longitude: this.longitude }}
					  title="My position"
					/>          
	  			</MapView>
			</TouchableOpacity>
        );
    }


    render() {
        var type = this.props.currentMessage.type
        switch (type) {
            case "received_ping":
            	return this.renderReceivedPing()
            case "sended_ping":
            	return this.renderSendedPing()
            case "received_location":
            	return this.renderReceivedLocation()
            case "sended_location":
            	return this.renderSendedLocation()
            default:
            	return null
                break;
        }
    }
}

const styles = StyleSheet.create({
    container: {},
    mapView: {
        width: 150,
        height: 100,
        borderRadius: 1,
        margin: 3,
    },
});

CustomView.defaultProps = {
    currentMessage: {},
    containerStyle: {},
    mapViewStyle: {},
};

CustomView.propTypes = {
    currentMessage: PropTypes.object,
    containerStyle: ViewPropTypes.style,
    mapViewStyle: ViewPropTypes.style,
};


/*
			() => {
	  			Linking.canOpenURL(url).then(supported => {
					if (supported) {
			  			return Linking.openURL(url);
					}
	  			}).catch(err => {
					console.error('An error occurred', err);
	  			});
			}

*/