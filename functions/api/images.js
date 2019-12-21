const admin = require('firebase-admin');

const { asyncRoute } = require('./utils');

const IMAGE_TYPE = 1;
const VIDEO_TYPE = 2;
const GIF_TYPE = 3;

const _generateId = () => Math.floor(new Date().getTime() * Math.random()).toString(16);

const _detectMediaType = (req) => {
    return IMAGE_TYPE;
};


const uploadMedia = async (req, res) => {
    const mediaId = _generateId();
    const mediaPath = `images/${mediaId}.png`;

    console.log(mediaPath);

    const bucket = admin.storage().bucket();

    const stream = bucket.file(mediaPath).createWriteStream();
    req.pipe(stream)
        .on('end', () => {
            res.json({
                mediaId,
                mediaPath
            });
        })
        .on('error', (e) => conosle.log(e))
        .on('close', () => console.log('close'))
        .on('finish', () => console.log('finish'));
};



module.exports = (app) => {
    app.post('/media', asyncRoute(uploadMedia));
};
