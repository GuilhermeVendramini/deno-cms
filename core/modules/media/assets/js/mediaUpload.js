$(document).ready(function () {
  let buttonUpload = $("#media-upload");

  buttonUpload.click(async function (e) {
    e.preventDefault();
    let media = $('input.media:file');
    let type = media.data('type');
    let files = media.prop('files');
    let name = media.attr('name');
    let form = new FormData();

    for (let i = 0; i < files.length; i++) {
      form.append(`${name}_${i}`, files[i]);
    }
    let res = await fetch('/media/' + type, {
      method: 'POST',
      body: form,
    }).then(function (response) {

      if (response.ok) {
        return response.json();
      }

      return false;
    });

    console.log(res);
  });
});