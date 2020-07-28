document.addEventListener('DOMContentLoaded', function () {
  let mediaPreview = document.getElementById("media-preview");
  //let cropperOptions = document.getElementById("cropperOptions");
  let cropPreview = document.getElementById("cropPreview");

  const callback = function () {
    let image = mediaPreview.querySelector('img');
    let oldCropPreview = cropPreview.querySelector('img');
    let options = {
      aspectRatio: 16 / 9,
      zoomable: false,
    };

    if (oldCropPreview) oldCropPreview.remove();

    let newCropPreview = document.createElement("img");
    newCropPreview.setAttribute('src', image.src);
    cropPreview.append(newCropPreview);
    new Cropper(newCropPreview, options);
  };

  let config = { childList: true };
  let observer = new MutationObserver(callback);
  observer.observe(mediaPreview, config);
});
