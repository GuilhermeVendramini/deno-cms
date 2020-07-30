window.onload = function () {
  let cropperView = document.querySelectorAll('canvas.cropper-view');
  let imagesByID = new Map();
  if (!cropperView || cropperView.length <= 0) return;

  cropperView.forEach((c) => {
    let imgID = c.getAttribute('data-img-id');
    let crop = JSON.parse(c.getAttribute('data-crop'));
    let img;
    if (!(img = imagesByID.get(imgID))) {
      img = document.getElementById(imgID);
      imagesByID.set(imgID, img);
    };
    console.log(crop);
    let ctx = c.getContext("2d");
    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
  });
};