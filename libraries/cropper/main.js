document.addEventListener('DOMContentLoaded', function () {
  let mediaPreview = document.getElementById("media-preview");
  let cropperOptions = document.getElementById("cropperOptions");
  let cropPreview = document.getElementById("cropPreview");
  let cropperField = document.querySelector("input#cropper");
  let cropperValues = new Map();
  let cropperType = cropperOptions.querySelector('li.active a')?.getAttribute('data-aspect-ratio');
  let cropper;

  const callback = function () {
    let image = mediaPreview.querySelector('img');
    let oldCropPreview = cropPreview.querySelector('img');
    let options = {
      aspectRatio: 16 / 9,
      zoomable: false,
      cropend: cropend,
    };

    if (oldCropPreview) oldCropPreview.remove();
    if (cropper) cropper.destroy();

    let newCropPreview = document.createElement("img");
    newCropPreview.setAttribute('src', image.src);
    cropPreview.append(newCropPreview);
    cropper = new Cropper(newCropPreview, options);
  };

  let config = { childList: true };
  let observer = new MutationObserver(callback);
  observer.observe(mediaPreview, config);

  let options = cropperOptions.querySelectorAll('a');

  for (var i = 0; i < options.length; i++) {
    options[i].onclick = changeCropType;
  }

  function changeCropType(e) {
    e.preventDefault();
    let active = cropperOptions.querySelector('li.active');
    active?.classList.remove("active");
    this.parentNode.className += ' active';
    cropperType = this.getAttribute('data-aspect-ratio');
    //if (cropper) cropper.reset();
  }

  function cropend() {
    let cropBoxData = cropper.getCropBoxData();
    cropperValues.set(cropperType, cropBoxData);
    let cropperValuesStr = JSON.stringify(Array.from(cropperValues.entries()));
    cropperField.value = cropperValuesStr;
    console.log(cropperField);
    console.log(cropperValues);
  }
});
