-- Feedback submissions from authenticated users.
-- Rate-limited to 1 per user per day on the API side.

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  account_name text NOT NULL,
  chain_id text,
  category text NOT NULL CHECK (category IN ('bug', 'feature', 'general')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
