let io;

const configWs = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  registerEvent();
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
