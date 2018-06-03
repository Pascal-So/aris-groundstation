# Fabian coordinate conversion algorithm

Condensed version of what Fabian does in `csvreader.cs`.

## Init
```c++
// Notice that all the coordinates remain positive, which means that the space should be mirrored
pos [x,y,z] = data pos [x,z,y]
rot [x,y,z,w] = data rot [x,z,y,w]

rotNormalize = Quaternion.Inverse(rot[0]);
```

## Update
```c++
rocket.position = pos[i]
rocket.rotation = rotNormalize * rot[i];
```