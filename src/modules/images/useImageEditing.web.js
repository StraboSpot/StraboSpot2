const useImageEditing = (props) => {

  const resizeImage = async (height, width, url) => {
    console.log('RESIZING WEB IMAGE');
    return {height, width};
  };
  return {
    resizeImage: resizeImage,
  };
};

export default useImageEditing;
