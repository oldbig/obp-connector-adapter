const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid'); 

class RpcClient {
  constructor(queueName) {
    this.queueName = queueName;
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    this.connection = await amqp.connect('amqp://localhost');
    this.channel = await this.connection.createChannel();
    const {queue: replayQueueName} = await this.channel.assertQueue('', { exclusive: true });
    // get replayQueue name
    this.replayQueueName = replayQueueName;
    console.log("Replay queue name:", this.replayQueueName);
  }

  async call(msg) {
    return new Promise((resolve, reject) => {
      const correlationId = uuidv4();  // Use uuidv4 to generate UUID
      this.channel.consume('', (replyMsg) => {
        if (replyMsg.properties.correlationId === correlationId) {
          resolve(replyMsg.content.toString());
        }
      }, { noAck: true });

      this.channel.sendToQueue(this.queueName, Buffer.from(msg), {
        correlationId: correlationId,
        replyTo:  this.replayQueueName ,
      });
    });
  }

  async close() {
    await this.connection.close();
  }
}

module.exports = RpcClient;

