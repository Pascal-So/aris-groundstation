formatter='
/ p /{print "pos x=" $3 ",y=" $4 ",z=" $5 ",z2=" $6, $1}
/ a /{print "acc x=" $3 ",y=" $4 ",z=" $5, $1}
/ g /{print "gyro x=" $3 ",y=" $4 ",z=" $5, $1}
/ v /{print "vel x=" $3 ",y=" $4 ",z=" $5 ",z2=" $6, $1}
/ r /{print "rot x=" $3 ",y=" $4 ",z=" $5 ",w=" $6, $1}
/ h /{print "alt pressure=" $3 ",altitude=" $4 ",vel=" $5, $1}
'

awk 'BEGIN{factor=1000000000; t=systime()*factor;}{$1 = t + int($1*factor); print $0}' \
| awk "$formatter"
