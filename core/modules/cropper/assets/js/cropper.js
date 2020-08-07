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
  //let currentTempFile;
  let fileName = 'default-name';
  let cropFiles = {};

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
      //await uploadTempFile(file);
    });

    let cropperValuesStr = JSON.stringify(cropperValues);
    cropperField.value = cropperValuesStr;
    updateCropButton();
    // cropperCanvas.toBlob(async function (blob) {
    //   //let file = new File([blob], "filename.png");
    //   //await uploadTempFile(file);
    //   let preview = cropper.getData();

    //   // if (
    //   //   cropperValues[cropperType] &&
    //   //   cropperValues[cropperType]['cropped']
    //   // ) {
    //   //   cropperValues[cropperType]['cropped'] = result;
    //   // } else {
    //   //   cropperValues[cropperType] = { cropped: result };
    //   // }
    // });
  }

  // async function uploadTempFile(file) {
  //   let form = new FormData();
  //   form.append('media', file);
  //   let result = await fetch('/media/temporary/image', {
  //     method: 'POST',
  //     body: form,
  //   }).then(function (response) {
  //     if (response.ok) {
  //       return response.json();
  //     }
  //     return false;
  //   });

  //   if (result) {
  //     let file = Object.values(result)[0];

  //     if ("tempfile" in file) {
  //       await removeTempFile();
  //       let preview = cropper.getData();
  //       if (
  //         cropperValues[cropperType] &&
  //         cropperValues[cropperType]['cropped']
  //       ) {
  //         cropperValues[cropperType]['cropped'] = result;
  //       } else {
  //         cropperValues[cropperType] = { cropped: result };
  //       }

  //       cropperValues[cropperType]['cropped']['data'] = preview;
  //       cropperValues[cropperType]['preview'] = preview;

  //       let cropperValuesStr = JSON.stringify(cropperValues);
  //       cropperField.value = cropperValuesStr;
  //     }
  //   } else {
  //     cropAlert.classList.remove('d-none');
  //     cropAlert.innerHTML = 'Error uploading cropped image.';
  //   }
  //   return result;
  // }

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
    //await removeTempFile();
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

  // async function removeTempFile() {
  //   let result = true;
  //   cropAlert.className += ' d-none';
  //   let oldCropped;

  //   if (cropperValues[cropperType] &&
  //     (oldCropped = cropperValues[cropperType]['cropped'])
  //   ) {
  //     let tempFile = oldCropped.media.tempfile;
  //     currentTempFile = tempFile.substring(tempFile.lastIndexOf('/'));
  //   }

  //   if (!currentTempFile) return true;

  //   result = await fetch("/temp_uploads/delete" + currentTempFile, {
  //     method: 'POST',
  //   }).then(function (response) {
  //     if (response.ok) {
  //       currentTempFile = '';
  //       return response;
  //     }

  //     cropAlert.classList.remove('d-none');
  //     cropAlert.innerHTML = 'Error deleting cropped image';
  //     return false;
  //   });

  //   return result;
  // }

  function addSaveFormButton() {
    let saveFormButton = document.createElement('a');
    saveFormButton.setAttribute('href', '#');
    saveFormButton.setAttribute('id', 'save-form-crop');
    saveFormButton.className = "btn btn-dark";
    saveFormButton.innerHTML = "Save All";
    saveFormButton.onclick = saveForm;
    let submitFormButton = document.querySelector('#entity-form button[type="submit"]');
    submitFormButton.style.display = 'none';
    submitFormButton.parentElement.append(saveFormButton);
  }

  function saveForm(e) {
    e.preventDefault();

    // if (!cropperValues || Object.keys(cropperValues).length <= 0) return null;

    // let cropFiles = {};
    // let values = Object.values(cropperValues);

    // values.forEach((_, i) => {
    //   let cropperTypeKey = Object.keys(cropperValues)[i];

    //   if (
    //     cropperValues[cropperTypeKey]['cropped'] &&
    //     (croppedData = cropperValues[cropperTypeKey]['cropped']['data'])
    //   ) {
    //     let cleanCropperType = cropperTypeKey.replace(/[^\w\s]/gi, '_');
    //     cropper.setData(croppedData)
    //     let cropperCanvas = cropper.getCroppedCanvas({ width: 160, height: 90 });
    //     //await removeTempFile();

    //     cropperCanvas.toBlob(function (blob) {
    //       cropFiles[cropperTypeKey] = new File([blob], fileName + '-' + cleanCropperType + ".png");
    //       //await uploadTempFile(file);
    //     });
    //   }

    // });

    console.log(cropFiles);

    // let cropperCanvas = cropper.getCroppedCanvas({ width: 160, height: 90 });
    // cropperCanvas.toBlob(async function (blob) {
    //   let file = new File([blob], "filename.png");
    //   await uploadTempFile(file);
    //   updateCropButton();
    // });
  }

  async function uploadFiles() {
    let form = new FormData();
    form.append('media', file);
    let result = await fetch('/media/image', {
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
        //await removeTempFile();
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
});
