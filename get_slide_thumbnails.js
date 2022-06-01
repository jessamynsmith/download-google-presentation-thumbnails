const https = require('https');
const fs = require('fs');

const {GoogleAuth} = require('google-auth-library');
const {google} = require('googleapis');


const SIZE = {
  UNSPECIFIED: 'THUMBNAIL_SIZE_UNSPECIFIED',
  LARGE: 'LARGE',
  MEDIUM: 'MEDIUM',
  SMALL: 'SMALL',
};

const IMAGE_SIZE = SIZE.SMALL;
const MAX_SLIDE_COUNT = 3;
const PRESENTATION_ID = '<PRESENTATION_ID_FROM_GOOGLE_URL>';


const getSlideObjects = (service, presentationId) => {
  return new Promise((resolve, reject) => {
    service.presentations
      .get({
        presentationId,
        fields: 'slides/objectId',
      })
      .then((result ) => {
        const pageObjects = result.data.slides.map(({ objectId }) => objectId);
        resolve(pageObjects.slice(0, MAX_SLIDE_COUNT));
      })
      .catch((err) => reject(err));
  });
};

const getThumbnailUrl = (service, presentationId, pageObjectId) => {
  return new Promise((resolve, reject) => {
    service.presentations.pages
      .getThumbnail({
        presentationId,
        pageObjectId,
        'thumbnailProperties.mimeType': 'PNG',
        'thumbnailProperties.thumbnailSize': IMAGE_SIZE,
      })
      .then(( result ) => {
        resolve(result.data.contentUrl);
      })
      .catch((err) => {
        reject(err);
      });
  });
};


const getImageLinks = (presentationId) => {

  const auth = new GoogleAuth(
      {scopes: 'https://www.googleapis.com/auth/presentations'});

  const service = google.slides({version: 'v1', auth});
    
  return new Promise((resolve, reject) => {
    getSlideObjects(service, presentationId)
      .then((pageObjects) => {
        return pageObjects.map((pageObjectId) => {
          return getThumbnailUrl(service, presentationId, pageObjectId);
        });
      })
      .then((thumbnailUrls) => {
        return Promise.all(thumbnailUrls);
      })
      .then((fileUrls) => resolve(fileUrls.filter((url) => url)))
      .catch((err) => reject(err));
  });
};


getImageLinks(PRESENTATION_ID)
    .then((fileUrls) => {
        console.log(fileUrls);
        fileUrls.forEach((fileUrl, index) => {
            // https://lh3.googleusercontent.com/0ndtWBz-ym5SGJU7QkJMDlae977vScvTSVb-0Rr_8gqaJZIX42v1CxsBA3WwY-hAHAQ3kO2WgZ3m1osf3ljQ4d8gZs9fS2-jPibW2AQfczLGMWmUukqAVPaUMCh5vwVaXaFytqX0tUjXGoEwjGbVWRnN1r61xu6gAd4wzFjkrUfPRBGU0cPqyuzRzDEdTDbB-yyU8541UFr96fvTpgs3CmzRZ18zrJmW_EDuqcRI4V5ELo2UIN4=s200
            // https://lh3.googleusercontent.com/0ndtWBz-ym5SGJU7QkJMDlae977vScvTSVb-0Rr_8gqaJZIX42v1CxsBA3WwY-hAHAQ3kO2WgZ3m1osf3ljQ4d8gZs9fS2-jPibW2AQfczLGMWmUukqAVPaUMCh5vwVaXaFytqX0tUjXGoEwjGbVWRnN1r61xu6gAd4wzFjkrUfPRBGU0cPqyuzRzDEdTDbB-yyU8541UFr96fvTpgs3CmzRZ18zrJmW_EDuqcRI4V5ELo2UIN4=s200
            const request = https.get(fileUrl, (response) => {
                const file = fs.createWriteStream('file' + index + '.png');
               response.pipe(file);
            
               // after download completed close filestream
               file.on("finish", () => {
                   file.close();
                   console.log("Download Completed");
               });
            });
        });
    });
