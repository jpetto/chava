"""
Reads all external image URLs (like from the Instagrams) and saves each image to
the specified folder.
"""

import json
import urllib

with open('imageurls.json') as data_file:
    data = json.load(data_file)

for source in data['sources']:
    print '***********'
    print 'Saving images from ' + source + '...'
    for url in data['sources'][source]:
        urllib.urlretrieve(url, 'raw_images/todo/' + url.split('/')[-1])
