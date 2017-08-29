import React from 'react'
import { StyleSheet, View, Text, TextInput, Button, ListView, FlatList } from 'react-native'
import {MapView, Location, Permissions} from 'expo'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: '',
      results: [],
      title: '',
      currentLocation: {},
      directions: []
    }

    this.onChange = this.onChange.bind(this)
    this.resetTitle = this.resetTitle.bind(this)
    this.handleOnPress = this.handleOnPress.bind(this)
    this.renderResults = this.renderResults.bind(this)
    this.handleTextChange = this.handleTextChange.bind(this)
    this.onMarkerPress = this.onMarkerPress.bind(this)
    this.decode = this.decode.bind(this)
  }

  componentWillMount () {
    Permissions.askAsync(Permissions.LOCATION).then((res) => {
      Location.getCurrentPositionAsync().then((res) => {
        this.setState({
          currentLocation: res
        })
      })
    })
  }

  resetTitle () {
    this.setState = {title: ''}
  }

  handleOnPress (place) {
    return () => {
      fetch(`https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyA-lkF4xeNb7fY_pQTsFIApa6l0f-TZMQs&placeid=${place.place_id}`)
        .then((res) => {
          return res.json()
        }).then((res) => {
          const {lat, lng} = res.result.geometry.location
          const region = {latitude: lat, longitude: lng, latitudeDelta: 0.0043, longitudeDelta: 0.0034}
          this.map.animateToRegion(region)
          this.setState({
            value: '',
            results: [],
            title: res.result.formatted_address,
            latlng: {
              latitude: lat,
              longitude: lng
            },
            region
          })
        })
    };
  }

  handleTextChange (text) {
    this.setState({value: text})
  }

  onChange (text) {
    this.handleTextChange(text)
    fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyA-lkF4xeNb7fY_pQTsFIApa6l0f-TZMQs&input=${text}`)
      .then((res) => {
        return res.json()
      }).then((res) => {
        this.setState({
          results: res.predictions
        })
      })
  }

  renderResults () {
    return this.state.results.map((place, i) => {
      return (
        <Button
          title={place.description}
          key={`${place.description}${i}`}
          onPress={this.handleOnPress(place)}
          style={{width: '50%'}}
        />
      )
    })
  }

  onMarkerPress () {
    const {currentLocation, latlng} = this.state

    fetch(`https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyA-lkF4xeNb7fY_pQTsFIApa6l0f-TZMQs&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${latlng.latitude},${latlng.longitude}`)
      .then((res) => {
        return res.json()
      }).then((res) => {
        console.log(this.decode(res.routes[0].overview_polyline.points))
        this.setState({
          directions: this.decode(res.routes[0].overview_polyline.points)
        })
      })
  }

  decode (t,e){for(var n,o,u=0,l=0,r=0,d= [],h=0,i=0,a=null,c=Math.pow(10,e||5);u<t.length;){a=null,h=0,i=0;do a=t.charCodeAt(u++)-63,i|=(31&a)<<h,h+=5;while(a>=32);n=1&i?~(i>>1):i>>1,h=i=0;do a=t.charCodeAt(u++)-63,i|=(31&a)<<h,h+=5;while(a>=32);o=1&i?~(i>>1):i>>1,l+=n,r+=o,d.push([l/c,r/c])}return d=d.map(function(t){return{latitude:t[0],longitude:t[1]}})}

  render() {
    return (
      <View style={{ height: '100%'}}>
        <MapView
          ref={ref => {this.map = ref}}
          style={{height: '100%'}}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsPointsOfInterest={true}
        >
          { this.state.latlng && <MapView.Marker ref={ref => {this.marker = ref}} coordinate={this.state.latlng} title={this.state.title} onCalloutPress={this.onMarkerPress} /> }
          { this.state.directions.length !== 0 && <MapView.Polyline coordinates={this.state.directions} strokeWidth={4} /> }
          <View>
            <TextInput
              placeholder="Search"
              value={this.state.value}
              onChangeText={this.onChange}
              style={{marginLeft: '5%', marginRight: '5%', marginTop: '5%', backgroundColor: 'white', paddingLeft: '5%'}}
            />
            { this.state.results.length !== 0 && this.renderResults()}
          </View>
        </MapView>
      </View>
    )
  }
}

// https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyA-lkF4xeNb7fY_pQTsFIApa6l0f-TZMQs&origin=39.13941626560641,-84.49845029670372&destination=37.78825,-122.4324