import os

def cleanup_audio_files(directory: str):
    for f in os.listdir(directory):
        if f.endswith('.wav'):
            os.remove(os.path.join(directory, f))
