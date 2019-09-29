# IN-PROGRESS

- update gulpfile and package.json to get local dev working
- update JS so previous source of lightbox image doesn't show
- also update to modern JS
- use CSS grid

# How to use this contraption

## Setup

1. Get your modules in order with a quick `npm install`.
2. Set up a virtualenv (for running Python scripts):
    1. `virtualenv -p python2.7 venv`
    2. `source venv/bin/activate`
3. Build `/public/index.html` by running `python build-html.py`.
4. Run a wee server from the `/public/` directory: `python -m SimpleHTTPServer`

## Changing HTML/CSS/JS

Run the default `gulp` task. This will watch for Sass/JS changes in `/assets/`,
re-build the CSS/JS files to `/public/assets/`, and inject them into
`/public/index.html`.

## Changing images

If you need to add/replace images (not photos), put them in `/assets/images/`
and run `gulp images` to optimize and move them to `/public/assets/images/`.

## Deploying to "production"

Run `gulp deploy`. This will generate uniquely named JS and CSS bundles and
inject them into `/public/index.html`. Cache bustin'. That old chestnut.

Next? You guessed it - open up an FTP program and manually drag the files in
`/public` up to the webserver like an animal. You aren't above this.

## Adding photos

Warning, this part is pretty bad because I haven't had to use it yet. If
necessity is the mother of invention, then potential necessity is the mother of
putting things off.

Okay. Found more photos to add to the mix? Great. Move all the photos in
`/raw_images/processed/` into `/raw_images/todo/`. Move the new photos into
`/raw_images/todo/` as well. Make sure you've set up and activated the virtual
environment, then run `python catalog-images.py`.

That's right, we're re-processing every single photo just to add a couple more!
How's that for terrible?

Next, run `python build-html.py`. This will re-generate `/public/index.html`
with all the photos (old & new). Boom. New photos added.

Finally, run `gulp photos`. This will optimize each photo in `/assets/photos/`
and save them to `/public/assets/photos/`.

### Things you can probably ignore

Unless you go find more external photos (like on Instagram), you're probably
done using `import.py`. Might as well keep it around though, right? Just in
case?
