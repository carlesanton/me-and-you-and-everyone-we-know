import {
    create_number_input_slider_and_number,
    create_daisyui_expandable_card,
    create_button,
    create_input_file_button,
    createSmallBreak,
    createToggleButton,
    create_subtitle,
    createText,
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
    imageAdjustment,
    setUseInputFile,
    getUseInputFile,
    setUseInputFileResolution,
    getUseInputFileResolution,
    setInputFileResolutionScale,
    getInputFileResolutionScale,
    updateArtworkSettings,
} from './sketch.js'

function createSizeSettingsCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_daisyui_expandable_card('sizeSettings', 'Size');
    const cardBody = card.getElementsByClassName('collapse-content')[0]


    const useInputFileRes = createToggleButton('Use input resolution', (a) => {
        let checked = a.target.checked;
        setUseInputFileResolution(checked);
        if (checked) { // Hide elements if needed
            elements_dict['artworkWidth'].linkedDisabled = true
            elements_dict['artworkHeight'].linkedDisabled = true
            elements_dict['changeOrientation'].disabled = true;
            elements_dict['fileResScale'].linkedDisabled = false;
        }
        else {
            elements_dict['artworkWidth'].linkedDisabled = false
            elements_dict['artworkHeight'].linkedDisabled = false
            elements_dict['changeOrientation'].disabled = false;
            elements_dict['fileResScale'].linkedDisabled = true;
        }
    }, getUseInputFileResolution());
    elements_dict['useFileRes'] = useInputFileRes.getElementsByTagName('input')[0];
    
    const inputFileSizeLabel = createText('Test text');
    elements_dict['inputFileSizeLabel'] = inputFileSizeLabel.getElementsByTagName('text')[0];

    const resScale = create_number_input_slider_and_number(
        'inputFileResScale',
        'Resolution Scale',
        getInputFileResolutionScale(),
        0,
        20,
        setInputFileResolutionScale,
        0.1,
    );
    elements_dict['fileResScale'] = resScale.getElementsByTagName('input')[0];

    const width = create_number_input_slider_and_number(
        'artworkWidth',
        'Width',
        defaultArtworkWidth,
        10,
        4000,
        updateArtworkSettings,
    );
    elements_dict['artworkWidth'] = width.getElementsByTagName('input')[0];

    const changeOrientation = create_button('Flip Orientation', () => { flipSize(); }, '', 'xs')
    elements_dict['changeOrientation'] = changeOrientation.getElementsByTagName('button')[0];

    const height = create_number_input_slider_and_number(
        'artworkHeight',
        'Height',
        defaultArtworkHeight,
        10,
        4000,
        updateArtworkSettings,
    );
    elements_dict['artworkHeight'] = height.getElementsByTagName('input')[0];

    const pixelsPerSide = createText('Pixels per side:');
    elements_dict['pixelsPerSide'] = pixelsPerSide.getElementsByTagName('text')[0];

    // Buttons
    const applyChangesButton = create_button('Apply Changes', () => { applyUIChanges(); }, '', 'sm');

    cardBody.appendChild(useInputFileRes);
    cardBody.appendChild(createSmallBreak('10px'));
    cardBody.appendChild(inputFileSizeLabel);
    cardBody.appendChild(createSmallBreak('10px'));
    cardBody.appendChild(resScale);

    cardBody.appendChild(create_subtitle());
    cardBody.appendChild(width);
    cardBody.appendChild(changeOrientation);
    cardBody.appendChild(height);
    
    cardBody.appendChild(create_subtitle());
    cardBody.appendChild(pixelsPerSide);
    cardBody.appendChild(createSmallBreak('20px'));
    cardBody.appendChild(applyChangesButton);

    elements_dict['main-toolbar'] = card;

    // Disable elements initialy
    if (getUseInputFileResolution()) {
        elements_dict['artworkWidth'].linkedDisabled = true
        elements_dict['artworkHeight'].linkedDisabled = true
        elements_dict['changeOrientation'].disabled = true;
        elements_dict['fileResScale'].linkedDisabled = false;
    }
    else {
        elements_dict['artworkWidth'].linkedDisabled = false
        elements_dict['artworkHeight'].linkedDisabled = false
        elements_dict['changeOrientation'].disabled = false;
        elements_dict['fileResScale'].linkedDisabled = true;
    }

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
    cardBody.appendChild(createSmallBreak('10px'));
    cardBody.appendChild(loadImage);

    elements_dict['main-toolbar'] = card;

    return elements_dict;
}

function intialize_toolbar(){
    var elements_dict = {}
    toolbar = document.getElementById('toolbar');

    // Size Settings UI
    var SizeInputs = createSizeSettingsCard();
    SizeInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(SizeInputs['main-toolbar']);
    elements_dict['sizeInputs'] = SizeInputs;

    // Input Settings
    var InputSettings = createInputCard()
    InputSettings['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(InputSettings['main-toolbar']);
    elements_dict['inputSettings'] = InputSettings;

    // Pixel Cam
    var pixelCamInputs = pixelCam.createPixelCamSettings()
    pixelCamInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(pixelCamInputs['main-toolbar']);
    elements_dict['pixelCamInputs'] = pixelCamInputs;

    // Image Adjustment
    var imageAdjustInputs = imageAdjustment.createImageAdjustmentSettings()
    imageAdjustInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(imageAdjustInputs['main-toolbar']);
    elements_dict['imageAdjustInputs'] = imageAdjustInputs;

    // Recorder UI
    var recorderInputs = recorder.createSettingsCard();
    recorderInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(recorderInputs['main-toolbar']);
    elements_dict['recorderInputs'] = recorderInputs;

    // FPS
    var FPSInputs = fps.createFPSSettingsCard();
    FPSInputs['main-toolbar'].querySelector('input[type="checkbox"]').checked = false
    toolbar.appendChild(FPSInputs['main-toolbar']);
    elements_dict['fpsInputs'] = FPSInputs;
    
    elements_dict['toolbar'] = toolbar;
    // toolbar.style.display = "none" // to hide toolbar

    return elements_dict;

  }

export {
    intialize_toolbar,
}