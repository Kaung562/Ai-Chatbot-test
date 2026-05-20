-- Scylla/Cassandra schema for support conversations
CREATE KEYSPACE IF NOT EXISTS support WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

CREATE TABLE IF NOT EXISTS support.conversations (
  conversation_id uuid PRIMARY KEY,
  visitor_id text,
  started_at timestamp,
  status text,
  metadata map<text,text>
);

CREATE TABLE IF NOT EXISTS support.messages (
  conversation_id uuid,
  message_id timeuuid,
  role text,
  content text,
  meta map<text,text>,
  PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

-- Table to lookup latest conversation(s) by visitor
CREATE TABLE IF NOT EXISTS support.conversations_by_visitor (
  visitor_id text,
  started_at timestamp,
  conversation_id uuid,
  PRIMARY KEY (visitor_id, started_at)
) WITH CLUSTERING ORDER BY (started_at DESC);
