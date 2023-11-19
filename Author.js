import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import axios from 'axios'

const API_AUTHOR_URL = 'https://api.artic.edu/api/v1/artists?limit=100&page=100'

const stripHtmlTags = html => {
	if (!html) return ''
	return html.replace(/<[^>]*>/g, '')
}

const AuthorScreen = ({ route }) => {
	const { author } = route.params
	const [authorInfo, setAuthorInfo] = useState(null)

	useEffect(() => {
		const fetchAuthorInfo = async () => {
			try {
				const response = await axios.get(API_AUTHOR_URL, {
					params: {
						query: author,
					},
				})

				const authorData = response.data.data[0]
				setAuthorInfo(authorData)
			} catch (error) {
				console.error('Error fetching author info:', error)
			}
		}

		fetchAuthorInfo()
	}, [author])

	return (
		<View style={styles.container}>
			{authorInfo ? (
				<>
					<Text style={styles.authorScreenText}>{authorInfo.title}</Text>
					{authorInfo.biography ? (
						<Text style={styles.authorBiography}>{stripHtmlTags(authorInfo.biography)}</Text>
					) : (
						<Text>No biography available.</Text>
					)}
				</>
			) : (
				<Text>Loading author information...</Text>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		padding: 16,
	},
	authorScreenText: {
		fontSize: 20,
		fontWeight: 'bold',
		textAlign: 'center',
		marginVertical: 10,
		color: '#000000',
	},
	authorBiography: {
		fontSize: 16,
		textAlign: 'center',
		color: '#000000',
		marginTop: 10,
	},
})

export default AuthorScreen
