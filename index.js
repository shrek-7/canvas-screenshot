const dashboard = require('./config.json');

const canvas_script = require('./screenshot');

function init(index) {
  let dashboard_list = Object.keys(dashboard);
  if(index < dashboard_list.length){
    canvas_script.generateScreenshot(dashboard[dashboard_list[index]], dashboard_list[index], true);

    let frequency_interval = dashboard[dashboard_list[index]].frequency * 1000 * 60;

    setInterval(function(dashboard_obj, name){ 
      canvas_script.generateScreenshot(dashboard_obj, name);
    }, frequency_interval, dashboard[dashboard_list[index]], dashboard_list[index]);
  }
}


init(0);
exports.init = init;
