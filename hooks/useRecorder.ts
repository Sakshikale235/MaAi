import { useState } from "react";
import { Audio } from "expo-av";

export const useRecorder = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
    } catch (err) {
      console.error("Start Recording Error:", err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return null;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setAudioUri(uri || null);
      setRecording(null);

      return uri;
    } catch (err) {
      console.error("Stop Recording Error:", err);
      return null;
    }
  };

  return {
    startRecording,
    stopRecording,
    audioUri,
    isRecording: !!recording
  };
};
