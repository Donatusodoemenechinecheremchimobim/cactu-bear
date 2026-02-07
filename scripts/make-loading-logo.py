from PIL import Image

# INPUT image (your existing logo)
IN_PATH = "public/logo.png"

# OUTPUT transparent version
OUT_PATH = "public/loading-logo.png"

img = Image.open(IN_PATH).convert("RGBA")
datas = img.getdata()

new_data = []

for item in datas:
    r, g, b, a = item

    # Remove near-black background
    if r < 35 and g < 35 and b < 35:
        new_data.append((r, g, b, 0))  # make transparent
    else:
        new_data.append((r, g, b, 255))

img.putdata(new_data)
img.save(OUT_PATH)

print("Transparent loading logo created:", OUT_PATH)
