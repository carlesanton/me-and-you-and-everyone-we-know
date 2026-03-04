import {
    create_number_input_slider_and_number,
    create_daisyui_expandable_card,
    create_button,
    create_input_file_button,
    createSmallBreak,
    createToggleButton
} from './lib/JSGenerativeArtTools/ui.js'
import {
    defaultArtworkWidth,
    defaultArtworkHeight,
    applyUIChanges,
    flipSize,
    load_user_file,
    fps,
    recorder,
    pixelCam,
    setUseInputFile,
    getUseInputFile,
} from './sketch.js'

function createSizeSettingsCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_daisyui_expandable_card('sizeSettings', 'Size');
    const cardBody = card.getElementsByClassName('collapse-content')[0]

    const width = create_number_input_slider_and_number('artworkWidth', 'Width', defaultArtworkWidth, 0, 4000);
    elements_dict['artworkWidth'] = width.getElementsByTagName('input')[0];

    const changeOrientation = create_button('Flip Orientation', () => { flipSize(); }, '', 'xs')
    elements_dict['changeOrientation'] = changeOrientation.getElementsByTagName('input')[0];

    const height = create_number_input_slider_and_number('artworkHeight', 'Height', defaultArtworkHeight,0, 4000);
    elements_dict['artworkHeight'] = height.getElementsByTagName('input')[0];

    // Buttons
    const applyChangesButton = create_button('Apply Changes', () => { applyUIChanges(); });

    cardBody.appendChild(width);
    cardBody.appendChild(createSmallBreak('10px'));
    cardBody.appendChild(changeOrientation);
    cardBody.appendChild(createSmallBreak('10px'));
    cardBody.appendChild(height);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(applyChangesButton);

    elements_dict['main-toolbar'] = card;

    return elements_dict;
}

function createInputCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_daisyui_expandable_card('inputSettings', 'Input');
    const cardBody = card.getElementsByClassName('collapse-content')[0]

    // Add Inputs
    const useCamera = createToggleButton('Use Camera', (a) => {
        setUseInputFile(!a.target.checked);
    }, !getUseInputFile());
    elements_dict['useCamera'] = useCamera.getElementsByTagName('button')[0];

    const loadImage = create_input_file_button(load_user_file, 'Load Image', 'No file chosen', 'Loaded Image: ');

    cardBody.appendChild(useCamera);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(loadImage);

    elements_dict['main-toolbar'] = card;

    return elements_dict;
}

function intialize_toolbar(){
    var elements_dict = {}
    toolbar = document.getElementById('toolbar');

    // Size Settings UI
    var SizeInputs = createSizeSettingsCard();
    toolbar.appendChild(SizeInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));

    elements_dict['sizeInputs'] = SizeInputs;

    // Input Settings
    var InputSettings = createInputCard()
    toolbar.appendChild(InputSettings['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));

    elements_dict['inputSettings'] = InputSettings;

    // Pixel Cam
    var pixelCamInputs = pixelCam.createPixelCalSettings()
    toolbar.appendChild(pixelCamInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['pixelCamInputs'] = pixelCamInputs;

    // FPS
    var FPSInputs = fps.createFPSSettingsCard();
    toolbar.appendChild(FPSInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['fpsInputs'] = pixelCamInputs;

    // Recorder UI
    var recorderInputs = recorder.createSettingsCard();
    toolbar.appendChild(recorderInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['recorderInputs'] = recorderInputs;
    
    elements_dict['toolbar'] = toolbar;
    // toolbar.style.display = "none" // to hide toolbar

    return elements_dict;

  }

export {
    intialize_toolbar,
}