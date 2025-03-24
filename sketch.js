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
let MainInputs

// Defaults
// Main
export const defaultArtworkWidth = 1280;
export const defaultArtworkHeight = 720;
export const defaultArtworkSeed = -1;
export const defaultPixelSize = 4;
export const defaultFPS = 15;

// Variables
// Main
let artworkWidth;
let artworkHeight;
let workingImageWidth;
let workingImageHeight;
export let artwork_seed; // -1 used for random seeds, if set to a positive integer the number is used

// To check if user loaded an image or default one is loaded
let loaded_user_image = false;
let image_loaded_successfuly = false;

const pixel_density = 1;
let canvas;

let img;
let myFont;
let color_buffer;
let interface_color_buffer;

const imgFiles = [
  'img/1225657.jpg',
]

export let fps;
export let recorder;
let inputs;

export let pixelCam;
let camera;

function preload() {
  artwork_seed = prepareP5Js(defaultArtworkSeed); // Order is important! First setup randomness then prepare the token
  myFont = loadFont('./fonts/PixelifySans-Medium.ttf');
  var image_path = imgFiles[floor(random(1000000000)%imgFiles.length)]
  console.log('Loaded image: ', image_path)
  img = loadImage(
    image_path,
    () => { image_loaded_successfuly = true; },
    () => { image_loaded_successfuly = false; }
  )

  pixelCam = new PixelCam();
}

function setup() {
  recorder = new Recorder()
  fps = new FPS()
  inputs = intialize_toolbar();
  MainInputs = inputs.mainInputs;

  recorder.setSketchFPSMethod(() => {return fps.getFPS()})

  updateArtworkSettings()

  // Create Canvas
  canvas = createCanvas(artworkWidth, artworkHeight, WEBGL);

  // Create Camera
  camera = createCapture(VIDEO);
  camera.size(artworkWidth, artworkHeight);
  camera.hide();

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
  let colorLevels = asciiStr.length;
  pixelCam.setColorLevels(colorLevels);
  let gridSideSize = ceil(sqrt(colorLevels));
  pixelCam.setGridSideSize(gridSideSize);

  // Create and set ascii texture
  let ascii_texture_buffer = pixelCam.createASCIITexture(asciiStr);
  pixelCam.setASCIITexture(ascii_texture_buffer);

  if (image_loaded_successfuly){
    initializeCanvas(img)
  }
}

function initializeCanvas(input_image){
  workingImageHeight = artworkHeight
  workingImageWidth = artworkWidth

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
  interface_color_buffer = createFramebuffer({width: artworkWidth, height: artworkHeight})

  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);

  recorder.setFilenameSufix('seed-'+ artwork_seed);
}

function draw() {
  if (image_loaded_successfuly){
    draw_steps()
  }
  else {
    display_image_error_message()
  }

  drawInterface()
}

function draw_steps(){
  color_buffer.begin();
  scale(-1, 1);
  if (pixelCam.getUseInputFile()){ // Draw input file if required
    image(img, 0-width/2, 0-height/2, width, height)
  }
  else { // Draw camera otherwise
    image(camera, 0-width/2, 0-height/2, width, height)
  }
  color_buffer.end();

  color_buffer = pixelCam.pixelCamGPU(color_buffer)

  image(color_buffer, 0-width/2, 0-height/2, width, height)
}

function drawInterface(){
  interface_color_buffer.begin()
  clear()

  if (fps.isDisplayEnabled()) {
    fps.calculateFPS(millis());
    fps.displayFPS(artworkWidth/2, -artworkHeight/2);
  }

  interface_color_buffer.end()
  image(interface_color_buffer, 0-width/2, 0-height/2, width, height)
}

function windowResized() {
  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);
}

export function applyUIChanges(){
  updateArtworkSettings();

  // Update canvas size
  scaleCanvasToFit(canvas, artworkHeight, artworkWidth);

  if (!loaded_user_image){
    var image_path = imgFiles[floor(random(1000000000)%imgFiles.length)]
    console.log('Loading new image: ',image_path)
    loadImage(image_path, (loadedImage)=>{initializeCanvas(loadedImage)});
  }
  else{ // To restart the process if we already had a user image loaded but parameters change
    initializeCanvas(img)
  }
}

function updateArtworkSettings() {
  artworkWidth = parseInt(MainInputs['artworkWidth'].value);
  artworkHeight = parseInt(MainInputs['artworkHeight'].value);
}

export function flipSize(){
  // Set input seed to current seed
  const oldArtworkWidth = MainInputs['artworkWidth'].value;
  const oldArtworkHeight = MainInputs['artworkHeight'].value;

  artworkWidth = oldArtworkHeight;
  artworkHeight = oldArtworkWidth;

  MainInputs['artworkWidth'].value = artworkWidth;
  MainInputs['artworkHeight'].value = artworkHeight;

  // Update slider aswell by sending input event
  var event = new Event('input');
  MainInputs['artworkWidth'].dispatchEvent(event);
  MainInputs['artworkHeight'].dispatchEvent(event);

  updateArtworkSettings();
}

export function saveImage() {
  let color_buffer_otions = {
    width: artworkWidth,
    height: artworkHeight,
    textureFiltering: NEAREST,
    antialias: false,
    desity: 1,
    format: UNSIGNED_BYTE,
    depth: false,
    channels: RGBA,
  }
  let tmp_buffer = createFramebuffer(color_buffer_otions)

  tmp_buffer.begin();
  image(color_buffer, 0-artworkWidth/2, 0-artworkHeight/2, artworkWidth, artworkHeight);
  tmp_buffer.end()
  let filename =  `${artwork_seed}.png`
  // Save the image
  saveCanvas(tmp_buffer, filename, 'png');
}

export function load_user_image(user_image){
  loadImage(user_image,
    (loadedImage)=>{
      img = loadedImage;
      initializeCanvas(loadedImage)
    },
    () => { image_loaded_successfuly = false; loaded_user_image = true; }
  );
  loaded_user_image = true;
  image_loaded_successfuly = true;
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

window.preload = preload
window.setup = setup
window.draw = draw
window.windowResized = windowResized
