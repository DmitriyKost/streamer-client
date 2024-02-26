import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { AntDesign, FontAwesome } from "react-native-vector-icons";

export default function App() {
	const [songs, setSongs] = useState([]);
	const [sound, setSound] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

	useEffect(() => {
		fetchSongs();
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
        });
	}, []);

	const fetchSongs = async () => {
		try {
			const response = await fetch('http://185.70.186.107:8080/fetch');
			const data = await response.json();
			setSongs(data);
		} catch (error) {
			console.error('Error fetching songs:', error);
		}
	};

	const playSong = async (songId, initialPosition = 0) => {
		try {
			if (sound) {
				await sound.unloadAsync();
			}

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: `http://185.70.186.107:8080/get?song=${songId}` },
                { 
                    shouldPlay: true,
                }
            );
			setSound(newSound);
			setIsPlaying(true);

			newSound.setOnPlaybackStatusUpdate((status) => {
				if (!status.isLoaded) {
					if (status.error) {
						console.error('Error loading sound:', status.error);
					}
				} else {
					setIsPlaying(status.isPlaying);
					setPosition(status.positionMillis);
                    setDuration(status.durationMillis);
				}
			});
		} catch (error) {
			console.error('Error playing song:', error);
		}
	};

	const togglePlayPause = async () => {
		if (sound) {
			if (isPlaying) {
				await sound.pauseAsync();
			} else {
				await sound.playAsync();
			}
		}
	};

	const rewind = async () => {
		if (sound) {
			const newPosition = Math.max(0, position - 5000); // Rewind 5 seconds
			await sound.setPositionAsync(newPosition);
			setPosition(newPosition);
		}
	};

	const fastForward = async () => {
		if (sound) {
            const status = await sound.getStatusAsync();
            const newPosition = Math.min(status.durationMillis, position + 10000); // Fast forward 10 seconds
            await sound.setPositionAsync(newPosition);
            setPosition(newPosition);
        }
    };

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>Songs</Text>
			{songs.map((song) => (
				<View key={song.id} style={styles.songContainer}>
					<Button title={`${song.name} - ${song.artist}`} onPress={() => playSong(song.id)} />
				</View>
			))}
			{sound && (
				<View style={styles.controlsContainer}>
                    <Pressable onPress={rewind} style={styles.iconContainer}>
                        <AntDesign name="fastbackward" size={32} color="black" />
                    </Pressable>
                    <Pressable onPress={togglePlayPause} style={styles.iconContainer}>
                        <AntDesign name={isPlaying ? 'pausecircle' : 'play'} size={32} color="black" />
                    </Pressable>
                    <Pressable onPress={fastForward} style={styles.iconContainer}>
                        <AntDesign name="fastforward" size={32} color="black" />
                    </Pressable>				
                </View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'flex-start',
		justifyContent: 'center',
	},
	heading: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	songContainer: {
		marginBottom: 10,
        width: '20%',
        left: 20,
	},
    controlsContainer: {
		backgroundColor: 'gray', 
        position: 'absolute', 
        bottom: 20, 
        left: 0,
        right: 0, 
        flexDirection: 'row',
        justifyContent: 'center',
    },
    iconContainer: {
        padding: 10,
    },
});

