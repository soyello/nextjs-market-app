import { AdapterUser } from 'next-auth/adapters';
import pool from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

type CustomAdapterUser = Omit<AdapterUser, 'emailVerified'>;

function mapToAdapterUser(row: UserRow): CustomAdapterUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image ?? null,
  };
}

const MySQLAdapter = {
  async getUserById(id: string): Promise<CustomAdapterUser | null> {
    try {
      const [rows] = await pool.query<UserRow[]>('SELECT id, name, email, image FROM users WHERE id = ?', [id]);
      return rows?.[0] ? mapToAdapterUser(rows[0]) : null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  },
  async getUserByEmail(email: string): Promise<CustomAdapterUser | null> {
    if (!email) {
      throw new Error('Email must be provided');
    }
    try {
      const [rows] = await pool.query<UserRow[]>('SELECT id, name, email, image FROM users WHERE email=?', [email]);

      if (!rows[0]) return null;

      return mapToAdapterUser(rows[0]);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user by email');
    }
  },
  async createUser(user: Omit<CustomAdapterUser, 'id'>): Promise<CustomAdapterUser> {
    const { name, email, image } = user;
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO users (name, email, image) VALUES (?,?,?)', [
      name,
      email,
      image,
    ]);
    return { id: result.insertId.toString(), name, email, image };
  },
  async updateUser(user: Partial<CustomAdapterUser> & { id: string }): Promise<CustomAdapterUser> {
    const { id, name, email, image } = user;

    if (!id) {
      throw new Error('User Id is required for updating.');
    }

    try {
      const updates = { name, email, image };
      const keys = Object.keys(updates).filter((key) => updates[key as keyof typeof updates] !== undefined);

      if (keys.length === 0) {
        throw new Error('No fields to update. Provide at least on field');
      }

      const fields = keys.map((key) => `${key}=?`).join(', ');
      const values = keys.map((key) => updates[key as keyof typeof updates]);

      await pool.query(`UPDATE users SET ${fields} WHERE id = ?`, [...values, id]);

      const [rows] = await pool.query<UserRow[]>('SELECT id, name, email, image FROM users WHERE id = ?', [id]);

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
};

export default MySQLAdapter;
