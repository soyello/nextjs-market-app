import { AdapterSession, AdapterUser } from 'next-auth/adapters';
import pool from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  image: string | null;
  user_type: string;
  hashed_password?: string;
}

interface SessionRow extends RowDataPacket {
  session_token: string;
  user_id: string;
  expires: string;
}

function mapToAdapterUser(row: UserRow): AdapterUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image ?? null,
    emailVerified: null,
    role: row.user_type,
  };
}

function mapToAdapterSession(row: SessionRow): AdapterSession {
  return {
    sessionToken: row.session_token,
    userId: row.user_id,
    expires: new Date(row.expires),
  };
}

const MySQLAdapter = {
  async getUserByEmailWithPassword(email: string): Promise<UserRow> {
    if (!email) {
      throw new Error('Email must be provided');
    }
    try {
      const [rows] = await pool.query<UserRow[]>(
        'SELECT id, name, email, image, user_type, hashed_password FROM users WHERE email=?',
        [email]
      );
      return rows?.[0];
    } catch (error) {
      console.error('Error fetching user by eamail:', error);
      throw new Error('Failed to fetch user by email');
    }
  },
  async getUser(id: string): Promise<AdapterUser | null> {
    try {
      const [rows] = await pool.query<UserRow[]>('SELECT id, name, email, image, user_type FROM users WHERE id = ?', [
        id,
      ]);
      return rows?.[0] ? mapToAdapterUser(rows[0]) : null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  },
  async getUserByEmail(email: string): Promise<AdapterUser | null> {
    if (!email) {
      throw new Error('Email must be provided');
    }
    try {
      const [rows] = await pool.query<UserRow[]>('SELECT id, name, email, image, user_type FROM users WHERE email=?', [
        email,
      ]);

      if (!rows[0]) return null;

      return mapToAdapterUser(rows[0]);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user by email');
    }
  },
  async createUser(
    user: Omit<AdapterUser, 'id' | 'image' | 'emailVerified' | 'role'> & { password: string }
  ): Promise<AdapterUser> {
    const { name, email, password } = user;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, hashed_password) VALUES (?,?,?)',
      [name, email, password]
    );
    return { id: result.insertId.toString(), name, email, emailVerified: null, image: null, role: 'User' };
  },
  async updateUser(user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> {
    const { id, name, email, image, role } = user;

    if (!id) {
      throw new Error('User Id is required for updating.');
    }

    try {
      const updates = { name, email, image, role };
      const keys = Object.keys(updates).filter((key) => updates[key as keyof typeof updates] !== undefined);

      if (keys.length === 0) {
        throw new Error('No fields to update. Provide at least on field');
      }

      const fields = keys.map((key) => `${key}=?`).join(', ');
      const values = keys.map((key) => updates[key as keyof typeof updates]);

      await pool.query(`UPDATE users SET ${fields} WHERE id = ?`, [...values, id]);

      const [rows] = await pool.query<UserRow[]>('SELECT id, name, email, image, role FROM users WHERE id = ?', [id]);

      if (!rows[0]) {
        throw new Error(`User with Id: ${id} not found after update.`);
      }

      return mapToAdapterUser(rows[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user.');
    }
  },
  async deleteUser(id: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE id =?', [id]);
  },
  async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
    try {
      const [results] = await pool.query<(SessionRow & UserRow)[]>(
        `
        SELECT
          s.session_token AS session_token,
          s.user_id AS user_id,
          s.expires AS expires,
          u.id AS id,
          u.name AS name,
          u.eamil AS eamil,
          u.image AS image,
          u.user_type AS role
        FROM sessions AS s
        LEFT JOIN users AS u ON s.user_id = u.id
        WHERE s.session_token = ?
        `,
        [sessionToken]
      );

      const result = results[0];
      if (!result) return null;

      const session = mapToAdapterSession(result);
      const user = mapToAdapterUser(result);

      return { session, user };
    } catch (error) {
      console.error('Error fetching session and user:', error);
      throw new Error('Failed to fetchi session and user');
    }
  },
  async createSession(session: AdapterSession): Promise<AdapterSession> {
    const { sessionToken, userId, expires } = session;

    if (!sessionToken || !userId || !expires) {
      throw new Error('All fields (sessionToken, userId, expires) ar required to create a session');
    }

    try {
      await pool.query('INSERT INTO sessions(session_token, user_id, expiers) VALUES (?,?,?)', [
        sessionToken,
        userId,
        expires,
      ]);

      const [rows] = await pool.query<SessionRow[]>(
        'SELECT session_token, user_id, expires FROM sessions WHERE session_token = ?',
        [sessionToken]
      );

      const result = rows[0];
      if (!result) {
        throw new Error('Failed to retrieve the created session from the database.');
      }

      return mapToAdapterSession(result);
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session.');
    }
  },
  async updateSession(session: Partial<AdapterSession> & { sessionToken: string }): Promise<AdapterSession | null> {
    const { sessionToken, userId, expires } = session;
    if (!sessionToken) {
      throw new Error('Session token is required to update a session');
    }

    try {
      const query = `
      UPDATE sessions
      SET
        expires = COALESCE(?, expires),
        user_id = COALESCE(?, user_id)
      WHERE session_token = ?
      `;
      await pool.query(query, [expires, userId, sessionToken]);

      const [rows] = await pool.query<SessionRow[]>(
        'SELECT session_token, user_id, expires FROM sessions WHERE session_token = ?',
        [sessionToken]
      );
      const updatedSession = rows[0];
      return updatedSession ? mapToAdapterSession(updatedSession) : null;
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session.');
    }
  },
  async deleteSession(sessionToken: string): Promise<void> {
    if (!sessionToken) {
      throw new Error('Session token is required to delete a session.');
    }

    try {
      await pool.query('DELETE FROM sessions WHERE session_token = ?', [sessionToken]);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session.');
    }
  },
};

export default MySQLAdapter;
