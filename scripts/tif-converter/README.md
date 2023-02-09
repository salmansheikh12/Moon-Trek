# TIF Converter

### This script converts tif/tiff files to png, jpg, or jpeg
* Put your tif/tiff files into the input folder
* The script will put the results into the output folder

## Before using, the necessary packages need to be installed. In this directory, run the following command:
```
    npm install
```

## The script can now be used like so:
```
    node convert.js convert 'LRO_WAC_Mosaic_Global_303ppd_v02.tif' .02 'moon-2k.jpg'

    node convert.js convert 'LRO_WAC_Mosaic_Global_303ppd_v02.tif' .08 'moon-8k.png'
```