bootreport
==========

Get spoken reports when you arrive at or leave the house.

Removing an obstacle from in front of the sensor (in my case, my boots) will report the weather forecast and current conditions. Placing an object in front of the sensor will report what media has been downloaded since the last report was made.

## Configuration

Bootreport is designed to work with an Arduino proximity sensor, specifically I'm using the Keyes IR Distance Sensing Module (KY-032). The code is configured such that the `out` pin of the sensor is in the digital in pin 10.

On Linux, Festival must be installed for voice reports. OSX should work out of the box. Verbal reports are not currently supported on windows.

## Launching

The program must be launched with your sickbeard API key.

`node main.js <Sickbeard API Key>`