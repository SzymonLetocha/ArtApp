import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

const Map = ({ route }) => {
	const { latitude, longitude, title } = route.params
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Map Screen</Text>
			<MapView
				style={styles.map}
				initialRegion={{
					latitude: latitude,
					longitude: longitude,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				}}>
				<Marker
					coordinate={{ latitude: latitude, longitude: longitude }}
					title={title}
					description='Location of Image'
				/>
			</MapView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
})

export default Map
