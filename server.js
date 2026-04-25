const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-portfolio-secret';

app.use(cors({ origin: true }));
app.use(express.json());

const users = [];

function computeProgressScore(githubHandle, leetcodeHandle) {
  let score = 45;
  score += Math.min(25, (githubHandle || '').length * 1.3);
  score += Math.min(25, (leetcodeHandle || '').length * 1.1);
  if (githubHandle && leetcodeHandle) score += 8;
  return Math.min(98, Math.round(score));
}

function verifyCertificateText(text) {
  const lower = (text || '').toLowerCase();
  const industryKeywords = ['aws', 'azure', 'google', 'microsoft', 'oracle', 'cisco', 'pmp', 'scrum', 'full stack', 'devops', 'cloud', 'frontend', 'backend'];
  const matched = industryKeywords.some(keyword => lower.includes(keyword));
  if (matched && lower.length > 18) {
    return 'AI verdict: Strong industry relevance. This certificate looks attractive for modern engineering roles.';
  }
  if (lower.includes('certificate') || lower.includes('certified')) {
    return 'AI verdict: Valid certificate signal, but check if it matches your target role and employer expectations.';
  }
  return 'AI verdict: The credential appears generic. Add issuer and domain details for a better evaluation.';
}

function generateToken(user) {
  return jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '3h' });
}

function findUser(identifier) {
  return users.find(user => user.email === identifier || user.githubHandle === identifier);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = findUser(payload.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token verification failed.' });
  }
}

app.post('/api/signup', async (req, res) => {
  const { email, password, linkedin, goal } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (findUser(email)) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email,
    passwordHash,
    githubHandle: '',
    leetcodeHandle: '',
    linkedin: linkedin || '',
    goal: goal || '',
    score: 52
  };
  users.push(user);

  const token = generateToken(user);
  res.json({ token, email: user.email, githubHandle: user.githubHandle, leetcodeHandle: user.leetcodeHandle, linkedin: user.linkedin || 'pending', score: user.score, goal: user.goal });
});

app.post('/api/login', async (req, res) => {
  const { user, password, githubHandle, leetcodeHandle, linkedin } = req.body;
  if (!user || !password) {
    return res.status(400).json({ error: 'Login and password are required.' });
  }

  const existingUser = findUser(user);
  if (!existingUser) {
    return res.status(401).json({ error: 'No matching account found.' });
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  if (githubHandle) existingUser.githubHandle = githubHandle;
  if (leetcodeHandle) existingUser.leetcodeHandle = leetcodeHandle;
  if (linkedin) existingUser.linkedin = linkedin;
  existingUser.score = computeProgressScore(existingUser.githubHandle, existingUser.leetcodeHandle);

  const token = generateToken(existingUser);
  res.json({ token, email: existingUser.email, githubHandle: existingUser.githubHandle || 'not provided', leetcodeHandle: existingUser.leetcodeHandle || 'not provided', linkedin: existingUser.linkedin || 'not provided', score: existingUser.score });
});

app.get('/api/profile', authMiddleware, (req, res) => {
  const user = req.user;
  res.json({
    email: user.email,
    githubHandle: user.githubHandle || 'not provided',
    leetcodeHandle: user.leetcodeHandle || 'not provided',
    linkedin: user.linkedin || 'not provided',
    score: user.score,
    goal: user.goal
  });
});

app.post('/api/verify-certificate', authMiddleware, (req, res) => {
  const { certificateText } = req.body;
  if (!certificateText) {
    return res.status(400).json({ error: 'Certificate text is required.' });
  }
  const verdict = verifyCertificateText(certificateText);
  res.json({ verdict });
});

app.post('/api/auto-apply', authMiddleware, (req, res) => {
  const { roles } = req.body;
  if (!roles || (!roles.senior && !roles.fullstack)) {
    return res.status(400).json({ error: 'Select at least one role to evaluate.' });
  }

  const score = req.user.score || 0;
  const results = [];

  if (roles.senior) {
    if (score >= 80) {
      results.push('Senior Developer: Eligible. AI assistant prepared top matching submissions.');
    } else {
      results.push('Senior Developer: Not eligible yet. Increase GitHub / LeetCode progress and certificates.');
    }
  }

  if (roles.fullstack) {
    if (score >= 70) {
      results.push('Fullstack Developer: Eligible. AI assistant queued applications for relevant positions.');
    } else {
      results.push('Fullstack Developer: Not eligible yet. Strengthen your portfolio and platform metrics.');
    }
  }

  res.json({ result: results.join(' ') });
});

app.post('/api/update-handles', authMiddleware, (req, res) => {
  const { githubHandle, leetcodeHandle } = req.body;
  req.user.githubHandle = githubHandle || req.user.githubHandle;
  req.user.leetcodeHandle = leetcodeHandle || req.user.leetcodeHandle;
  req.user.score = computeProgressScore(req.user.githubHandle, req.user.leetcodeHandle);
  res.json({ githubHandle: req.user.githubHandle, leetcodeHandle: req.user.leetcodeHandle, score: req.user.score });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
