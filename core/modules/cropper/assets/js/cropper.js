document.addEventListener('DOMContentLoaded', function () {
  let mediaPreview = document.getElementById("media-preview");
  let cropperOptions = document.getElementById("cropperOptions");
  let cropPreview = document.getElementById("cropPreview");
  let cropperField = document.querySelector("input#cropper");
  let cropperValues = {};
  let cropperType = cropperOptions.querySelector('li.active a')?.getAttribute('data-aspect-ratio');
  let cropperTypeValue;
  let cropper;
  let cropAlert = document.getElementById("crop-alert");
  let currentTempFile;

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

    let oldCropActionButton = document.getElementById("crop-action");
    oldCropActionButton?.remove();
    let cropActionButton = document.createElement('a');
    cropActionButton.setAttribute('href', '#');
    cropActionButton.setAttribute('id', 'crop-action');
    cropActionButton.onclick = cropAction;
    cropPreview.append(cropActionButton);
    cropper = new Cropper(newCropPreview, options);
    updateCropButton();
  };

  function comparePreviewCrop() {
    let preview;
    let crop;

    if (
      cropperValues[cropperType] &&
      cropperValues[cropperType]['cropped'] &&
      cropperValues[cropperType]['cropped']['data']
    ) {
      crop = cropperValues[cropperType]['cropped']['data'];
    } else {
      return 0;
    }

    if (
      cropperValues[cropperType] &&
      cropperValues[cropperType]['preview']
    ) preview = cropperValues[cropperType]['preview'];

    if (
      crop.height !== preview.height ||
      crop.width !== preview.width ||
      crop.x !== preview.x ||
      crop.y !== preview.y
    ) return 1;

    return 2;
  }

  async function cropAction(e) {
    e.preventDefault();
    let cropperCanvas = cropper.getCroppedCanvas({ width: 160, height: 90 });
    cropperCanvas.toBlob(async function (blob) {
      let file = new File([blob], "filename.png");
      await uploadMedia(file);
      updateCropButton();
    });
  }

  async function uploadMedia(file) {
    let form = new FormData();
    form.append(`media`, file);
    let result = await fetch('/media/temporary/image', {
      method: 'POST',
      body: form,
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      }
      return false;
    });

    if (result) {
      let file = Object.values(result)[0];

      if ("tempfile" in file) {
        await removeTempFile();
        let preview = cropper.getData();
        if (
          cropperValues[cropperType] &&
          cropperValues[cropperType]['cropped']
        ) {
          cropperValues[cropperType]['cropped'] = result;
        } else {
          cropperValues[cropperType] = { cropped: result };
        }

        cropperValues[cropperType]['cropped']['data'] = preview;
        cropperValues[cropperType]['preview'] = preview;

        let cropperValuesStr = JSON.stringify(cropperValues);
        cropperField.value = cropperValuesStr;
      }
    } else {
      cropAlert.classList.remove('d-none');
      cropAlert.innerHTML = 'Error uploading cropped image.';
    }
    return result;
  }

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
    if (
      cropperValues[cropperType] &&
      cropperValues[cropperType]['preview']
    ) cropperTypeValue = cropperValues[cropperType];
    cropper.reset();
    cropper.setAspectRatio(eval(cropperType));

    if (cropperTypeValue) cropper.setData(cropperTypeValue['preview']);

    updateCropButton();
  }

  function cropReady() {
    if (
      cropperValues[cropperType] &&
      cropperValues[cropperType]['preview']
    ) cropperTypeValue = cropperValues[cropperType];
    if (cropperTypeValue) cropper.setData(cropperTypeValue['preview']);
  }

  function updateCropButton() {
    let cropButton = document.getElementById("crop-action");
    let previewCrop = comparePreviewCrop();
    let cropButtonText = "Create crop";
    let cropButtonClass = "mt-2 btn btn-secondary";
    let oldResetCropButton = document.getElementById("reset-crop");
    oldResetCropButton?.remove();

    switch (previewCrop) {
      case 1:
        cropButtonText = "Save crop change";
        cropButtonClass = "mt-2 btn btn-warning";

        let resetCropButton = document.createElement('a');
        resetCropButton.setAttribute('href', '#');
        resetCropButton.setAttribute('id', 'reset-crop');
        resetCropButton.className = "ml-2 mt-2 btn btn-info";
        resetCropButton.innerHTML = "Reset";
        resetCropButton.onclick = cropResetAction;
        cropPreview.append(resetCropButton);
        break;
      case 2:
        cropButtonText = "Crop saved";
        cropButtonClass = "mt-2 btn btn-success";
        break;
    }

    cropButton.className = cropButtonClass;
    cropButton.innerHTML = cropButtonText;
  }

  function cropResetAction(e) {
    e.preventDefault();
    cropper.setData(cropperValues[cropperType]['cropped']['data']);
  }

  function cropend() {
    let cropData = cropper.getData();
    if (
      cropperValues[cropperType] &&
      cropperValues[cropperType]['preview']
    ) {
      cropperValues[cropperType]['preview'] = cropData;
    } else {
      cropperValues[cropperType] = { preview: cropData };
    }

    let cropperValuesStr = JSON.stringify(cropperValues);
    cropperField.value = cropperValuesStr;
    updateCropButton();
  }

  async function removeTempFile() {
    let result = true;
    cropAlert.className = 'd-none';
    let oldCropped;

    if (cropperValues[cropperType] &&
      (oldCropped = cropperValues[cropperType]['cropped'])
    ) {
      let tempFile = oldCropped.media.tempfile;
      currentTempFile = tempFile.substring(tempFile.lastIndexOf('/'));
    }

    if (!currentTempFile) return true;

    result = await fetch("/temp_uploads/delete" + currentTempFile, {
      method: 'POST',
    }).then(function (response) {
      if (response.ok) {
        currentTempFile = '';
        return response;
      }

      cropAlert.classList.remove('d-none');
      cropAlert.innerHTML = 'Error deleting cropped image';
      return false;
    });

    return result;
  }
});
