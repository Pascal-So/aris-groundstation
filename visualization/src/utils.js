export default {
  renderTime: time => {
    // time in ms
    if(isNaN(time)){
      return 'T+??s';
    }

    const rounded = (time / 1000).toFixed(1);

    if (time >= 0) {
      return `T+${rounded}s`;
    }else{
      return `T${rounded}s`;
    }
  },

  prettyFlightName: db_name => {
    if(db_name.match(/^flight-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/)){
      return db_name.replace(/^flight-(\d{4}-\d{2}-\d{2})-(\d{2})-(\d{2})-(\d{2})$/, "Flight $1, $2:$3:$4");
    }

    return db_name[0].toUpperCase() + db_name.substr(1);
  },
};
