import {StyleSheet,Dimensions} from 'react-native'


export const width = Dimensions.get('window').width;
export const height = Dimensions.get('window').height;

const margin = 20
const title_margin  = 15
export const success_green = "#00DD00"
const small_font_size = 12
const medium_font_size = 18
const cancel_red = "red"
export const first_color = "#2a323d"
export const red_error = "#FF0000"
export const option_blue = "#5AB0E3"
export const link_color  = "#000099" 


export  const styles = StyleSheet.create({
  	mainContainer: {
      marginVertical:30,
      flex:1
    },
    container: {
		  flex:1
  	},
  	image_container:{
      flex:1,
      width:null,
      height:null
  	},
    image_complete_container:{
      
      height:height,
      width:width,
    },
  	circleContainer:{
  		width: width,
  		height: 100,
  		alignItems:"center",
  		top:-910
  	},
  	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
  	},
  	
  	coverflow: {
  		width: width,
  		height: width + 40,
  	},
  	launchImage:{
  		width: 1000,
    	height: 1000,
    	borderRadius: 500,
  		alignItems:"center",
  		justifyContent:"flex-end",
  		backgroundColor: first_color
  	},
    textViewContainer: {
      height:width + 250,
      alignItems:"center",
      justifyContent:"center"
    },
  	textView:{ 
      marginTop:0,
  		alignItems:"center",
      justifyContent:"center",
      width:200
  	},
  	text:{		
  		fontSize: 25,
      alignItems:"center"
  	},
    bridgeContainer:{
      flex:1
    },
    bridgeImageContainer:{
      width:width,
      marginVertical:25,
    },
    bridgeImage:{
      height:height/4,
      width:width/2,
      
    },
    imageBridgesContainer : {
      alignItems : "center"
    },
    textBridgesContainer : {
      alignItems : "center"
    },
    bridgeText:{
      fontSize:18
    },
    touchableSectionContainer:{
      backgroundColor:"white",
      width:width,
      alignItems:"center",
      borderBottomWidth: 0.2,
      borderBottomColor: "gray",

    },
    pairSectionsContainer:{
      marginVertical:5,
    },
    touchableSection:{
      width:width,
      
    },
    touchableSectionInner:{
      flexDirection:"row",
      alignItems:"center",
      margin:20
    },
    touchableSectionInnerImage:{
      height: 60,
      width: width/5,
    },
    touchableSectionInnerText:{
      fontSize:medium_font_size
    },
    titleContainer:{
       margin:  title_margin
    },
    title:{
      fontSize: 18,
    },
    miniTitle:{
      fontSize: 14
    },
    bigTitle:{
      fontSize: 22
    },
    preview: {
      width:width-40,
      height: width-40,
      zIndex:54
    },
    preview_remote : {
      justifyContent: 'flex-end',
      alignItems: 'center',
      width:100,
      height: 100,
      marginHorizontal: 20,
    },
    bigButtonContainer:{
      alignItems:"center",
      justifyContent: "center",      
      flexDirection: "row",
      margin:20
    },
    bigGreenButton:{
      backgroundColor: success_green,
      marginHorizontal:10,
      padding: 20,
      borderRadius: 10
    },
    bigRedButton:{
      backgroundColor: cancel_red,
      marginHorizontal:10,
      padding: 20
    },    
    bigGreenButtonText:{
      color: "white",
      fontSize:medium_font_size
    },
    greenButton: {
      backgroundColor: success_green,
      marginHorizontal:10,
      padding: 10,
      borderRadius: 10

    },
    greenButtonText:{
      color: "white",
      fontSize:small_font_size      
    },
    rowContainer:{
      marginVertical: 10
    },
    rowContainerContainer:{
      backgroundColor: "white",
      marginVertical: 10,

    },
    simpleRow: {
      borderBottomWidth: 0.5,
      flexDirection: "row",
      
    },
    simpleRowText:{
      fontSize: 18,
      padding: 10
    }, 
    white_row : {
      padding: 15,
      borderBottomWidth: 0.2,
    },
    white_row_text: {
      fontSize: 18,
    },
    link : {
      color: "#000099"
    },
    white_touchable_highlight: {
      backgroundColor:"white",
      flexDirection:"column",
     
    },
    white_touchable_highlight_inner_container: {
      flexDirection:"row",
      padding:5,
      alignItems:"center",
     
    },
    white_touchable_highlight_image_container: {
      flex:0.5
    },
    white_touchable_highlight_image: {
      width:60,
      height:60,
      marginLeft:20
    },
    white_touchable_text_container:{
      flex:1,
      alignItems:"flex-start"
    },
    white_touchable_text: {
      fontSize: 25,
      color:"black"
    },
    device_control_title_container : {
      alignItems:"center"
    },
    device_control_title: {
      fontFamily: 'Roboto',
      margin:10,
      color:"gray",
      fontSize: 18,
      fontWeight: "400"
    },
    tab: {
      borderRadius:10,
      borderWidth: 0.3,
      backgroundColor:"white",
      flex:0.3,
      padding:10,
      marginVertical:10,
      marginHorizontal:5,
      alignItems:"center",
      justifyContent:"center",
      
    },
    row_style: {
      backgroundColor:"white",
      paddingVertical:5,
      flexDirection:"row",
      alignItems:"center",
      justifyContent:"center"
    },
    row_normal_style:{
      backgroundColor:"white",
      paddingVertical:5,
      flexDirection:"row",
      alignItems:"center",
      
    },
    row_style_without_padding:{
      backgroundColor:"white",
      flexDirection:"row",
      alignItems:"center",
      justifyContent:"center"
    },
    relay_option: {
      flexDirection:"row",
      padding:10,
      marginLeft:20,
      borderBottomWidth: 0.2,
      borderBottomColor: "gray",
      alignItems:"center",

    }
});

