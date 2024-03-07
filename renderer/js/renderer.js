const { ipcRenderer } = require('electron');

const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertMsg('Please select an image', 'error');
    return;
  }

  alertMsg('Success!', 'success');

  // get original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = 'block';
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

// send image data to main
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (width == '' || height == '') {
    alertMsg('Please fill in the height and width values!', 'error');
    return;
  }

  if (!img.files[0]) {
    alertMsg('Please upload an image...', 'error');
  }

  // send to main using IPCRenderer
  ipcRenderer.send('image:resize', { imgPath, width, height });
}

// check that file is an image file
function isFileImage(file) {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpg'];
  return file && acceptedImageTypes.includes(file['type']);
}

function alertMsg(message, type = 'success') {
  Toastify.toast({
    text: message,
    duration: 5000,
    gravity: 'bottom',
    position: 'right',
    close: false,
    style: {
      background: type == 'error' ? 'red' : 'green',
      color: 'white',
      textAlign: 'center',
      position: 'absolute',
    },
  });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);
