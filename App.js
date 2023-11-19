import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { AntDesign, Feather } from '@expo/vector-icons'
import ImageViewer from 'react-native-image-zoom-viewer'
import axios from 'axios'
import AuthorScreen from './Author'
import Map from './map.js'

const API_URL = 'https://api.artic.edu/api/v1/artworks'
const API_AUTHOR_URL = 'https://api.artic.edu/api/v1/agents/'

const stripHtmlTags = html => {
	if (!html) return ''
	return html.replace(/<[^>]*>/g, '')
}

const HomeScreen = ({ navigation, favorites, setFavorites }) => {
	const [artworks, setArtworks] = useState([])
	const [page, setPage] = useState(1)
	const [selectedArtwork, setSelectedArtwork] = useState(null)

	useEffect(() => {
		fetchData()
		return () => {
			setSelectedArtwork(null)
		}
	}, [])

	const fetchData = async () => {
		try {
			const response = await axios.get(API_URL, {
				params: {
					page,
					limit: 15,
				},
			})

			const newArtworks = response.data.data.filter(
				newArtwork => !artworks.some(existingArtwork => existingArtwork.id === newArtwork.id)
			)

			setArtworks(prevArtworks => [...prevArtworks, ...newArtworks])
		} catch (error) {
			console.error('Error fetching data:', error)
		}
	}

	const addToFavorites = item => {
		const isFavorite = favorites.some(favorite => favorite.id === item.id)
		if (isFavorite) {
			setFavorites(prevFavorites => prevFavorites.filter(favorite => favorite.id !== item.id))
		} else {
			setFavorites(prevFavorites => [...prevFavorites, item])
		}
	}

	const openModal = item => {
		setSelectedArtwork(item)
	}

	const closeModal = () => {
		setSelectedArtwork(null)
	}

	const renderItem = ({ item }) => (
		<TouchableOpacity onPress={() => openModal(item)}>
			<View style={styles.artworkContainer}>
				{item.image_id ? (
					<Image
						style={styles.artworkImage}
						source={{
							uri: `https://www.artic.edu/iiif/2/${item.image_id}/full/300,300/0/default.jpg`,
						}}
					/>
				) : (
					<Image style={styles.noimage} source={require('./img/noimage3.jpg')} />
				)}

				<Text style={styles.artworkTitle}>{item.title}</Text>
				<TouchableOpacity style={styles.artworkAuthorContainer} onPress={() => openModal(item)}>
					<Text style={styles.artworkAuthor}>{item.artist_title}</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.favoriteButton} onPress={() => addToFavorites(item)}>
					<AntDesign
						name={favorites.some(favorite => favorite.id === item.id) ? 'heart' : 'hearto'}
						size={24}
						color='red'
					/>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)

	const handleEndReached = () => {
		setPage(prevPage => prevPage + 1)
		fetchData()
	}

	const MapLink = art => {
		if (art.latitude) {
			return (
				<TouchableOpacity
					style={styles.artworkAuthorContainer}
					onPress={() =>
						navigation.navigate('Map', {
							latitude: art.latitude,
							longitude: art.longitude,
							title: art.title,
						})
					}>
					<Text style={styles.artworkAuthor}>View Map</Text>
				</TouchableOpacity>
			)
		}
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={artworks}
				keyExtractor={item => item.id.toString()}
				renderItem={renderItem}
				key={item => item.id.toString()}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.1}
				initialNumToRender={10}
				maxToRenderPerBatch={5}
				windowSize={10}
			/>

			<Modal visible={selectedArtwork !== null} transparent={true} animationType='slide'>
				<View style={styles.modalContainer}>
					<TouchableOpacity style={styles.closeButton} onPress={closeModal}>
						<AntDesign name='close' size={24} color='white' />
					</TouchableOpacity>
					{selectedArtwork && (
						<>
							<ImageViewer
								imageUrls={[
									{ url: `https://www.artic.edu/iiif/2/${selectedArtwork.image_id}/full/300,300/0/default.jpg` },
								]}
								style={styles.modalImage}
								renderIndicator={() => null}
							/>
							<Text style={styles.modalTitle}>{selectedArtwork.title}</Text>
							<TouchableOpacity
								style={styles.modalAuthorContainer}
								onPress={() =>
									navigation.navigate('Author', {
										author: selectedArtwork.artist_title,
									})
								}>
								<MapLink art={selectedArtwork} />

								<Text style={styles.modalAuthor}>{selectedArtwork.artist_title}</Text>
							</TouchableOpacity>
							<Text style={styles.modalDescription}>{stripHtmlTags(selectedArtwork.description)}</Text>
						</>
					)}
				</View>
			</Modal>
		</View>
	)
}

const FavoritesScreen = ({ favorites, setFavorites, navigation }) => {
	const [likedArtworks, setLikedArtworks] = useState([])
	const [selectedArtwork, setSelectedArtwork] = useState(null)

	useEffect(() => {
		setLikedArtworks(favorites)
	}, [favorites])

	const removeFromFavorites = item => {
		setFavorites(prevFavorites => prevFavorites.filter(favorite => favorite.id !== item.id))
	}

	const openModal = item => {
		setSelectedArtwork(item)
	}

	const closeModal = () => {
		setSelectedArtwork(null)
	}

	const renderItem = ({ item }) => (
		<TouchableOpacity onPress={() => openModal(item)}>
			<View style={styles.artworkContainer}>
				{item.image_id ? (
					<Image
						style={styles.artworkImage}
						source={{
							uri: `https://www.artic.edu/iiif/2/${item.image_id}/full/300,300/0/default.jpg`,
						}}
					/>
				) : (
					<Image style={styles.noimage} source={require('./img/noimage3.jpg')} />
				)}

				<Text style={styles.artworkTitle}>{item.title}</Text>
				<TouchableOpacity
					style={styles.artworkAuthorContainer}
					onPress={() => navigation.navigate('Author', { author: item.artist_title })}>
					<Text style={styles.artworkAuthor}>{item.artist_title}</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.favoriteButton} onPress={() => removeFromFavorites(item)}>
					<AntDesign name='heart' size={24} color='red' />
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)
	const MapLink = art => {
		if (art.latitude) {
			return (
				<TouchableOpacity
					style={styles.artworkAuthorContainer}
					onPress={() =>
						navigation.navigate('Map', {
							latitude: art.latitude,
							longitude: art.longitude,
							title: art.title,
						})
					}>
					<Text style={styles.artworkAuthor}>View Map</Text>
				</TouchableOpacity>
			)
		}
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={likedArtworks}
				keyExtractor={item => item.id.toString()}
				renderItem={renderItem}
				onEndReachedThreshold={0.1}
			/>

			<Modal visible={selectedArtwork !== null} transparent={true} animationType='slide'>
				<View style={styles.modalContainer}>
					<TouchableOpacity style={styles.closeButton} onPress={closeModal}>
						<AntDesign name='close' size={24} color='black' />
					</TouchableOpacity>
					{selectedArtwork && (
						<>
							<Image
								style={styles.modalImage}
								source={{
									uri: `https://www.artic.edu/iiif/2/${selectedArtwork.image_id}/full/300,300/0/default.jpg`,
								}}
							/>
							<Text style={styles.modalTitle}>{selectedArtwork.title}</Text>
							<TouchableOpacity
								style={styles.modalAuthorContainer}
								onPress={() =>
									navigation.navigate('Author', {
										author: selectedArtwork.artist_title,
									})
								}>
								<MapLink art={selectedArtwork} />
								<Text style={styles.modalAuthor}>{selectedArtwork.artist_title}</Text>
							</TouchableOpacity>
							<Text style={styles.modalDescription}>{stripHtmlTags(selectedArtwork.description)}</Text>
						</>
					)}
				</View>
			</Modal>
		</View>
	)
}

const SearchImages = ({ navigation, favorites, setFavorites }) => {
	const [artworks, setArtworks] = useState([])
	const [page, setPage] = useState(1)
	const [selectedArtwork, setSelectedArtwork] = useState(null)
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		fetchData()
	}, [searchQuery])

	const fetchData = async () => {
		try {
			const response = await axios.get(`${API_URL}/search`, {
				params: {
					page,
					limit: 15,
					q: searchQuery,
					fields: 'id,image_id,title,artist_title,latitude,longitude',
				},
			})

			const newArtworks = response.data.data.filter(
				newArtwork => !artworks.some(existingArtwork => existingArtwork.id === newArtwork.id)
			)
			setArtworks(prevArtworks => [...prevArtworks, ...newArtworks])
		} catch (error) {
			console.error('Error fetching data:', error)
		}
	}

	const addToFavorites = item => {
		const isFavorite = favorites.some(favorite => favorite.id === item.id)
		if (isFavorite) {
			setFavorites(prevFavorites => prevFavorites.filter(favorite => favorite.id !== item.id))
		} else {
			setFavorites(prevFavorites => [...prevFavorites, item])
		}
	}

	const openModal = item => {
		setSelectedArtwork(item)
	}

	const closeModal = () => {
		setSelectedArtwork(null)
	}
	const MapLink = art => {
		if (art.art.latitude) {
			return (
				<TouchableOpacity
					style={styles.artworkAuthorContainer}
					onPress={() =>
						navigation.navigate('Map', {
							latitude: art.art.latitude,
							longitude: art.art.longitude,
							title: art.art.title,
						})
					}>
					<Text style={styles.artworkAuthor}>View Map</Text>
				</TouchableOpacity>
			)
		}
	}

	const renderItem = ({ item }) => (
		<TouchableOpacity onPress={() => openModal(item)}>
			<View style={styles.artworkContainer}>
				{item.image_id ? (
					<Image
						style={styles.artworkImage}
						source={{
							uri: `https://www.artic.edu/iiif/2/${item.image_id}/full/300,300/0/default.jpg`,
						}}
					/>
				) : (
					<Image style={styles.noimage} source={require('./img/noimage3.jpg')} />
				)}

				<Text style={styles.artworkTitle}>{item.title}</Text>
				<TouchableOpacity style={styles.artworkAuthorContainer} onPress={() => openModal(item)}>
					<Text style={styles.artworkAuthor}>{item.artist_title}</Text>
				</TouchableOpacity>

				<MapLink art={item} />

				<TouchableOpacity style={styles.favoriteButton} onPress={() => addToFavorites(item)}>
					<AntDesign
						name={favorites.some(favorite => favorite.id === item.id) ? 'heart' : 'hearto'}
						size={24}
						color='red'
					/>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)

	const handleEndReached = () => {
		setPage(prevPage => prevPage + 1)
		fetchData()
	}
	const handleSearch = query => {
		setArtworks([])
		setPage(1)
		setSearchQuery(query)
	}
	return (
		<View style={styles.container}>
			<TextInput
				style={styles.searchBar}
				placeholder='Search for images'
				value={searchQuery}
				onChangeText={handleSearch}
			/>
			<FlatList
				data={artworks}
				keyExtractor={item => item.id.toString()}
				renderItem={renderItem}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.1}
				initialNumToRender={10}
				maxToRenderPerBatch={5}
				windowSize={10}
			/>

			<Modal visible={selectedArtwork !== null} transparent={true} animationType='slide'>
				<View style={styles.modalContainer}>
					<TouchableOpacity style={styles.closeButton} onPress={closeModal}>
						<AntDesign name='close' size={24} color='black' />
					</TouchableOpacity>
					{selectedArtwork && (
						<>
							<Image
								style={styles.modalImage}
								source={{
									uri: `https://www.artic.edu/iiif/2/${selectedArtwork.image_id}/full/300,300/0/default.jpg`,
								}}
							/>
							<Text style={styles.modalTitle}>{selectedArtwork.title}</Text>
							<TouchableOpacity
								style={styles.modalAuthorContainer}
								onPress={() =>
									navigation.navigate('Author', {
										author: selectedArtwork.artist_title,
									})
								}>
								<Text style={styles.modalAuthor}>{selectedArtwork.artist_title}</Text>
							</TouchableOpacity>
							<Text style={styles.modalDescription}>{stripHtmlTags(selectedArtwork.description)}</Text>
						</>
					)}
				</View>
			</Modal>
		</View>
	)
}

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const MainTabNavigator = () => {
	const [favorites, setFavorites] = useState([])

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color, size }) => {
					let iconName

					if (route.name === 'Images List') {
						return <AntDesign name={'home'} size={size} color={color} />
					} else if (route.name === 'Favorites') {
						return <AntDesign name='heart' size={size} color={color} />
					} else if (route.name === 'Search') {
						return <Feather name='search' size={size} color={color} />
					}

					return <AntDesign name={iconName} size={size} color={color} />
				},
			})}
			tabBarOptions={{
				labelStyle: { fontSize: 12, fontWeight: 'bold' },
			}}>
			<Tab.Screen name='Images List'>
				{props => <HomeScreen {...props} favorites={favorites} setFavorites={setFavorites} />}
			</Tab.Screen>
			<Tab.Screen name='Favorites'>
				{props => <FavoritesScreen {...props} favorites={favorites} setFavorites={setFavorites} />}
			</Tab.Screen>
			<Tab.Screen name='Search'>
				{props => <SearchImages {...props} favorites={favorites} setFavorites={setFavorites} />}
			</Tab.Screen>
		</Tab.Navigator>
	)
}

const AppNavigator = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name='MainTabNavigator' component={MainTabNavigator} options={{ headerShown: false }} />
				<Stack.Screen
					name='Author'
					component={AuthorScreen}
					options={{
						title: 'Author',
						headerStyle: {
							backgroundColor: 'white',
						},
						headerTitleStyle: {
							fontWeight: 'bold',
							fontSize: 25,
							color: 'black',
						},
						headerTintColor: 'black',
					}}
				/>
				<Stack.Screen
					name='Map'
					component={Map}
					options={{
						title: 'Map',
						headerStyle: {
							backgroundColor: 'white',
						},
						headerTitleStyle: {
							fontWeight: 'bold',
							fontSize: 25,
							color: 'black',
						},
						headerTintColor: 'black',
					}}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	)
}

const styles = StyleSheet.create({
	searchBar: {
		backgroundColor: 'white',
		padding: 10,
		margin: 10,
		borderRadius: 5,
	},
	container: {
		flex: 1,
		backgroundColor: 'white',
		padding: 16,
	},
	artworkContainer: {
		marginBottom: 16,
		backgroundColor: '#ad7e47',
		borderRadius: 8,
		overflow: 'hidden',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
	},
	artworkImage: {
		width: '100%',
		height: 250,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		resizeMode: 'cover',
	},
	artworkTitle: {
		fontSize: 14,
		fontWeight: 'bold',
		textAlign: 'left',
		padding: 25,
		color: '#ffffff',
	},
	artworkAuthorContainer: {
		paddingHorizontal: 25,
		paddingBottom: 5,
	},
	artworkAuthor: {
		fontSize: 14,
		fontWeight: 'bold',
		color: 'blue',
		textDecorationLine: 'underline',
	},
	noimage: {
		height: 250,
		width: 390,
	},
	favoriteButton: {
		position: 'absolute',
		top: 10,
		right: 10,
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	closeButton: {
		position: 'absolute',
		top: 20,
		right: 20,
		zIndex: 1,
	},
	modalImage: {
		width: '100%',
		height: 250,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		resizeMode: 'cover',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
		marginVertical: 10,
		color: '#000000',
	},
	modalAuthorContainer: {
		paddingHorizontal: 25,
		paddingBottom: 5,
	},
	modalAuthor: {
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
		color: 'blue',
		textDecorationLine: 'underline',
	},
	modalDescription: {
		fontSize: 14,
		textAlign: 'center',
		color: '#000000',
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	authorScreenText: {
		fontSize: 20,
		fontWeight: 'bold',
		textAlign: 'center',
		marginVertical: 10,
		color: '#000000',
	},
	authorBiography: {
		fontSize: 14,
		textAlign: 'center',
		color: '#000000',
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
})

export default AppNavigator
