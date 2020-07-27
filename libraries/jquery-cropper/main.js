document.addEventListener('DOMContentLoaded', function () {
  let mediaPreview = document.getElementById("media-preview");
  let cropperTabContent = document.getElementById("cropperTabContent");
  let cropsPreview = cropperTabContent.querySelectorAll("div.crop-preview");

  const callback = function () {
    let image = mediaPreview.querySelector('img');

    cropsPreview.forEach((crop) => {
      let oldCropPreview = crop.querySelector('img');

      if (oldCropPreview) oldCropPreview.remove();

      let newCropPreview = document.createElement("img");
      newCropPreview.setAttribute('src', image.src);
      crop.append(newCropPreview);
    });
  };

  let config = { childList: true };
  let observer = new MutationObserver(callback);
  observer.observe(mediaPreview, config);
});
