import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, types } from 'cassandra-driver';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ScyllaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScyllaService.name);
  private client: Client | null = null;
  private readonly contactPoints = (process.env.SCYLLA_CONTACT_POINTS || '127.0.0.1').split(',');
  private readonly localDc = process.env.SCYLLA_LOCAL_DC || 'datacenter1';
  private readonly keyspace = process.env.SCYLLA_KEYSPACE || 'support';

  async onModuleInit() {
    try {
      this.client = new Client({
        contactPoints: this.contactPoints,
        localDataCenter: this.localDc,
        keyspace: this.keyspace,
      });
      await this.client.connect();
      this.logger.log('Connected to Scylla/Cassandra');
    } catch (err) {
      this.logger.error('Failed to connect to Scylla/Cassandra', err as any);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.shutdown();
    }
  }

  async createConversation(visitorId: string | null) {
    const conversationId = uuidv4();
    if (!this.client) return conversationId;

    const query = 'INSERT INTO conversations (conversation_id, visitor_id, started_at) VALUES (?, ?, ?)';
    try {
      await this.client.execute(query, [types.Uuid.fromString(conversationId), visitorId, new Date()], { prepare: true });
    } catch (err) {
      this.logger.error('Failed to insert conversation', err as any);
    }

    return conversationId;
  }

  async getLatestConversationByVisitor(visitorId: string) {
    if (!this.client) return null;

    try {
      const q = 'SELECT conversation_id FROM conversations_by_visitor WHERE visitor_id = ? LIMIT 1';
      const res = await this.client.execute(q, [visitorId], { prepare: true });
      const row = res.first();
      if (row && row.conversation_id) {
        return row.conversation_id.toString();
      }
    } catch (err) {
      this.logger.error('Failed to query conversations_by_visitor', err as any);
    }

    return null;
  }

  async createOrGetConversation(visitorId: string | null) {
    if (!visitorId) return this.createConversation(null);

    // try to find existing
    const existing = await this.getLatestConversationByVisitor(visitorId);
    if (existing) return existing;

    // create new conversation and register mapping
    const conversationId = uuidv4();
    if (!this.client) return conversationId;

    const now = new Date();
    const insertConv = 'INSERT INTO conversations (conversation_id, visitor_id, started_at) VALUES (?, ?, ?)';
    const insertMap = 'INSERT INTO conversations_by_visitor (visitor_id, started_at, conversation_id) VALUES (?, ?, ?)';
    try {
      await this.client.execute(insertConv, [types.Uuid.fromString(conversationId), visitorId, now], { prepare: true });
      await this.client.execute(insertMap, [visitorId, now, types.Uuid.fromString(conversationId)], { prepare: true });
    } catch (err) {
      this.logger.error('Failed to create or map conversation', err as any);
    }

    return conversationId;
  }

  async insertMessage(conversationId: string, role: string, content: string, meta: Record<string, string> = {}, ttlSeconds?: number) {
    if (!this.client) return;

    const messageId = types.TimeUuid.now();
    const query = ttlSeconds
      ? 'INSERT INTO messages (conversation_id, message_id, role, content, meta) VALUES (?, ?, ?, ?, ?) USING TTL ?'
      : 'INSERT INTO messages (conversation_id, message_id, role, content, meta) VALUES (?, ?, ?, ?, ?)';

    const params = ttlSeconds ? [types.Uuid.fromString(conversationId), messageId, role, content, meta, ttlSeconds] : [types.Uuid.fromString(conversationId), messageId, role, content, meta];

    try {
      await this.client.execute(query, params, { prepare: true });
    } catch (err) {
      this.logger.error('Failed to insert message', err as any);
    }
  }
}
