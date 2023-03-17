# Three Body Debugger
### This was made to help debug the issues with our 3d model. It uses the *positions* endpoint from our express server which returns positions and rotations for the Earth, Sun, and Moon at any given time stamp. It fetches these positions once every second and moves the time stamp forward a given interval from the initial time of running. The interval can be adjusted with any number greater than 0 and by either hours or days.

## Before using, the necessary packages need to be installed. In this directory, run the following command:
```
    npm install
```

## A local instance of this client can now be run with the following command:
```
    npm run dev
```

### Note: This client expects you to have an instance of the express server running