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
  let fileName = 'default-name';
  let cropFiles = {};
  let croppedImageError = false;
  let entityForm = document.getElementById("entity-form");
  let submitFormButton = document.querySelector('#entity-form button[type="submit"]');

  if (cropperField.value) {
    let prepareCropperValues = JSON.parse(cropperField.value);
    for (let cv in prepareCropperValues) {
      cropperValues[cv] = prepareCropperValues[cv];
    }
  }

  addSaveFormButton();

  function loadFileName() {
    let linkFileName = document.querySelector('#media-preview > a').innerText;
    fileName = linkFileName.substring(0, linkFileName.lastIndexOf('.'));
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
    loadFileName();

    let cropperCanvas = cropper.getCroppedCanvas({ width: 160, height: 90 });
    let preview = cropper.getData();
    let cleanCropperType = cropperType.replace(/[^\w\s]/gi, '_');

    cropperValues[cropperType] = { cropped: { data: preview } };
    cropperValues[cropperType]['preview'] = preview;

    cropperCanvas.toBlob(function (blob) {
      cropFiles[cropperType] = new File([blob], fileName + '-' + cleanCropperType + ".png");
    });

    let cropperValuesStr = JSON.stringify(cropperValues);
    cropperField.value = cropperValuesStr;
    updateCropButton();
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

    let oldDeleteCropButton = document.getElementById("delete-crop");
    oldDeleteCropButton?.remove();

    switch (previewCrop) {
      case 1:
        cropButtonText = "Save crop change";
        cropButtonClass = "mt-2 btn btn-warning";
        createResetCropButton();
        createDeleteCropButton();
        break;
      case 2:
        cropButtonText = "Crop saved";
        cropButtonClass = "mt-2 btn btn-success";
        createDeleteCropButton();
        break;
    }

    cropButton.className = cropButtonClass;
    cropButton.innerHTML = cropButtonText;
  }

  function createDeleteCropButton() {
    let deleteCropButton = document.createElement('a');
    deleteCropButton.setAttribute('href', '#');
    deleteCropButton.setAttribute('id', 'delete-crop');
    deleteCropButton.className = "ml-2 mt-2 btn btn-danger";
    deleteCropButton.innerHTML = "Remove crop";
    deleteCropButton.onclick = deleteCropAction;
    cropPreview.append(deleteCropButton);
  }

  function createResetCropButton() {
    let resetCropButton = document.createElement('a');
    resetCropButton.setAttribute('href', '#');
    resetCropButton.setAttribute('id', 'reset-crop');
    resetCropButton.className = "ml-2 mt-2 btn btn-info";
    resetCropButton.innerHTML = "Reset crop";
    resetCropButton.onclick = resetCropAction;
    cropPreview.append(resetCropButton);
  }

  function resetCropAction(e) {
    e.preventDefault();
    let currentData = cropperValues[cropperType]['cropped']['data'];

    cropper.setData(currentData);
    cropperValues[cropperType]['preview'] = currentData;

    let cropperValuesStr = JSON.stringify(cropperValues);

    cropperField.value = cropperValuesStr;
    updateCropButton();
  }

  async function deleteCropAction(e) {
    e.preventDefault();

    delete cropperValues[cropperType]['cropped'];
    delete cropFiles[cropperType];

    let cropperValuesStr = JSON.stringify(cropperValues);

    cropperField.value = cropperValuesStr;
    updateCropButton();
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

  function addSaveFormButton() {
    let saveFormButton = document.createElement('a');
    saveFormButton.setAttribute('href', '#');
    saveFormButton.setAttribute('id', 'save-form-crop');
    saveFormButton.className = "btn btn-dark";
    saveFormButton.innerHTML = "Save";
    saveFormButton.onclick = saveForm;
    submitFormButton.style.display = 'none';
    submitFormButton.parentElement.append(saveFormButton);
  }

  function saveForm(e) {
    e.preventDefault();
    cropAlert.className += ' d-none';

    for (var i = 0; i < entityForm.elements.length; i++) {
      if (
        entityForm.elements[i].value === '' &&
        entityForm.elements[i].hasAttribute('required')
      ) {
        cropAlert.classList.remove('d-none');
        cropAlert.innerHTML = 'There are some required fields.';
        return false;
      }
    }

    if (!cropFiles || Object.keys(cropFiles).length === 0) {
      submitFormButton.click();
      return;
    }

    let croppedFilesValues = Object.values(cropFiles);
    let valuesLength = croppedFilesValues.length;

    croppedFilesValues.forEach(async (crop, index) => {
      let cropTypeKey = Object.keys(cropFiles)[index];
      await generateCroppedImage(crop, cropTypeKey);

      if (valuesLength === index + 1 && !croppedImageError) {
        submitFormButton.click();
      }
    });
  }

  async function generateCroppedImage(crop, cropTypeKey) {
    let form = new FormData();
    form.append('crop', crop);
    let result = await fetch('/media/image', {
      method: 'POST',
      body: form,
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      }
      return false;
    });

    if (result && result['crop']) {
      let file = Object.values(result)[0];

      if ("url" in file) {
        cropperValues[cropTypeKey]['cropped']['crop'] = result['crop'];

        let cropperValuesStr = JSON.stringify(cropperValues);
        cropperField.value = cropperValuesStr;
      }
    } else {
      croppedImageError = true;
      cropAlert.classList.remove('d-none');
      cropAlert.innerHTML = 'Error uploading cropped image.';
    }
    return result;
  }
});
