from PIL import Image
import os
import sys

def rotate_and_save(image_path):
    # Load the image
    img = Image.open(image_path)

    # Get the directory and filename
    dir_name, filename = os.path.split(image_path)
    base_name, ext = os.path.splitext(filename)

    # Define rotations and filenames
    rotations = {
        90: f"{base_name}_90{ext}",
        180: f"{base_name}_180{ext}",
        270: f"{base_name}_270{ext}"
    }

    # Rotate and save images
    for angle, new_filename in rotations.items():
        rotated_img = img.rotate(angle, expand=True)
        rotated_img.save(os.path.join(dir_name, new_filename))
        print(f"Saved: {new_filename}")

# Example usage
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    rotate_and_save(image_path)
