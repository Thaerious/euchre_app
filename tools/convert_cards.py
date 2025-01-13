import os
import sys

# Define the mapping of suits to Unicode symbols
suit_unicode = {
    "Spades": "\u2660",  # ♠
    "Hearts": "\u2665",  # ♥
    "Diamond": "\u2666",  # ♦
    "Clubs": "\u2663",  # ♣
}

# Check if the path is provided as a command-line argument
if len(sys.argv) < 2:
    print("Usage: python script.py <path_to_folder>")
    sys.exit(1)

# Folder containing the files
folder_path = sys.argv[1]

# Iterate over files in the folder
for file_name in os.listdir(folder_path):
    # Check if the file matches the format "Suit Number.png"
    if file_name.endswith(".png") and len(file_name.split()) == 2:
        suit, number = file_name.rsplit(" ", 1)
        number = number.replace(".png", "")
        
        # Check if the suit is in the mapping
        if suit in suit_unicode:
            new_file_name = f"{number} {suit_unicode[suit]}.png"
            
            # Get full paths for renaming
            old_path = os.path.join(folder_path, file_name)
            new_path = os.path.join(folder_path, new_file_name)
            
            # Rename the file
            os.rename(old_path, new_path)
            print(f"Renamed: {file_name} -> {new_file_name}")
