$(document).ready(function () {
  let buttonUpload = $("#media-upload");
  let buttonRemove = $("#media-remove");
  let mediaInput = $("#media-input");
  let mediaValue = $("#media-value");
  let mediapreview = $("#media-preview");
  let mediaAlert = $("#media-alert");

  buttonUpload.click(async function (e) {
    e.preventDefault();
    let result = await uploadImage(true);

    if (result) {
      mediaInput.addClass("d-none");
      mediaValue.removeClass("d-none");

      let file = result.file_0;
      let url = file.tempfile;
      let tempName = url.substring(url.lastIndexOf('/'));
      let preview = `
        <img src="/temp_uploads${tempName}" height="100">
        <a href="/temp_uploads${tempName}" target="_blank">${file.filename}</a>
      `;

      mediapreview.html(preview);
    } else {
      mediaAlert.removeClass('d-none');
      mediaAlert.html('Error uploading file');
    }
  });

  buttonRemove.click(async function (e) {
    e.preventDefault();
    console.log('remove');
  });

  async function uploadImage(temporary = false) {
    mediaAlert.addClass('d-none');
    let media = $('input.media:file');
    let type = media.data('type');
    let files = media.prop('files');
    let name = media.attr('name');
    let form = new FormData();

    if (files.length <= 0) {
      mediaAlert.removeClass('d-none');
      mediaAlert.html('File is required');
      return;
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

    return result;
  }
});