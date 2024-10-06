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

    // correlationId mapping Promise resolve function
    this.replyCallbacks = new Map();
    // start consume replyTo queue
    this.channel.consume(this.replayQueueName, (replyMsg) => {
      const correlationId = replyMsg.properties.correlationId;
      const resolve = this.replyCallbacks.get(correlationId);
      if (resolve) {
        resolve(replyMsg.content.toString());
        // Acknowledge the message to remove it from the queue
        this.channel.ack(replyMsg);
        this.replyCallbacks.delete(correlationId);
      }
    }, { noAck: false }); //Set noAck to false to acknowledge messages manually
  }

  async call(msg) {
    return new Promise((resolve, reject) => {
      const correlationId = uuidv4();  // Use uuidv4 to generate UUID
      
      this.replyCallbacks.set(correlationId, resolve);

      this.channel.sendToQueue(this.queueName, Buffer.from(msg), {
        correlationId: correlationId,
        replyTo:  this.replayQueueName,
      });
    });
  }

  async close() {
    await this.connection.close();
  }
}

module.exports = RpcClient;

