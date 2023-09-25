import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps-osmdroid';
import * as Location from 'expo-location';

const MapScreen = () => {
  const [region, setRegion] = useState({
    latitude: 45.55071,
    longitude: -73.59808,
    latitudeDelta: 0.18721,
    longitudeDelta: 0.24633,
  });

  const [userLocation, setUserLocation] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchPOIs = async () => {
        try {
          let response;
      
          if (
            region.latitude &&
            region.longitude &&
            region.latitudeDelta &&
            region.longitudeDelta
          ) {
            response = await fetch(
              `https://solving.ai/public/api/get-place-nearby.php?latitude=${region.latitude}&longitude=${region.longitude}&latitudeDelta=${region.latitudeDelta}&longitudeDelta=${region.longitudeDelta}`
            );
          } else {
            const location = await getLocation();
    
            response = await fetch(
              `https://solving.ai/public/api/get-place-nearby.php?latitude=${location.latitude}&longitude=${location.longitude}&latitudeDelta=0.01&longitudeDelta=0.01`
            );
          }
      
          if (!response.ok) {
            throw new Error('Error trying to request API.')
          }
      
          const data = await response.json();
      
          if (data.pois) {
            setMarkers(data.pois);
          } else {
            console.warn('No POIs were found.');
          }
        } catch (error) {
          console.error('Error trying to request API:', error.message);
        }
      };
    fetchPOIs();
  }, [region]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.error('Not permission allowed.');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      return location.coords;
    } catch (error) {
      console.error('Error reaching user location:', error.message);
      return null;
    }
  };

  const centerMapOnUserLocation = async () => {
    try {
      const location = await getLocation();
      if (location) {
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        fetchPOIs();
      }
    } catch (error) {
      console.error('Error al obtener la ubicación del usuario:', error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} region={region} onRegionChangeComplete={setRegion}>
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="My location"
            pinColor="blue"
          />
        )}
        {markers.map((poi, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(poi.latitude),
              longitude: parseFloat(poi.longitude),
            }}
            title={poi.name}
          />
        ))}
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title="Center"
          pinColor="red"
        />
      </MapView>
      <Text style={{ textAlign: 'center', marginVertical: 10 }}>
        Latitude: {region.latitude.toFixed(6)}, Longitude: {region.longitude.toFixed(6)}
      </Text>
      <Button
        title="Center Map on User Location"
        onPress={centerMapOnUserLocation}
        style={{ backgroundColor: 'blue', color: 'white', padding: 10, borderRadius: 5 }}
      />
    </View>
  );
};

export default MapScreen;
