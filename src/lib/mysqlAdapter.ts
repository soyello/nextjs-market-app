import { AdapterSession, AdapterUser } from 'next-auth/adapters';
import pool from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { CreateProductInput, Product } from '@/helper/type';
import { ProductRow, ProductWithUserRow, SessionRow, UserConversationRow, UserRow } from '@/helper/row';
import {
  mapProductWithUser,
  mapRowToUserConversation,
  mapToAdapterSession,
  mapToAdapterUser,
  mapToProduct,
  mapToProducts,
} from '@/helper/mapper';
import { buildWhereClause } from '@/helper/buildWhereClause';

interface TotalItemRow extends RowDataPacket {
  totalItems: number;
}

interface CreateMessageInput {
  text: string;
  image?: string;
  senderId: string;
  receiverId: string;
  conversationId: number;
}

const MySQLAdapter = {
  async findOrCreateConversation(senderId: string, receiverId: string): Promise<number> {
    const conversationSql = `
      SELECT id FROM conversations 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      LIMIT 1;
    `;

    const [conversationRows] = await pool.query<RowDataPacket[]>(conversationSql, [
      senderId,
      receiverId,
      receiverId,
      senderId,
    ]);

    if (conversationRows.length > 0) {
      return conversationRows[0].id;
    }

    const newConversationSql = `
      INSERT INTO conversations (sender_id, receiver_id) VALUES (?, ?);
    `;

    const [newConversationResult] = await pool.query<ResultSetHeader>(newConversationSql, [senderId, receiverId]);

    return newConversationResult.insertId;
  },

  async createMessage({ text, image, senderId, receiverId, conversationId }: CreateMessageInput): Promise<number> {
    const messageSql = `
      INSERT INTO messages (text, image, sender_id, receiver_id, conversation_id, created_at)
      VALUES (?, ?, ?, ?, ?, NOW());
    `;

    const [messageResult] = await pool.query<ResultSetHeader>(messageSql, [
      text,
      image || null,
      senderId,
      receiverId,
      conversationId,
    ]);

    return messageResult.insertId;
  },

  async getUsersWithConversations() {
    try {
      const sql = `
      SELECT
    u.id AS userId,
    u.name AS userName,
    u.email AS userEmail,
    u.image AS userImage,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'conversationId', c.id,
        'conversationName', c.name,
        'conversationCreatedAt', c.created_at,
        'messages', IF(
          c.id IS NOT NULL,
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'messageId', m.id,
                'text', m.text,
                'image', m.image,
                'createdAt', m.created_at,
                'updatedAt', m.updated_at,
                'sender', JSON_OBJECT(
                  'id', sender.id,
                  'name', sender.name,
                  'email', sender.email,
                  'image', sender.image
                ),
                'receiver', JSON_OBJECT(
                  'id', receiver.id,
                  'name', receiver.name,
                  'email', receiver.email,
                  'image', receiver.image
                )
              )
            )
            FROM messages m
            LEFT JOIN users sender ON m.sender_id = sender.id
            LEFT JOIN users receiver ON m.receiver_id = receiver.id
            WHERE m.conversation_id = c.id
          ),
          NULL
        ),
        'users', IF(
          c.id IS NOT NULL,
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', p.id,
                'name', p.name,
                'email', p.email,
                'image', p.image
              )
            )
            FROM users p
            WHERE p.id = c.sender_id OR p.id = c.receiver_id
          ),
          NULL
        )
      )
    ) AS conversations
FROM
    users u
LEFT JOIN conversations c ON u.id = c.sender_id OR u.id = c.receiver_id
GROUP BY
    u.id;
          `;
      const [rows] = await pool.query<UserConversationRow[]>(sql);

      return rows.map(mapRowToUserConversation);
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Error fetching users with conversations.');
    }
  },
  async getProductWithUser(productId: string) {
    try {
      const sql = `
      SELECT
        p.id AS id,
        p.title AS title,
        p.description AS description,
        p.imageSrc AS imageSrc,
        p.category AS category,
        p.latitude AS latitude,
        p.longitude AS longitude,
        p.price AS price,
        p.user_id AS user_id,
        p.created_at AS created_at,
        u.id AS userId,
        u.name AS userName,
        u.email AS userEmail,
        u.image As userImage,
        u.user_type AS userType
      FROM
        products p
      JOIN
        users u
      ON
        p.user_id = u.id
      WHERE
        p.id = ?
        `;

      const [rows] = await pool.query<ProductWithUserRow[]>(sql, [productId]);

      if (rows.length === 0) {
        return null;
      }
      return mapProductWithUser(rows[0]);
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Error fetching product with user data.');
    }
  },
  async getProducts(query: Record<string, any> = {}, page: number = 1, itemsPerPage: number = 6) {
    const { where, values } = buildWhereClause(query, ['category', 'latitude', 'longitude']);

    const countSQL = `SELECT COUNT(*) as totalItems FROM products ${where}`;
    let totalItems = 0;
    try {
      const [countResult] = await pool.query<TotalItemRow[]>(countSQL, values);
      totalItems = (countResult && countResult[0]?.totalItems) || 0;
    } catch (error) {
      console.error('Error fetching total itmes:', error);
      throw new Error('Error fetching total item count from the database');
    }

    const offset = (page - 1) * itemsPerPage;

    const sql = `
        SELECT
          id,
          title,
          description,
          imageSrc,
          category,
          latitude,
          longitude,
          price,
          user_id AS userId,
          created_at AS createdAt
        FROM products
        ${where}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `;
    const paginatedValues = [...values, Number(itemsPerPage), Number(offset)];

    try {
      const [rows] = await pool.query<ProductRow[]>(sql, paginatedValues);
      return { data: mapToProducts(rows), totalItems };
    } catch (error) {
      console.error('Database query error:', { query, sql, values, error });
      throw new Error('Error fetching products from the database');
    }
  },
  async createProduct({
    title,
    description,
    imageSrc,
    category,
    latitude,
    longitude,
    price,
    userId,
  }: CreateProductInput): Promise<Product> {
    if (!title || !description || !imageSrc || !category || !latitude || !longitude || !price || !userId) {
      throw new Error('All product fields are required');
    }

    try {
      const [result] = await pool.query<ResultSetHeader>(
        `
        INSERT INTO products
        (title, description, imageSrc, category, latitude, longitude, price, user_id)
        VALUES (?,?,?,?,?,?,?,?)
        `,
        [title, description, imageSrc, category, latitude, longitude, price, userId]
      );

      const productId = result.insertId;

      const [rows] = await pool.query<ProductRow[]>(
        `
        SELECT
          id,
          title,
          description,
          imageSrc,
          category,
          latitude,
          longitude,
          price,
          user_id,
          created_at
        FROM products
        WHERE id = ?
        `,
        [productId]
      );

      if (!rows || rows.length === 0) {
        throw new Error('Failed to fetch the created product.');
      }

      return mapToProduct(rows[0]);
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('An error occurred while creating the product.');
    }
  },
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
      const [rows] = await pool.query<UserRow[]>(
        'SELECT id, name, email, image, user_type, favorite_ids FROM users WHERE email=?',
        [email]
      );

      if (!rows[0]) return null;

      return mapToAdapterUser(rows[0]);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user by email');
    }
  },
  async createUser(
    user: Omit<AdapterUser, 'id' | 'image' | 'emailVerified' | 'role' | 'favoriteIds'> & { password: string }
  ): Promise<AdapterUser> {
    const { name, email, password } = user;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, hashed_password) VALUES (?,?,?)',
      [name, email, password]
    );
    return {
      id: result.insertId.toString(),
      name,
      email,
      emailVerified: null,
      image: null,
      role: 'User',
      favoriteIds: [],
    };
  },
  async updateUser(user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> {
    const { id, name, email, image, role, favoriteIds } = user;

    const favoriteIdsJson = favoriteIds ? JSON.stringify(favoriteIds) : null;

    const updateFields = [
      { column: 'name', value: name },
      { column: 'email', value: email },
      { column: 'image', value: image },
      { column: 'user_type', value: role },
      { column: 'favorite_ids', value: favoriteIdsJson },
    ];

    const setClause = updateFields
      .map((field) => (field.value !== undefined ? `${field.column}=?` : null))
      .filter(Boolean)
      .join(', ');

    const values = updateFields.filter((field) => field.value !== undefined).map((field) => field.value);

    if (setClause) {
      try {
        console.log('Executing update query:', {
          query: `UPDATE users SET ${setClause} WHERE id =?`,
          values: [...values, id],
        });
        await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
      } catch (error) {
        console.error('Failed to execute update query:', error);
        throw new Error('Database update failed');
      }
    }

    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, name, email, image, user_type, favorite_ids FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      console.error('User not found after update:', id);
      throw new Error(`User with id ${id} not found.`);
    }

    const updatedUser = rows[0];

    return {
      id: updatedUser.id.toString(),
      name: updatedUser.name ?? null,
      email: updatedUser.email ?? '',
      image: updatedUser.image ?? null,
      role: updatedUser.user_type ?? 'User',
      emailVerified: null,
      favoriteIds: (() => {
        try {
          return typeof updatedUser.favorite_ids === 'string'
            ? JSON.parse(updatedUser.favorite_ids)
            : updatedUser.favorite_ids || [];
        } catch (error) {
          console.error('Failed to parse favorite_ids:', error, updatedUser.favorite_ids);
          return [];
        }
      })(),
    };
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
