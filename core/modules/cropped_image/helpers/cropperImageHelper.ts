export default {
  async getAllCropperFiles(cropper: string): Promise<any[]> {
    let cropperData: any = JSON.parse(cropper);
    let cropperValues = Object.values(cropperData);
    let files: string[] = [];

    cropperValues.forEach((value: any) => {
      let crop: any;
      if ((crop = value?.cropped?.crop)) {
        files.push(crop.url);
      }
    });

    return files;
  },
};
