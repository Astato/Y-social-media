const mediaHandler = (e) => {
  const filesize = e.target.files[0].size;
  if (filesize > 26214400) {
    e.target = "";
    // return setShowErrorMessage("flex");
    return null;
  }
  const reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  let array = [];
  reader.onloadend = () => {
    const result = reader.result;
    array.push(e.target.files[0]);
    return array.push(result);

    // setImageData(result);
    // setUploadedImage(e.target.files[0]);
  };
  return array;
  return reader.result;
};

export default mediaHandler;
