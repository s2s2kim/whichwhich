import React, { Component } from 'react';
import redDot1 from '../red_dot.png';
import redDot2 from '../red_dot2.png';
import redDot3 from '../red_dot3.png';
import redDot4 from '../red_dot4.png';
import redDot5 from '../red_dot5.png';


const imageSize = new window.daum.maps.Size(18, 20);
const imageOption = { offset : new window.daum.maps.Point(15, 15)}

function getCoordsHash(coords) {
  return coords.ib * 3 + coords.jb * 1004;
}

function getMarkerImageSource(count) {
  if (count === 2) {
    return redDot2;
  } else if (count === 3) {
    return redDot3;
  } else if (count === 4) {
    return redDot4;
  } else {
    return redDot5;
  }
}

export default class WhichMap extends Component{
  constructor() {
    super();
    this.setMarker = this.setMarker.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
    this.searchAddress = this.searchAddress.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleDrawMarker = this.handleDrawMarker.bind(this);
    // this.handleDraw = this.handleDraw.bind(this);
    this.state = {
      el: '',
      daumMap: '',
      marker: '',
      geocoder: '',
      latitude: 0,
      longitude: 0,
      profileId: 0,
      address: '',
      date: '',
      info: '',
      markerImage: {}
    }
  }

  componentDidMount() {

    let el = document.getElementById('map');
    let daumMap = new window.daum.maps.Map(el, {
      center: new window.daum.maps.LatLng(37.52648259543062, 126.86435765802705),
      level: 6
    });

    // const imageSize = new window.daum.maps.Size(12, 13);
    // const imageOption = { offset : new window.daum.maps.Point(15, 15)}
    const markerImage = new window.daum.maps.MarkerImage(redDot1, imageSize, imageOption);

    console.log(markerImage, 'markerImage');

    let marker = new window.daum.maps.Marker({
      map: this.state.daumMap,
      position: daumMap.getCenter(),
      image: markerImage
    });

    let geocoder = new window.daum.maps.services.Geocoder();

    this.setState({
      el, daumMap, marker, geocoder, markerImage
    });

    marker.setMap(this.state.daumMap);
    window.daum.maps.event.addListener(daumMap, 'click', this.handleMapClick);
  }

  setMarker(locPosition) {
    const { marker } = this.state;
    
    marker.setMap(this.state.daumMap);
    marker.setPosition(locPosition);
  }

  handleMapClick(e) {
    console.log(e.latLng);
    this.setState({
      latitude: e.latLng.ib,
      longitude: e.latLng.jb
    });
    this.setMarker(e.latLng);
  }

  handleAddressChange(e) {
    this.setState({
      address: e.target.value
    })
  }

  handleSubmit(e) {
    e.preventDefault();
    const { date, latitude, longitude, profileId, address, info } = this.state;
    
    const url = `/api/report/missing-person/${profileId}`;
    
    fetch(url, {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        "witnessAddress" : address,
        "witnessedAt": date,
        "latitude": latitude, 
        "longitude": longitude,
        "description": info
      }),
    }).then(res => {
      if(res.status === 200) {
        window.location.href=`/person/${profileId}`;
      }
    });
  }

  handleInfoChange(e) {
    console.log(e.target.value);
    this.setState({
      info: e.target.value
    })
  }

  handleDateChange(e) {
    this.setState({
      date: e.target.value
    })
  }

  searchAddress(e) {
    e.preventDefault();
    const { daumMap } = this.state;
    const searchWord = document.getElementById('search_address').value;
    console.log(searchWord, 'searchWord');
    console.log(daumMap,'clicked');
    this.state.geocoder.addressSearch(searchWord, function(result, status) {
      if (status === window.daum.maps.services.Status.OK) {
        let coords = new window.daum.maps.LatLng(result[0].y, result[0].x);
        daumMap.setCenter(coords);
      }
    });
    
  }

  handleDrawMarker(e) {
    e.preventDefault();
    const { daumMap, info, geocoder, markerImage } = this.state;

    console.log(info);
    const addressList = info.split(',');
    console.log(addressList, 'addressList');
    const errorList = [];
    // console.log(markerImage, 'image');
    const history = new Array();
    var coordsMap = new Map();
    coordsMap.set('hello', 'bonjour');


    let processes = addressList.map((address) => {
      return new Promise((resolve) => {
        geocoder.addressSearch(address, function(result, status) {
          if (status === window.daum.maps.services.Status.OK) {
            let coords = new window.daum.maps.LatLng(result[0].y, result[0].x);
            if (history.includes(coords.ib)) {
              console.log('중복발견');
            }
            console.log(coords.ib, 'coords');
  
            let tmpMarker = {};
            // if (history.includes(getCoordsHash(coords))) {
            //   console.log("중복발견");
            //   const newMarkerImage = new window.daum.maps.MarkerImage(redDot2, imageSize, imageOption);
              
            //   tmpMarker = new window.daum.maps.Marker({
            //     position: coords,
            //     image: newMarkerImage
            //   });
            // } else {
            //   history.push(getCoordsHash(coords));
            //   tmpMarker = new window.daum.maps.Marker({
            //     position: coords,
            //     image: markerImage
            //   });
            // }

            if (coordsMap.get(getCoordsHash(coords)) !== undefined) {
              console.log("중복발견");

              var newCount = coordsMap.get(getCoordsHash(coords)) + 1;
              coordsMap.set(getCoordsHash(coords), newCount);
              const newMarkerImage = new window.daum.maps.MarkerImage(getMarkerImageSource(newCount), imageSize, imageOption);
              
              tmpMarker = new window.daum.maps.Marker({
                position: coords,
                image: newMarkerImage
              });
            } else {
              coordsMap.set(getCoordsHash(coords), 1);
              tmpMarker = new window.daum.maps.Marker({
                position: coords,
                image: markerImage
              });
            }
  
            tmpMarker.setMap(daumMap);
            resolve();
          } else {
            console.log(address, "실패");
            errorList.push(address);
            resolve();
          }
        });
      })
    });

    Promise.all(processes).then(() => {
      console.log(history, 'history');
      console.log(coordsMap, 'coordsMap');
    });

    // addressList.forEach(function(value, i) {
    //   geocoder.addressSearch(value, function(result, status) {
    //     if (status === window.daum.maps.services.Status.OK) {
    //       let coords = new window.daum.maps.LatLng(result[0].y, result[0].x);
    //       if (history.includes(coords.ib)) {
    //         console.log('중복발견');
    //       }
    //       console.log(coords.ib, 'coords' + i);

    //       // if (history.contains(coords.ib)) {
    //       //   console.log("중복발견");
    //       // }
    //       history.push(coords.ib);

    //       let tmpMarker = new window.daum.maps.Marker({
    //         position: coords,
    //         image: markerImage
    //       });
    //       tmpMarker.setMap(daumMap);
    //     } else {
    //       console.log(value, "실패" + i);
    //       errorList.push(value);
    //     }
    //   });
    // });

  }

  // handleDraw() {
  //   const { daumMap, info, geocoder, markerImage } = this.state;

  //   console.log(info);
  //   const addressList = info.split(',');
  //   console.log(addressList, 'addressList');
  //   const errorList = [];
  //   // console.log(markerImage, 'image');
  //   const history = new Array();
  //   addressList.forEach(function(value, i) {
  //     geocoder.addressSearch(value, function(result, status) {
  //       if (status === window.daum.maps.services.Status.OK) {
  //         let coords = new window.daum.maps.LatLng(result[0].y, result[0].x);
  //         if (history.includes(coords.ib)) {
  //           console.log('중복발견');
  //         }
  //         console.log(coords.ib, 'coords' + i);

  //         // if (history.contains(coords.ib)) {
  //         //   console.log("중복발견");
  //         // }
  //         history.push(coords.ib);

  //         let tmpMarker = new window.daum.maps.Marker({
  //           position: coords,
  //           image: markerImage
  //         });
  //         tmpMarker.setMap(daumMap);
  //       } else {
  //         console.log(value, "실패" + i);
  //         errorList.push(value);
  //       }
  //     });
  //   });
  // }

  render() {
    const mapStyle = {
      width: '100%',
      height: '500px',
      overflow: 'hidden',
      margin: '15px 0',
    }

    return(
    <div class="ui form" style={{display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: 'column'}}>
      <form style={{width: "80vw"}}>
        <div class="ui divider"></div>
        <div>
          <h3>장소</h3>
          <div id="map" style={mapStyle}>
          </div>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
          <div class="ui input" style={{margin: '15px 0'}}>
            <input id="search_address" style={{width: "80%"}}type="text" onChange={this.handleAddressChange} placeholder="도로명 주소를 입력해 주세요"/>
            <button class="ui primary basic button" onClick={this.searchAddress}>></button>
          </div>
          </div>
        </div>
        <div class="ui divider"></div>
        <div class="field" style={{margin: "20px 0"}}>
          <h3 style={{marginBottom: "20px"}}>주소 목록</h3>
          <textarea onChange={this.handleInfoChange}></textarea>
        </div>
        <span class="" style={{marginBottom: '50px'}}><button onClick={this.handleDrawMarker}>표시하기</button></span>
      </form>
    </div>
    );
  }

}