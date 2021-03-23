let io;

const configWs = (server) => {
  var wsapp = require('express')();
  var server1 = require('http').Server(wsapp);
  io = require('socket.io')(server1, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  registerEvent();
  server1.listen(65080);
}

const registerEvent = () => {
  io.on('connection', (socket) => {
    console.log('Client connected to Main WebSocket');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  
  })
  const workRequestNs = io.of('work-request');
  const workPlanNs = io.of('work-plan');

  workRequestNs.on('connection', (socket) => {
    console.log('Client connected to WorkRequest WebSocket');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });

    socket.on('update', function(data) {
      console.log('workRequestNs: data', data)
      socket.broadcast.emit('update', data);
    });
  })

  workPlanNs.on('connection', (socket) => {
    console.log('Client connected to WorkPlan WebSocket');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });

    socket.on('update', function(data) {
      console.log('workPlanNs: data', data)
      socket.broadcast.emit('update', data);
    });
  })

}

module.exports = configWs;
