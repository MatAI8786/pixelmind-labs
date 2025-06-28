from pathlib import Path
import cv2
from rembg import remove

def process_logo(input_path: str) -> str:
    """Remove background from logo and save as processed file."""
    input_file = Path(input_path)
    output_file = input_file.with_name(input_file.stem + "_processed.png")

    with open(input_file, "rb") as i:
        output = remove(i.read())
    with open(output_file, "wb") as o:
        o.write(output)

    # simple smoothing using cv2
    img = cv2.imread(str(output_file))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cv2.imwrite(str(output_file), gray)
    return str(output_file)
