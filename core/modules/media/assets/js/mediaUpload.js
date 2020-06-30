$(document).ready(function () {
  let buttonUpload = $("#media-upload");
  let buttonRemove = $("#media-remove");
  let mediaInput = $("#media-input");
  let mediaDisplay = $("#media-display");
  let mediapreview = $("#media-preview");
  let mediaAlert = $("#media-alert");
  let currentTempFile = '';
  let media = $("#media");

  showCurrentValue()

  function showCurrentValue() {
    let mediaVal = media.val();

    if (mediaVal) {
      mediaInput.find('input').removeAttr("required");
      mediaInput.addClass("d-none");
      mediaDisplay.removeClass("d-none");
      let mediaName = mediaVal.substring(mediaVal.lastIndexOf('/'));

      let preview = `
        <img src="/${mediaVal}" height="100">
        <a href="/${mediaVal}" target="_blank">${mediaName}</a>
      `;

      mediapreview.html(preview);
    }
  }

  buttonUpload.click(async function (e) {
    e.preventDefault();
    let result = await uploadImage(true);

    if (result) {
      await removeTempFile();
      mediaInput.addClass("d-none");
      mediaDisplay.removeClass("d-none");

      let file = Object.values(result)[0];
      let url = file.tempfile;
      let tempName = url.substring(url.lastIndexOf('/'));
      let preview = `
        <img src="/temp_uploads${tempName}" height="100">
        <a href="/temp_uploads${tempName}" target="_blank">${file.filename}</a>
      `;

      currentTempFile = tempName;

      mediapreview.html(preview);
    } else {
      mediaAlert.removeClass('d-none');
      mediaAlert.html('Error uploading file');
    }
  });

  async function removeTempFile() {
    let result = true;
    mediaAlert.addClass('d-none');

    if (currentTempFile) {
      result = await fetch("/temp_uploads/delete" + currentTempFile, {
        method: 'POST',
      }).then(function (response) {
        if (response.ok) {
          currentTempFile = '';
          return response;
        }

        mediaAlert.removeClass('d-none');
        mediaAlert.html('Error deleting file');
        return false;
      });
    }

    return result;
  }

  buttonRemove.click(async function (e) {
    e.preventDefault();
    let result = await removeTempFile();

    if (result) {
      mediaInput.find('input').val('');
      mediaInput.removeClass("d-none");
      mediaDisplay.addClass("d-none");
    }
  });

  async function uploadImage(temporary = false) {
    mediaAlert.addClass('d-none');
    let input = $('input.media:file');
    let type = input.data('type');
    let files = input.prop('files');
    let name = input.attr('name');
    let form = new FormData();

    if (media.val()) {
      return true;
    }

    if (files.length <= 0) {
      mediaAlert.removeClass('d-none');
      mediaAlert.html('File is required');
      return false;
    }

    for (let i = 0; i < files.length; i++) {
      form.append(`${name}_${i}`, files[i]);
    }

    let endPoint = '/media/' + type;

    if (temporary) {
      endPoint = '/media/temporary/' + type;
    }

    let result = await fetch(endPoint, {
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

      if ("url" in file) {
        media.val(`${file.url}`);
      }
    }

    return result;
  }



  $('#entity-form').submit(async function (e) {
    window.onbeforeunload = null;
    e.preventDefault();

    let uploadResult = await uploadImage();

    if (uploadResult) {
      await removeTempFile();
      $(this).unbind('submit').submit();
    }
  });

  window.onbeforeunload = async function () {
    await removeTempFile();
  };

});