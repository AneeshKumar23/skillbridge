export interface TranscriptionResponse {
    text: string;
}

export async function transcribeAudio(audioBlob: Blob, apiKey: string): Promise<TranscriptionResponse | null> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.mp3');
    formData.append('model_id', 'scribe_v1');

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
            },
            body: formData
        });

        if (!response.ok) {
            console.error('Transcription failed:', await response.text());
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error during transcription:', error);
        return null;
    }
}

export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: BlobPart[] = [];
    private stream: MediaStream | null = null;

    constructor(private onRecordingComplete: (blob: Blob) => void) {}

    async startRecording() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
                this.onRecordingComplete(audioBlob);
            };

            this.mediaRecorder.start();
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        this.cleanUp();
    }

    private cleanUp() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }
}