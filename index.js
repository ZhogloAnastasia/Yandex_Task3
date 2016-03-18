(function(){
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var filter = document.getElementById('filter');
    var canvasContext = canvas.getContext('2d');

    var filterName = 'invert';

    filter.addEventListener('change', function() {
        filterName = filter.value;
    }, false);

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||  navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.addEventListener('play', function() {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;

                        callback();
                    }, false);
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var applyFilterToPixel = function (imageData, i) {
        var filters = {
            invert: function (imageData, i) {
                imageData[i] = 255 - imageData[i];
                imageData[i + 1] = 255 - imageData[i + 1];
                imageData[i + 2] = 255 - imageData[i + 2];
            },
            grayscale: function (imageData, i) {
                var r = imageData[i];
                var g = imageData[i + 1];
                var b = imageData[i + 2];

                var value = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                imageData[i] = imageData[i + 1] = imageData[i + 2] = value;
            },
            threshold: function (imageData, i) {
                var r = imageData[i];
                var g = imageData[i + 1];
                var b = imageData[i + 2];

                var value = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;

                imageData[i] = imageData[i + 1] = imageData[i + 2] = value;
            }
        };

        filters[filterName](imageData, i);
    };

    var applyFilter = function () {
        var image = canvasContext.getImageData(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
        var imageDataLength = image.data.length;
        var imageData = image.data;

        for (var i = 0; i < imageDataLength; i += 4) {
            applyFilterToPixel(imageData, i);
        }

        image.data = imageData

        canvasContext.putImageData(image, 0, 0);
    };

    var captureFrame = function () {
        canvasContext.drawImage(video, 0, 0);
        applyFilter();
    };

    getVideoStream(function () {
        captureFrame();

        setInterval(captureFrame, 33); // for 30 fps
    });
})();