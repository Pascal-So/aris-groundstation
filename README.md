# ARIS Groundstation

Visualization/data handling/storage solutions for ARIS.

This is in development so don't count on things staying where they are, stuff might move around quite a lot in here.

## Usage

First make sure, docker and docker-compose are installed. Check the [official Docker website](https://docs.docker.com/install/) for that.

```bash
git clone https://github.com/Pascal-So/aris-groundstation.git
cd aris-groundstation

# Grafana tends to complain if this directory isn't set up with the correct permissions.
mkdir container-data/grafana && sudo chown -R 472 container-data/grafana

# This step might take a while..
sudo docker-compse build
```

Start the docker containers on the groundstation laptop with `sudo docker-compse up`. Some data (e.g. flight data) will be stored in the directory container-data.

The flight data is received from the usb device specified in the `docker-compose.yml` file and stored in an InfluxDB Database with the name `flight-Y-m-d-H-M-S`.

## Containers

### influx
Runs InfluxDB on port 8086. This port is exposed by docker-compose, so if you have influxdb installed on the host machine, you can get a cli to it by typing `influx` in your terminal.

### receiver
Python script that receives data from the xbee module. Adjust the name of the device in `docker-compose.yml` to match the usb port to which the module is connected. This script then sends the data to InfluxDB. It also hosts a server on port 5000, over which a command can be entered and sent over the xbee via broadcast.

### grafana
Default grafana instance, use this to inspect the data in InfluxDB directly. A connection and dashboard needs to be set up on first use, but then the config will be stored in the `container-data` directory and will be available even after the container has been destroyed.

### data-provider
NodeJS server accepting requests for flight data on port 8080, fetching that data from InfluxDB, and returning it to the browser.

### visualization
VueJS app visualizing the flight data with ThreeJS and ChartJS. The app can be run standalone with `npm run dev` in the `visualization` directory. To run the app with docker-compose, the image has to be rebuilt after every code change, which takes a while. The compiled app is then served with Apache.

![user interface ideas](ArisUI.png)