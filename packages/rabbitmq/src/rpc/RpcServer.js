const amqp = require('amqplib');

class RpcServer {
  constructor(queueName, responseGenerator) {
    this.queueName = queueName;
    this.responseGenerator = responseGenerator;
  }

  async start() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    await channel.assertQueue(this.queueName, { durable: false });
    console.log(`RPC Server is waiting for messages in queue: ${this.queueName}`);

    channel.consume(this.queueName, async (msg) => {
      const input = msg.content.toString();
      console.log(`Received request: ${input}`);
      
      // Simulate processing
      const response = await this.responseGenerator(input);
      
      channel.sendToQueue(msg.properties.replyTo, Buffer.from(response), {
        correlationId: msg.properties.correlationId,
      });
      
      channel.ack(msg);
    });
  }
}

module.exports = RpcServer;

