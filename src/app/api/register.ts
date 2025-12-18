// pages/api/register.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "postgres";
import bcrypt from "bcrypt";
import type { NextApiHandler } from 'next';



// Conexão com o banco de dados PostgreSQL
const pool = new Pool({
  user: "postgres", // Substitua pelo seu usuário PostgreSQL
  host: "postgresql",
  database: "postgres", // Substitua pelo seu banco de dados
  password: "__n8n_BLANK_VALUE_e5362baf-c777-4d57-a609-6eaf1f9e87f6", // Substitua pela sua senha PostgreSQL
  port: 5432,
});

const registerUser: NextApiHandler = async (req, res) => {
  if (req.method === "POST") {
    const { name, login, password, email } = req.body;

    // Validação simples
    if (!name || !login || !password || !email) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    try {
      // Verificar se o login ou e-mail já existem no banco
      const checkUserQuery = "SELECT * FROM users WHERE login = $1 OR email = $2";
      const checkUserValues = [login, email];
      const checkUserResult = await pool.query(checkUserQuery, checkUserValues);

      if (checkUserResult.rows.length > 0) {
        return res.status(400).json({ message: "Login ou e-mail já registrados." });
      }

      // Criptografar a senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inserir o novo usuário na tabela users
      const insertUserQuery = "INSERT INTO users (name, login, password, email) VALUES ($1, $2, $3, $4) RETURNING *";
      const insertUserValues = [name, login, hashedPassword, email];

      const result = await pool.query(insertUserQuery, insertUserValues);
      const newUser = result.rows[0];

      // Retornar o usuário criado (sem a senha)
      const { password: _, ...userWithoutPassword } = newUser;

      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar usuário." });
    }
  } else {
    return res.status(405).json({ message: "Método não permitido" });
  }
};

export default registerUser;
