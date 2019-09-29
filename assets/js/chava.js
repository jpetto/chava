(function(Hammer, LazyLoad) {
    var html = document.documentElement;
    var imageList = document.querySelector('#images');
    var imageLinks = document.querySelectorAll('.image-link');
    var imageLinksLength = imageLinks.length;
    var lightbox = document.querySelector('#lightbox');
    var lightboxImg = document.querySelector('#lightbox-img');
    var lightboxImgWrapper = document.querySelector('#lightbox-img-wrapper');
    var lightboxShare = document.querySelector('#lightbox-share');
    var lightboxClose = document.querySelector('#lightbox-close');
    var mqWide = window.matchMedia('(min-width: 600px)');

    // remember image currently shown in lightbox
    var currentImageId;

    // get photos to loadin'
    new LazyLoad({
        elements_selector: '.photo'
    });

    // set up touch events on lightbox
    var mc = new Hammer(lightbox);

    // determine which image to show - 300w or 600w
    var chooseLightboxImageSource = function(imageLink) {
        return (mqWide.matches) ? imageLink.href : imageLink.dataset.medium;
    };

    var openLightbox = function(imageLink) {
        var imageSrc = chooseLightboxImageSource(imageLink);

        lightboxImgWrapper.classList.add('loading');

        currentImageId = imageLink.getAttribute('id');

        // update lightbox image
        lightboxImg.setAttribute('src', imageSrc);
        lightboxImg.dataset.fullSizeUrl = imageLink.href;

        // show lightbox
        lightbox.classList.add('open');
        html.classList.add('lightboxed');

        // fade-in lightbox
        setTimeout(function() {
            lightbox.classList.add('loaded');
        }, 20);

        // handle lightbox related events
        window.addEventListener('keyup', handleKeyPress);
    };

    // shows next image in the list
    var handleLightboxImageClick = function(dir) {
        dir = dir || 'next';
        var nextId;
        var nextImageLink;
        var nextSrc;

        lightboxImgWrapper.classList.add('loading');

        // find the next image in the set
        for (var i = 0; i < imageLinksLength; i++) {
            if (imageLinks[i].getAttribute('id') === currentImageId) {
                if (dir === 'next') {
                    if (i < imageLinksLength - 1) {
                        nextId = imageLinks[i + 1].getAttribute('id');
                    } else {
                        nextId = imageLinks[0].getAttribute('id');
                    }
                } else {
                    if (i > 0) {
                        nextId = imageLinks[i - 1].getAttribute('id');
                    } else {
                        nextId = imageLinks[imageLinksLength - 1].getAttribute('id');
                    }
                }

                break;
            }
        }

        nextImageLink = document.querySelector('#' + nextId);

        // determine src based on viewport width
        nextSrc = chooseLightboxImageSource(nextImageLink);

        // set new lightbox image source & full size URL
        lightboxImg.setAttribute('src', nextSrc);
        lightboxImg.dataset.fullSizeUrl = nextImageLink.href;

        currentImageId = nextId;
    };

    // closes lightbox when escape key is pressed
    var handleKeyPress = function(e) {
        switch (e.keyCode) {
            case 27: // escape
                closeLightbox();
                break;
            case 39: // right arrow
                handleLightboxImageClick('next');
                break;
            case 37: // left arrow
                handleLightboxImageClick('previous');
                break;
        }
    };

    var closeLightbox = function() {
        // hide lightbox
        lightbox.classList.remove('loaded');

        // give css opacity transition time to complete
        setTimeout(function() {
            lightbox.classList.remove('open');
            html.classList.remove('lightboxed');
        }, 210);

        // remove lightbox related listeners
        window.removeEventListener('keyup', handleKeyPress);
    };

    // delegation technique shamelessly ripped from
    // http://codepen.io/32bitkid/post/understanding-delegated-javascript-events

    var imageLinkFilter = function(el) {
        return el.classList && el.classList.contains('image-link');
    };

    var imageLinkHandler = function(e) {
        e.preventDefault();

        var imageLink = e.delegateTarget;

        openLightbox(imageLink);
    };

    var delegate = function(criteria, listener) {
        return function(e) {
            var el = e.target;

            do {
                if (!criteria(el)) continue;
                e.delegateTarget = el;
                listener.apply(this, arguments);
                return;
            } while( (el = el.parentNode) );
        };
    };

    // listen for clicks on image list (delegated to images)
    imageList.addEventListener('click', delegate(imageLinkFilter, imageLinkHandler));

    // listen for clicks on the lightbox (and children)
    lightbox.addEventListener('click', function(e) {
        switch (e.target.id) {
            case 'lightbox-img':
                handleLightboxImageClick();
                break;
            case 'lightbox-share':
                e.preventDefault();
                window.open(lightboxImg.dataset.fullSizeUrl);
                break;
            case 'lightbox-close':
            case 'lightbox':
                closeLightbox();
                break;
        }
    });

    // remove loading view when each lightbox image finishes loading
    lightboxImg.addEventListener('load', function(e) {
        lightboxImgWrapper.classList.remove('loading');
    });

    // listen for swipes on lightbox
    mc.on('swipe', function(e) {
        var dir;

        if (e.direction === 2) {
            dir = 'next';
        } else if (e.direction === 4) {
            dir = 'previous';
        }

        handleLightboxImageClick(dir);
    });
})(window.Hammer, window.LazyLoad);
