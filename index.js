var natpmp = require('nat-pmp');
const { exec } = require('child_process')
 
// create a "client" instance connecting to your local gateway
var client = natpmp.connect('192.168.1.1');

exec('curl ip-adresim.app', function(error, stdout, stderr){
    if(error)
        return;
    console.log('your ip is :'+ stdout);
})

 
// setup a new port mapping
// client.portMapping({ private: 80, public: 2222, ttl: 3600 }, function (err, info) {
//   if (err) throw err;
//   console.log(info);
  // {
  //   type: 'tcp',
  //   epoch: 8922109,
  //   private: 22,
  //   public: 2222,
  //   ...
  // }
// });