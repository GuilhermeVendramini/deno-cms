document.addEventListener('DOMContentLoaded', function () {
  let mediaPreview = document.getElementById("media-preview");
  let cropperOptions = document.getElementById("cropperOptions");
  let cropPreview = document.getElementById("cropPreview");
  let cropperField = document.querySelector("input#cropper");
  let cropperValues = {};
  let cropperType = cropperOptions.querySelector('li.active a')?.getAttribute('data-aspect-ratio');
  let cropperTypeValue;
  let cropper;

  if (cropperField.value) {
    let prepareCropperValues = JSON.parse(cropperField.value);
    for (let cv in prepareCropperValues) {
      cropperValues[cv] = prepareCropperValues[cv];
    }
  }

  const callback = function () {
    let image = mediaPreview.querySelector('img');
    let oldCropPreview = cropPreview.querySelector('img');
    let options = {
      aspectRatio: eval(cropperType),
      zoomable: false,
      cropend: cropend,
      ready: cropReady,
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
    cropperTypeValue = cropperValues[cropperType];
    cropper.reset();
    cropper.setAspectRatio(eval(cropperType));

    if (cropperTypeValue) cropper.setData(cropperTypeValue);
  }

  function cropReady() {
    if (cropperValues) cropperTypeValue = cropperValues[cropperType];
    if (cropperTypeValue) cropper.setData(cropperTypeValue);
  }

  function cropend() {
    let cropData = cropper.getData();
    cropperValues[cropperType] = cropData;
    let cropperValuesStr = JSON.stringify(cropperValues);
    cropperField.value = cropperValuesStr;
  }
});
