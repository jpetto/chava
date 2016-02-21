"""
This file reads all unprocessed images in the specified directory, resizes
(and potentially rotates) them, stores them, then moves the original image
to a "done" folder.

Also creates a JSON catalog of images with path and size info.
"""

import json
import random
import re
import shutil
import string

from os import path, walk
from PIL import Image

image_catalog = []

img_files = []
size_sm = 150
size_md = 300
size_lg = 600

regex = re.compile(r'\.DS_Store')
img_root = 'raw_images/todo/'
img_dest = 'raw_images/processed/'
photo_dest = 'assets/photos/'

# get all image file names (excluding that goddamn .DS_Store)
for (dirpath, dirnames, filenames) in walk(img_root):
    img_files.extend([i for i in filenames if not regex.search(i)])
    break

# process each image, saving a _sm, _md, and _lg version
for img_file in img_files:
    print ''
    print '************'
    print 'PROCESSING ' + img_file + '...'
    print '************'

    # create new image dict with unique-ish id
    id = ''.join(random.SystemRandom().choice(string.ascii_lowercase + string.digits) for _ in range(10))

    image_entry = {
        'id': 'photo-' + str(id)
    }

    # get image object
    img = Image.open(img_root + img_file)

    # get image dimensions and extension
    img_width, img_height = img.size
    img_name, img_ext = path.splitext(img_root + img_file)
    img_name = img_name.replace(img_root, '')

    # if width/height aren't equal and is a jpg, try to properly rotate
    if (img_width != img_height and img_ext.lower() in ['.jpg', '.jpeg']):
        # see if file has exif data
        img_exif = img._getexif()

        if img_exif and 274 in img_exif:
            orientation = img_exif[274]

            rotate_values = {
                3: 180,
                6: 270,
                8: 90
            }

            # if valid rotation found, rotate image and update width/height
            if orientation in rotate_values:
                print '* rotating image...'
                img_height, img_width = img.size
                # must use expand=True to make rotated image not have black bars
                img = img.rotate(rotate_values[orientation], expand=True)

        else:
            print '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
            print 'No exif data for rectangle! Might get an oddly rotated image!'
            print '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'


    # create 150x150 thumbnail & save to public/images

    # if image is wider than tall, limit height to 150 and calc width
    if (img_width > img_height):
        th_percent = (size_sm / float(img_height))
        th_width = int(float(img_width) * float(th_percent))
        th_img = img.resize((th_width, size_sm), Image.ANTIALIAS)
    # if image is taller than wide, limit width to 150 and calc height
    else:
        th_percent = (size_sm / float(img_width))
        th_height = int(float(img_height) * float(th_percent))
        th_img = img.resize((size_sm, th_height), Image.ANTIALIAS)

    th_img = th_img.crop((0, 0, size_sm, size_sm))
    th_img_path = photo_dest + img_name + '_thumb' + img_ext

    th_img.save(th_img_path, quality=100)

    print '* saved thumbnail image (' + str(size_sm) + 'x' + str(size_sm) + ')'

    image_entry['thumb'] = {
        'path': th_img_path,
        'width': size_sm,
        'height': size_sm
    }

    # create 300x300 thumbnail & save to public/images

    # if image is wider than tall, limit height to 300 and calc width
    if (img_width > img_height):
        th2_percent = (size_md / float(img_height))
        th2_width = int(float(img_width) * float(th2_percent))
        th2_img = img.resize((th2_width, size_md), Image.ANTIALIAS)
    # if image is taller than wide, limit width to 300 and calc height
    else:
        th2_percent = (size_md / float(img_width))
        th2_height = int(float(img_height) * float(th2_percent))
        th2_img = img.resize((size_md, th2_height), Image.ANTIALIAS)

    th2_img = th2_img.crop((0, 0, size_md, size_md))

    th2_img_path = photo_dest + img_name + '_thumb@2x' + img_ext
    th2_img.save(th2_img_path, quality=100)

    print '* saved thumbnail @2x image (' + str(size_md) + 'x' + str(size_md) + ')'

    image_entry['thumb@2x'] = {
        'path': th2_img_path,
        'width': size_md,
        'height': size_md
    }

    # create medium 300x? image & save to public/images

    # if image is square, medium size is same as high res thumb
    if (img_width == img_height):
        print '* saved medium image (' + str(size_md) + 'x' + str(size_md) + ') (points to thumb@2x)'

        image_entry['medium'] = {
            'path': th2_img_path,
            'width': size_md,
            'height': size_md
        }
    else:
        # calculate percentage decrease of width
        md_percent = (size_md / float(img_width))

        # calculate new height
        md_height = int(float(img_height) * float(md_percent))

        # resize the Image object
        md_img = img.resize((size_md, md_height), Image.ANTIALIAS)

        # save the resized Image object
        md_img_path = photo_dest + img_name + '_md' + img_ext
        md_img.save(md_img_path, quality=100)

        print '* saved medium image (' + str(size_md) + 'x' + str(md_height) + ')'

        image_entry['medium'] = {
            'path': md_img_path,
            'width': size_md,
            'height': md_height
        }

    # create large 600x? image & save to public/images

    # calculate percentage decrease of width
    lg_percent = (size_lg / float(img_width))

    # calculate new height
    lg_height = int(float(img_height) * float(lg_percent))

    # resize the Image object
    lg_img = img.resize((size_lg, lg_height), Image.ANTIALIAS)

    # save the resized Image object
    lg_img_path = photo_dest + img_name + '_lg' + img_ext
    lg_img.save(lg_img_path, quality=100)

    print '* saved large image (' + str(size_lg) + 'x' + str(lg_height) + ')'

    image_entry['large'] = {
        'path': lg_img_path,
        'width': size_lg,
        'height': lg_height
    }

    image_catalog.append(image_entry)

    # move original image to "processed" folder
    shutil.move(img_root + img_file, img_dest)


with open('image-catalog.json', 'w') as outfile:
    json.dump(image_catalog, outfile)
