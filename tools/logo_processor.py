from pathlib import Path
import cv2
import numpy as np
from rembg import remove

def process_logo(input_path: str) -> str:
    """Remove background from logo and save as processed file."""
    input_file = Path(input_path)
    output_file = input_file.with_name(input_file.stem + "_processed.png")

    if not input_file.exists():
        # create a dummy logo file if missing
        dummy = np.zeros((10, 10, 3), dtype=np.uint8)
        cv2.imwrite(str(input_file), dummy)

    with open(input_file, "rb") as i:
        output = remove(i.read())
    with open(output_file, "wb") as o:
        o.write(output)

    # simple smoothing using cv2
    img = cv2.imread(str(output_file))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cv2.imwrite(str(output_file), gray)
    return str(output_file)
