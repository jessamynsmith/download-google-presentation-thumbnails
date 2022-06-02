# google-presentation-thumbnails-node

### Development

Fork the project on github and git clone your fork, e.g.:

    git clone https://github.com/<username>/download-google-presentation-thumbnails.git
    
Ensure you have node installed (I recommend using homebrew on OSX), then use npm to install Javacript dependencies:

    npm install

You will need a Google Cloud Project with the following:

    - Google Slides API enabled
    - A service account with a json key file attached
    - A Google presentation which has granted access to the generated email on the service account

Set environment variables:

    export GOOGLE_APPLICATION_CREDENTIALS=</PATH/TO/GOOGLE_API_CREDENTIALS_JSON>

Edit the script to set the appropriate values for const IMAGE_SIZE, MAX_SLIDE_COUNT, and PRESENTATION_ID.

Run the application:

    node get_slide_thumbnails.js
