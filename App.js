import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
    const [song, setSong] = useState();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    async function playSong(songUrl) {
        console.log('Loading Sound');
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync( 
            {
                uri: songUrl,
            },
        );
        setSong(sound);

        console.log('Playing Song');
        await sound.playAsync({
            shouldPlay: true,
            isBuffering: true, // Set isBuffering to true to start playback before the entire audio is loaded
        });
    }

    const fetchSongs = async () =>  {
        try {
            const response = await fetch("http://185.70.186.107:8080/fetch");
            const data = await response.json();
            setSongs(data);
        } catch (error) {
            console.error("Error fetching songs", error);
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchSongs();
    }, []); 

    useEffect(() => {
        return song
            ? () => {
                console.log('Unloading Sound');
                song.unloadAsync();
            }
            : undefined;
    }, [song]);

    return (
        <View style={styles.container}>
            {loading ? (
                <Text>Loading songs...</Text>
            ) : (
                songs.map((s) => (
                    <Button
                        key={s.id}
                        title={s.name} 
                        onPress={() => playSong("http://185.70.186.107:8080/get?song=" + s.id)}
                    />
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
