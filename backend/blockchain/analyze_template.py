import os
from PIL import Image
import numpy as np

def main():
    template_path = "assets/image.png"
    if not os.path.exists(template_path):
        print(f"Error: Template not found at {template_path}")
        return
        
    img = Image.open(template_path).convert("L") # Grayscale
    arr = np.array(img)
    
    # In grayscale, 255 is white, 0 is black.
    # Find rows with dark pixels (average value < 250)
    height, width = arr.shape
    print(f"Image Dimensions: {width}x{height}")
    
    # Calculate row averages
    row_averages = np.mean(arr, axis=1)
    
    # Find contiguous blocks of rows that are darker (intensity < 254)
    dark_rows = np.where(row_averages < 254)[0]
    
    if len(dark_rows) == 0:
        print("No dark rows detected!")
        return
        
    # Group contiguous rows into text blocks
    blocks = []
    start_row = dark_rows[0]
    for i in range(1, len(dark_rows)):
        if dark_rows[i] != dark_rows[i-1] + 1:
            blocks.append((start_row, dark_rows[i-1]))
            start_row = dark_rows[i]
    blocks.append((start_row, dark_rows[-1]))
    
    print("\nDetected Text/Line Blocks (Y-coordinates):")
    for idx, (y_start, y_end) in enumerate(blocks):
        # Find horizontal boundaries for this block
        block_arr = arr[y_start:y_end+1, :]
        col_averages = np.mean(block_arr, axis=0)
        dark_cols = np.where(col_averages < 254)[0]
        if len(dark_cols) > 0:
            x_start, x_end = dark_cols[0], dark_cols[-1]
        else:
            x_start, x_end = 0, width
            
        print(f"Block {idx+1}: Y: {y_start} to {y_end} (height {y_end - y_start}), X: {x_start} to {x_end} (width {x_end - x_start})")

if __name__ == "__main__":
    main()
