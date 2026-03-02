import os
import re
import math
import argparse
from PIL import Image


def numeric_sort_key(filename):
    """
    Extracts numeric parts from filename for proper numeric sorting.
    Example: img10.png -> 10
    """
    numbers = re.findall(r'\d+', filename)
    return int(numbers[-1]) if numbers else -1


def create_spritesheets(input_folder, output_path):
    # Supported image extensions
    valid_ext = (".png", ".jpg", ".jpeg", ".bmp", ".gif")

    # Collect and sort images numerically
    image_files = [
        f for f in os.listdir(input_folder)
        if f.lower().endswith(valid_ext)
    ]

    image_files.sort(key=numeric_sort_key)

    if not image_files:
        raise ValueError("No valid images found in the folder.")

    # Load images
    print(f'image_files: {image_files}')
    images = [Image.open(os.path.join(input_folder, f)) for f in image_files]

    # Assume all images are same size (typical for spritesheets)
    img_width, img_height = images[0].size

    # Resize using NEAREST if needed (ensures no interpolation artifacts)
    images = [
        img.resize((img_width, img_height), resample=Image.NEAREST)
        for img in images
    ]

    num_images = len(images)

    # Compute square grid size
    grid_size = math.ceil(math.sqrt(num_images))

    # Create white background canvas
    sheet_width = grid_size * img_width
    sheet_height = grid_size * img_height

    spritesheet = Image.new(
        "RGBA",
        (sheet_width, sheet_height),
        (255, 255, 255, 255)  # white background
    )

    # Paste images into grid
    for index, img in enumerate(images):
        row = index // grid_size
        col = index % grid_size

        x = col * img_width
        y = row * img_height

        spritesheet.paste(img, (x, y))

    # Save result
    spritesheet.save(output_path)

    print(f"Spritesheet saved to {output_path}")
    print(f"Grid size: {grid_size}x{grid_size}")
    print(f"Total images: {num_images}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a square spritesheet from a folder of images.")
    parser.add_argument("--input_folder", type=str, help="Path to folder containing images")
    parser.add_argument("--output", type=str, help="Output image path (e.g., spritesheet.png)")
    args = parser.parse_args()

    input_folder = args.input_folder
    output_path = args.output

    create_spritesheets(input_folder, output_path)