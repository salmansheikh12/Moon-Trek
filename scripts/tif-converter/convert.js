const yargs = require('yargs/yargs');
const converter = require('./converter.js');
const supportedOutputType = ['png', 'jpg', 'jpeg'];

yargs(process.argv.slice(2))
    .usage('$0: Usage <cmd> [options]')
    .command(
        'convert <inputImage> <scale> <outputImage>',
        'convert tif images to either png, jpg, or jpeg',
        (yargs) => {
            return yargs
                .positional('inputImage', {
                    describe: 'tif file to convert',
                    type: 'string',
                })
                .positional('scale', {
                    describe: 'scale used when converting',
                    type: 'number'
                })
                .positional('outputImage', {
                    describe: 'name of output file (must be specified as png, jpg, or jpeg)',
                    type: 'string'
                });
        },
        (args) => {
            const imageNameArray = args.outputImage.split('.');
            if (supportedOutputType.includes(imageNameArray[1])) {
                converter.convertTif(args.inputImage, args.scale, imageNameArray[0], imageNameArray[1]);
            } else {
                console.log(`Conversion to type ${imageNameArray[1]} is not supported`);
            }
        }
    )
    .help().argv;