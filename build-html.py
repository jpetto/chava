import json

header_html = ''
footer_html = ''
images_html = ''
final_html = ''

# store header/footer to strings
with open('templates/header.html', 'r') as header:
    header_html = header.read()

with open('templates/footer.html', 'r') as footer:
    footer_html = footer.read()

# read image json
with open('image-catalog.json') as image_catalog:
    images = json.load(image_catalog)

# build ye olde htmle
for image in images:
    images_html = images_html + '\t<li class="image">\n'
    images_html = images_html + '\t\t<a id="' + image['id'] + '" class="image-link" data-medium="' + image['medium']['path'] + '" href="' + image['large']['path'] + '">'
    images_html = images_html + '<img class="photo" width="' + str(image['thumb']['width']) + '" height="' + str(image['thumb']['height']) + '" data-original="' + image['thumb']['path'] + '" data-original-set="' + image['thumb@2x']['path'] + ' 2x">'
    images_html = images_html + '</a>\n\t</li>\n'

# smoosh it all together...
final_html = header_html + images_html + footer_html

# ...and write it to a file
with open('public/index.html', 'w') as final:
    final.write(final_html)
