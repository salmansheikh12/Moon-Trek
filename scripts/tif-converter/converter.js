const sharp = require('sharp');
const path = require('path');

const convertTif = async (inputImage, scale, outputName, outputType) => {
    try {
        const image = await sharp(path.join(__dirname, 'input', inputImage), { limitInputPixels: false });
        const { width, height } = await image.metadata();
        const resizedImage = await image.resize({ 
            width: Math.round(width * scale),
            height: Math.round(height * scale),
        });

        if (outputType === 'png') {
            resizedImage
            .png()
            .toFile(path.join(__dirname, 'output', `${outputName}.png`));
        } else {
            resizedImage
            .jpeg()
            .toFile(path.join(__dirname, 'output', `${outputName}.jpg`));
        }
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    convertTif
};