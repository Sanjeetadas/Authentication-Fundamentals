const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateRegistrationInput({ name, email, password }) {
  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password)
  ) {
    throw new AppError(
      400,
      'INVALID_INPUT',
      'Name, email, and password are required'
    );
  }
}

function validateLoginInput({ email, password }) {
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new AppError(
      400,
      'INVALID_INPUT',
      'Email and password are required'
    );
  }
}

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function register({ name, email, password }) {
  validateRegistrationInput({ name, email, password });

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError(
      409,
      'EMAIL_ALREADY_EXISTS',
      'Email already exists'
    );
  }

  const cost = Number(process.env.BCRYPT_COST || 12);

  const passwordHash = await bcrypt.hash(password, cost);

  const user = await userRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return serializeUser(user);
}

async function login({ email, password }) {
  validateLoginInput({ email, password });

  const normalizedEmail = normalizeEmail(email);

  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  return serializeUser(user);
}

module.exports = {
  register,
  login,
};