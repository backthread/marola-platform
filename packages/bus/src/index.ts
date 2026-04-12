// @marola/bus — thin Kafka producer used by every service.
//
// Since the RabbitMQ → Confluent migration (2026-04) services no longer call
// each other directly: they publish domain events onto Kafka topics and the
// interested services subscribe. This wrapper hides the kafkajs client setup
// and gives us one place to enforce the topic naming + envelope contract.
import { Kafka, Producer } from "kafkajs";

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? "marola",
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
});

let producer: Producer | null = null;

async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer({ allowAutoTopicCreation: false });
    await producer.connect();
  }
  return producer;
}

export interface DomainEvent<T = unknown> {
  /** dotted topic name, e.g. "orders.created" */
  topic: string;
  /** partition key — usually the aggregate id */
  key: string;
  payload: T;
}

/**
 * Publish a domain event onto the bus. Fire-and-forget from the caller's
 * perspective; delivery is acked by the broker (acks=all).
 */
export async function publish<T>(event: DomainEvent<T>): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: event.topic,
    acks: -1,
    messages: [
      {
        key: event.key,
        value: JSON.stringify({
          ...event.payload,
          _emittedAt: new Date().toISOString(),
        }),
      },
    ],
  });
}

export async function shutdown(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}
