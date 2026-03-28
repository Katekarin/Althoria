import cv2
import numpy as np
from pathlib import Path
import os

# Ścieżka do Twojego zdjęcia
script_dir = Path(__file__).parent
input_image = script_dir / "Forest3.png"
output_folder = "wyciete_obiekty"
txt_file = "pozycje_obiektow.txt"

# Tworzymy folder na wycięte PNG
Path(output_folder).mkdir(exist_ok=True)

# Wczytujemy obraz (z alfą!)
img = cv2.imread(input_image, cv2.IMREAD_UNCHANGED)

if img.shape[2] != 4:
    print("Obraz nie ma kanału alfa – nie da się tego zrobić automatycznie na 100% dokładnie.")
    exit()

# Wyciągamy tylko kanał alfa
alpha = img[:, :, 3]

# Znajdujemy kontury na kanale alfa (RETR_EXTERNAL = tylko zewnętrzne kontury)
contours, _ = cv2.findContours(alpha, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

print(f"Znaleziono {len(contours)} obiektów")

with open(txt_file, "w", encoding="utf-8") as f:
    f.write("nr_obiektu\tx\ty szerokość\twysokość\t nazwa_pliku\n")
    
    for i, cnt in enumerate(contours):
        # Bounding box
        x, y, w, h = cv2.boundingRect(cnt)
        
        # Wyciągamy kawałek obrazu (z alfą)
        sprite = img[y:y+h, x:x+w]
        
        # Zapisujemy jako osobny PNG
        nazwa = f"{output_folder}/obiekt3_{i+1:03d}.png"
        cv2.imwrite(nazwa, sprite)
        
        # Zapis do txt
        f.write(f"{i+1}\t{x}\t{y}\t{w}\t{h}\t{os.path.basename(nazwa)}\n")
        
        print(f"Zapisano: {nazwa}   →  x={x:4d} y={y:4d} w={w:3d} h={h:3d}")

print(f"\nGotowe! Pozycje zapisane w pliku: {txt_file}")