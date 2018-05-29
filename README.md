# aris-groundstation

Visualization/data handling/storage solutions for ARIS.

This is in development so don't count on things staying where they are, stuff might move around quite a lot in here.

## Usage

Start the docker containers on the groundstation laptop with `sudo docker-compse up`. Some data (e.g. flight data) will be stored in the directory container-data.

The flight data is received from the usb device specified in the `docker-compose.yml` file and stored in an InfluxDB Database with the name flight-Y-m-d-H-M-S.

When setting up when grafana is first activated, you might need to run this commands: 
```bash
mkdir container-data/grafana
sudo chown -R 472 container-data/grafana
```



![user interface ideas](ArisUI.png)