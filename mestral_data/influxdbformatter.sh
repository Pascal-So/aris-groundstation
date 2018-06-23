formatter_mestral='
/ p /{print "pos x=" $3 ",y=" $4 ",z=" $5 ",z2=" $6, $1}
/ a /{print "acc x=" $3 ",y=" $4 ",z=" $5, $1}
/ g /{print "gyro x=" $3 ",y=" $4 ",z=" $5, $1}
/ v /{print "vel x=" $3 ",y=" $4 ",z=" $5 ",z2=" $6, $1}
/ r /{print "rot x=" $3 ",y=" $4 ",z=" $5 ",w=" $6, $1}
/ h /{print "bar1 pa=" $3 ",alt=" $4 ",vel=" $5, $1}
'

formatter_tell='
/ pp /{print "pos x=" $3 ",y=" $4 ",z=" $5 ",z2=" $6, $1}
/ a /{print "acc x=" $3 ",y=" $4 ",z=" $5, $1}
/ g /{print "gyro x=" $3 ",y=" $4 ",z=" $5, $1}
/ p1 /{print "bar1 pa=" $3 ",alt=" $4 ",temp=" $5, $1}
/ vp /{print "vel x=" $3 ",y=" $4 ",z=" $5 ",z2=" $6, $1}
/ rp /{print "rot x=" $3 ",y=" $4 ",z=" $5 ",w=" $6, $1}
'

## Change settings here

start_at_current_time="false"
formatter_to_use=$formatter_tell
time_factor="0.001" # 0.001 for Tell, 1 for Mestral

awk -v ct="$start_at_current_time" \
    'BEGIN {
        factor=1000000000;

        if(ct == "true"){
            offset = systime() * factor;
        } else {
            offset = 0;
        }
    }
    {
        $1 = offset + int($1 * factor);
        print $0;
    }' \
    | awk "$formatter_to_use" \
    | awk -v ct="$start_at_current_time" -v tf="$time_factor" \
    'NR==1 {
        # shift all data to zero, instead of whatever timestamp was first discovered.
        if(ct == "true"){
            offset = 0; # already shifted to current time
        } else {
            offset = -$NF;
        }
    }
    {
        $NF = ($NF + offset) * tf
        print $0;
    }'
