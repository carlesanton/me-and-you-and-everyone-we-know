import {
    create_number_input_slider_and_number,
    create_daisyui_expandable_card,
    create_button,
    create_input_image_button,
    turnDaisyUICardIntoBodyWithTitle,
    createSmallBreak,
    create_subtitle,
} from './lib/JSGenerativeArtTools/ui.js'
import {
    defaultArtworkWidth,
    defaultArtworkHeight,
    defaultPixelSize,
    artwork_seed,
    applyUIChanges,
    saveImage,
    flipSize,
    load_user_file,
    fps,
    recorder,
    pixelCam,
} from './sketch.js'

function createArtworkSettingsCard() {
    var elements_dict = {};

    // Create Main Card
    const card = create_daisyui_expandable_card('artworkSettings', 'Artwork Settings');
    const cardBody = card.getElementsByClassName('collapse-content')[0]

    // Add Inputs
    // Size
    const sizeTitle = create_subtitle('Size');
    const width = create_number_input_slider_and_number('artworkWidth', 'Width', defaultArtworkWidth, 0, 4000);
    elements_dict['artworkWidth'] = width.getElementsByTagName('input')[0];

    const changeOrientation = create_button('Flip Orientation', () => { flipSize(); }, '', 'xs')
    elements_dict['changeOrientation'] = changeOrientation.getElementsByTagName('input')[0];

    const height = create_number_input_slider_and_number('artworkHeight', 'Height', defaultArtworkHeight,0, 4000);
    elements_dict['artworkHeight'] = height.getElementsByTagName('input')[0];

    const pixelSize = create_number_input_slider_and_number('pixelSize', 'Pixel Size', defaultPixelSize,1, 100);
    elements_dict['pixelSize'] = pixelSize.getElementsByTagName('input')[0];

    const emptyTitle1 = create_subtitle();
    const emptyTitle2 = create_subtitle();
    // Buttons
    const applyChangesButton = create_button('Apply Changes', () => { applyUIChanges(); });
    const saveFrameButton = create_button('Save Current Frame', () => { saveImage(); });
    const loadImage = create_input_image_button(load_user_file, 'Load Image', 'No file chosen', 'Loaded Image: ');

    // FPS, take only body
    var FPSInputs = fps.createFPSSettingsCard();
    var FPSInputsBody = turnDaisyUICardIntoBodyWithTitle(FPSInputs['main-toolbar'])
    elements_dict['fpsInputs'] = FPSInputs;

    cardBody.appendChild(pixelSize);

    cardBody.appendChild(sizeTitle);
    cardBody.appendChild(width);
    cardBody.appendChild(createSmallBreak('10px'));
    cardBody.appendChild(changeOrientation);
    cardBody.appendChild(createSmallBreak('10px'));
    cardBody.appendChild(height);

    cardBody.appendChild(emptyTitle1);

    cardBody.appendChild(FPSInputsBody);

    cardBody.appendChild(emptyTitle2);
    cardBody.appendChild(applyChangesButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(saveFrameButton);
    cardBody.appendChild(document.createElement('br'));
    cardBody.appendChild(loadImage);

    elements_dict['main-toolbar'] = card;

    return elements_dict;
}

function intialize_toolbar(){
    var elements_dict = {}
    toolbar = document.getElementById('toolbar');

    // Main Settings UI
    var MainInputs = createArtworkSettingsCard();
    toolbar.appendChild(MainInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));

    elements_dict['mainInputs'] = MainInputs;

    // Pixel Cam
    var pixelCamInputs = pixelCam.createPixelCalSettings()
    toolbar.appendChild(pixelCamInputs['main-toolbar']);
    toolbar.appendChild(document.createElement('br'));
    elements_dict['pixelCamInputs'] = pixelCamInputs;

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