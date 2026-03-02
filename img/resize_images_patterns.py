import os
import sys
from PIL import Image

def resize_square_images(input_folder, output_folder, width):
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)

    # Loop through all files in the input folder
    for filename in os.listdir(input_folder):
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, filename)

        # Skip non-image files
        try:
            with Image.open(input_path) as img:
                # Ensure image is square
                if img.width != img.height:
                    print(f"Skipping {filename}: not a square image ({img.width}x{img.height})")
                    continue

                # Resize using nearest neighbor
                resized = img.resize((width, width), Image.NEAREST)

                # Save resized image
                resized.save(output_path)
                print(f"Resized {filename} -> {output_path}")
        except Exception as e:
            print(f"Skipping {filename}: {e}")

def main():
    if len(sys.argv) != 4:
        print("Usage: python resize_square_images.py <input_folder> <output_folder> <width>")
        sys.exit(1)

    input_folder = sys.argv[1]
    output_folder = sys.argv[2]
    width = int(sys.argv[3])

    resize_square_images(input_folder, output_folder, width)

if __name__ == "__main__":
    main()

