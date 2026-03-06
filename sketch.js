import {FPS} from './lib/JSGenerativeArtTools/fps/fps.js';
import {scaleCanvasToFit, prepareP5Js} from './lib/JSGenerativeArtTools/utils.js';
import {intialize_toolbar} from './toolbar.js';
import { Recorder } from './lib/JSGenerativeArtTools/record/record.js';
import {PixelCam} from './lib/JSGenerativeArtTools/pixelCam/pixelCam.js';

// The desired artwork size in which everything is pixel perfect.
// Let the canvas resize itself to fit the screen in "scaleCanvasToFit()" function.
// Note that if the size is too small it will look blurry on bigger screens, that is why
// we set "pixelDensity(4)" in this example (400x400 is pretty small).
// If you target size is bigger you can reduce that value. e.g. "pixelDensity(2)".
// Inputs
// Main
let SizeInputs

// Defaults
// Main
export const defaultArtworkWidth = 1280;
export const defaultArtworkHeight = 720;
export const defaultArtworkSeed = -1;
export const defaultPixelSize = 4;
export const defaultFPS = 10;

// Variables
// Main
let artworkWidth;
let artworkHeight;
let workingImageWidth;
let workingImageHeight;
export let artwork_seed; // -1 used for random seeds, if set to a positive integer the number is used

// To check if user loaded an image or default one is loaded
let loaded_user_image = false;
const videoFormats = ['mp4']
let image_loaded_successfuly = false;
let useInputFile = false;
let useInputFileResolution = false;
let inputFileResolutionScale = 4.;
let prevPixelSize;

const pixel_density = 1;
let canvas;

let img;
let myFont;
let color_buffer;
let interface_color_buffer;

const imgFile = 'img/waterfall.jpg'

const animationsFramesPathsDict = {
  0: 'img/mockup/0.png',
  1: 'img/mockup/1.png',
  2: 'img/mockup/2.png',
  3: 'img/mockup/3.png',
  4: 'img/mockup/4.png',
  5: 'img/mockup/5.png',
  6: 'img/mockup/6.png',
  7: 'img/mockup/7.png',
  8: 'img/mockup/8.png',
  9: 'img/mockup/9.png',
}

let current_image_path;

let spritesheets = {}; // dict for all the spritesheets in a single texture (grid) {0: image-grid, 1: image-grid, ...}
let spritesheets_atlas;
let numberOfFrames = 4;

export let fps;
export let recorder;
let inputs;

export let pixelCam;
let camera;

function preload() {
  artwork_seed = prepareP5Js(defaultArtworkSeed); // Order is important! First setup randomness then prepare the token
  myFont = loadFont('./fonts/PixelifySans-Medium.ttf');
  current_image_path = imgFile
  console.log('Loaded image: ', current_image_path)
  img = loadImage(
    current_image_path,
    () => { image_loaded_successfuly = true; },
    () => { image_loaded_successfuly = false; }
  )

  pixelCam = new PixelCam();

  spritesheets = loadFrames(animationsFramesPathsDict, () => {console.log('Loaded all spritesheets')})
}

function setup() {
  recorder = new Recorder()
  fps = new FPS()
  fps.setFPS(defaultFPS)

  inputs = intialize_toolbar();
  SizeInputs = inputs.sizeInputs;

  recorder.setSketchFPSMethod(() => {return fps.getFPS()})
  recorder.setCaptureSingleFrameMethod(() => {saveImage()})

  updateArtworkSettings()

  // Create Canvas
  canvas = createCanvas(artworkWidth, artworkHeight, WEBGL);

  // Create Camera
  if (!useInputFile) camera = create_camera_input();

  // Move Canvas to canvas-wrapper div
  canvas.parent("canvas-wrapper")

  // Set pixelDensity
  canvas.pixelDensity(pixel_density);
  
  pixelCam.initializeShader()

  // Apply the loaded font
  textFont(myFont);

  // Define ASCII string
  let asciiStr = ".,:;i1@tfLCG08";

  // Set color levels and grid size vars depending on ascii string
  // let colorLevels = asciiStr.length;
  // pixelCam.setColorLevels(colorLevels);
  // let gridSideSize = ceil(sqrt(colorLevels));
  // pixelCam.setGridSideSize(gridSideSize);

  // // Create and set ascii texture
  // let ascii_texture_buffer = pixelCam.createASCIITexture(asciiStr);
  // pixelCam.setSpritesheetsAtlas(ascii_texture_buffer);

  let colorLevels = Object.keys(spritesheets).length;
  pixelCam.setColorLevels(colorLevels);
  let gridSideSize = ceil(sqrt(colorLevels));
  pixelCam.setGridSideSize(gridSideSize);

  let frameGridSideSize = Math.ceil(Math.sqrt(numberOfFrames));
  pixelCam.setFrameGridSideSize(frameGridSideSize);
  spritesheets_atlas = pixelCam.joinImagesIntoGrid(Object.values(spritesheets));
  pixelCam.setSpritesheetsAtlas(spritesheets_atlas);
  pixelCam.setNumberOfFrames(numberOfFrames);
  prevPixelSize = pixelCam.getPixelSize()

  // FPS Set Fill Color
  fps.setFillColor([255, 10, 10]);

  if (image_loaded_successfuly){
    initializeCanvas(img)
    setInputFileSizeLabel()
    setPixelsPerSideLabel()
  }
}

function initializeCanvas(input_image){
  if (getUseInputFileResolution()) {
    workingImageHeight = Math.round(input_image.height * inputFileResolutionScale);
    workingImageWidth = Math.round(input_image.width * inputFileResolutionScale);
  }
  else {
    workingImageHeight = artworkHeight
    workingImageWidth = artworkWidth
  }

  let color_buffer_otions = {
    width: workingImageWidth,
    height: workingImageHeight,
    textureFiltering: NEAREST,
    antialias: false,
    desity: 1,
    format: UNSIGNED_BYTE,
    depth: false,
    channels: RGBA,
  }
  color_buffer = createFramebuffer(color_buffer_otions)
  interface_color_buffer = createFramebuffer({width: workingImageWidth, height: workingImageHeight})

  resizeCanvas(workingImageWidth, workingImageHeight);
  scaleCanvasToFit(canvas, workingImageHeight, workingImageWidth);

  recorder.setFilenameSufix('seed-'+ artwork_seed);
}

function draw() {
  if (image_loaded_successfuly){
    draw_steps()
  }
  else {
    display_image_error_message()
  }

  if (prevPixelSize != pixelCam.getPixelSize()) {
    console.log('prevPixelSize', prevPixelSize, pixelCam.getPixelSize())
    setPixelsPerSideLabel()
    prevPixelSize = pixelCam.getPixelSize()
  }

  drawInterface()
}

function draw_steps(){
  clear();
  color_buffer.begin();
  if (getUseInputFile()){ // Draw input file if required
    image(img, 0-color_buffer.width/2, 0-color_buffer.height/2, color_buffer.width, color_buffer.height)
  }
  else { // Draw camera otherwise
    scale(-1, 1);
    image(camera, 0-color_buffer.width/2, 0-color_buffer.height/2, color_buffer.width, color_buffer.height)
  }
  color_buffer.end();

  pixelCam.increaseFrame();

  color_buffer = pixelCam.pixelCamGPU(color_buffer)

  background(255, 255, 255);
  image(color_buffer, 0-width/2, 0-height/2, width, height)
}

function drawInterface(){
  interface_color_buffer.begin()
  clear()

  if (fps.isDisplayEnabled()) {
    fps.calculateFPS(millis());
    fps.displayFPS(interface_color_buffer.width/2, -interface_color_buffer.height/2);
  }

  interface_color_buffer.end()
  image(interface_color_buffer, 0-width/2, 0-height/2, width, height)
}

function windowResized() {
  scaleCanvasToFit(canvas, workingImageHeight, workingImageWidth);
}

export function applyUIChanges(){
  updateArtworkSettings();

  // Update canvas size
  scaleCanvasToFit(canvas, workingImageHeight, workingImageWidth);

  initializeCanvas(img)
  setPixelsPerSideLabel()
}

export function updateArtworkSettings() {
  artworkWidth = parseInt(SizeInputs['artworkWidth'].value);
  artworkHeight = parseInt(SizeInputs['artworkHeight'].value);
  setPixelsPerSideLabel()
}

export function flipSize(){
  // Set input seed to current seed
  const oldArtworkWidth = SizeInputs['artworkWidth'].value;
  const oldArtworkHeight = SizeInputs['artworkHeight'].value;

  artworkWidth = oldArtworkHeight;
  artworkHeight = oldArtworkWidth;

  SizeInputs['artworkWidth'].value = artworkWidth;
  SizeInputs['artworkHeight'].value = artworkHeight;

  // Update slider aswell by sending input event
  var event = new Event('input');
  SizeInputs['artworkWidth'].dispatchEvent(event);
  SizeInputs['artworkHeight'].dispatchEvent(event);

  applyUIChanges();
}

export function saveImage() {
  let color_buffer_otions = {
    width: workingImageWidth,
    height: workingImageHeight,
    textureFiltering: NEAREST,
    antialias: false,
    desity: 1,
    format: UNSIGNED_BYTE,
    depth: false,
    channels: RGBA,
  }
  let tmp_buffer = createFramebuffer(color_buffer_otions)

  tmp_buffer.begin();
  image(color_buffer, 0-workingImageWidth/2, 0-workingImageHeight/2, workingImageWidth, workingImageHeight);
  tmp_buffer.end()
  let filename =  `${artwork_seed}.png`
  // Save the image
  saveCanvas(tmp_buffer, filename, 'png');
}

export function load_user_file(user_file){
  const fileExtension = getFileExtension(user_file);
  console.log('fileExtension', fileExtension)
  if (videoFormats.includes(fileExtension)) {
    console.log('Loading video')
    load_video(user_file, (video) => {
      img = video
      initializeCanvas(img)
      setUseInputFile(true);
    });
  }
  else {
    console.log('Loading Image')
    loadImage(user_file,
      (loadedImage)=>{
        img = loadedImage;
        initializeCanvas(loadedImage)
        setUseInputFile(true);
      },
      () => { image_loaded_successfuly = false; loaded_user_image = true; setUseInputFile(false);}
    );
  }
  loaded_user_image = true;
  image_loaded_successfuly = true;
}

function loadFrames(animationsFramesPathsDict, callback) {
  console.log('Loading all spritesheets');
  let loadedImages = {};

  for (let key in animationsFramesPathsDict) {
    loadedImages[key] = loadImage(animationsFramesPathsDict[key]);
  }
  callback(loadedImages);

  return loadedImages;
}

function load_video(video_path, callbak) {
  let video = createVideo(video_path, () => {
      callbak(video)
  });
  video.volume(0);
  video.loop();
  video.hide();
  return video;
}

function getFileExtension(base64String) {
  // Extract the MIME type
  const match = /^data:(.*?);base64,/.exec(base64String);
  if (!match || match.length < 2) {
      throw new Error("Invalid base64 string format");
  }

  const mimeType = match[1]; // e.g., "video/mp4" or "image/jpeg"  
  // Get the extension from the MIME type
  const extension = mimeType.split('/')[1];

  return extension;
}

function display_image_error_message(){
  fill(255, 0, 0);
  textSize(32);
  textAlign(CENTER, CENTER);
  if (loaded_user_image){
    text("Failed to load image. \n Upload a new image with the 'Load Image' button", 0, 0);
  }
  else {
    text("Failed to load default image. \n Upload an image with the 'Load Image' button", 0, 0)
  }
}

export function setUseInputFile(newUseInputFile) {
  let oldUseInputFile = useInputFile;
  useInputFile = newUseInputFile;
  if (!useInputFile) {
    camera = create_camera_input();
  }
  else {
    delete_camera_input(camera);
  }
  return oldUseInputFile;

}

export function getUseInputFile() {
  return useInputFile;

}

export function setUseInputFileResolution(newUseInputFileRes) {
  let oldUseInputFileRes = useInputFileResolution;
  useInputFileResolution = newUseInputFileRes;
  applyUIChanges();
  return oldUseInputFileRes;

}

export function getUseInputFileResolution() {
  return useInputFileResolution;

}

export function setInputFileResolutionScale(newInputFileResScale) {
  let oldInputFileResScale = inputFileResolutionScale;
  inputFileResolutionScale = newInputFileResScale;
  setInputFileSizeLabel();
  setPixelsPerSideLabel();
  return oldInputFileResScale;

}

export function getInputFileResolutionScale() {
  return inputFileResolutionScale;

}

function setInputFileSizeLabel() {
  let w = Math.round(img.width * inputFileResolutionScale);
  let h = Math.round(img.height * inputFileResolutionScale);
  SizeInputs['inputFileSizeLabel'].innerHTML = w + " x " + h;
}

function setPixelsPerSideLabel(){
  let w = artworkWidth;
  let h = artworkHeight;
  if (getUseInputFileResolution()) {
    w = Math.round(img.width * inputFileResolutionScale);
    h = Math.round(img.height * inputFileResolutionScale);
  }
  console.log('w, h', w, h)
  let w_pixels = parseFloat(w/pixelCam.getPixelSize()).toFixed(2);
  let h_pixels = parseFloat(h/pixelCam.getPixelSize()).toFixed(2);
  SizeInputs['pixelsPerSide'].innerHTML = "Pixels per side: " + w_pixels + " x " + h_pixels;
}

function create_camera_input() {
  let cam = createCapture(VIDEO);
  cam.size(artworkWidth, artworkHeight);
  cam.hide();
  return cam
}

function delete_camera_input(cam) {
  cam.remove();
  return 
}

window.preload = preload
window.setup = setup
window.draw = draw
window.windowResized = windowResized
