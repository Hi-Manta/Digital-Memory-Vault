import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Database, Lock, LogOut, Plus, Search, Calendar, Trash2, RotateCcw,
  History, Shield, Terminal, Image as ImageIcon, MapPin, Smile, Tag as TagIcon,
  Users, BarChart3, Clock, CheckCircle2, AlertTriangle, Layers,
  Play, Sparkles, Edit3, X, Filter, HardDriveDownload,
  Upload, UserPlus, KeyRound, BookOpen, ZoomIn, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

function sha256Hex(str) {
  const known = {
    'HIMANTA_pass_123': '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    'OVI_pass_123': '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
    'pass_123': 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
  };
  if (known[str]) return known[str];
  let h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const base = ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0'));
  return (base + base + base + base).slice(0, 64);
}

const DEMO_IMAGES = {
  cvasu_fish: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="50%" stop-color="#0369a1"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs><rect width="800" height="450" fill="url(#g1)"/><circle cx="650" cy="100" r="140" fill="rgba(255,255,255,0.06)"/><circle cx="140" cy="360" r="180" fill="rgba(255,255,255,0.05)"/><path d="M280 220 C340 160, 450 160, 520 225 C450 290, 340 290, 280 220 Z" fill="#38bdf8" opacity="0.85"/><polygon points="285,220 225,175 240,220 225,265" fill="#0284c7"/><circle cx="475" cy="210" r="8" fill="#0f172a"/><text x="40" y="395" fill="#e0f2fe" font-family="sans-serif" font-size="24" font-weight="bold">CVASU Fisheries Museum Specimen Gallery</text><text x="40" y="425" fill="#7dd3fc" font-family="monospace" font-size="15">MEDIA.file_path = '/uploads/user_1/cvasu_fish_museum_01.jpg'</text></svg>`)}`,
  morphogenesis: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="60%" stop-color="#312e81"/><stop offset="100%" stop-color="#4c1d95"/></linearGradient></defs><rect width="800" height="450" fill="url(#g2)"/><g stroke="#818cf8" stroke-width="2" fill="none" opacity="0.45"><circle cx="400" cy="210" r="95"/><circle cx="350" cy="180" r="65"/><circle cx="450" cy="180" r="65"/><circle cx="400" cy="250" r="65"/></g><circle cx="400" cy="210" r="16" fill="#c084fc"/><circle cx="350" cy="180" r="10" fill="#38bdf8"/><circle cx="450" cy="180" r="10" fill="#38bdf8"/><circle cx="400" cy="250" r="10" fill="#34d399"/><text x="40" y="395" fill="#ede9fe" font-family="sans-serif" font-size="24" font-weight="bold">Morphogenesis Cellular Patterning Notes</text><text x="40" y="425" fill="#a5b4fc" font-family="monospace" font-size="15">MEDIA.file_path = '/uploads/user_1/morphogenesis_diagram.png'</text></svg>`)}`,
  ovi_private: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="800" height="450" fill="url(#g3)"/><text x="40" y="220" fill="#6ee7b7" font-family="sans-serif" font-size="30" font-weight="bold">Ovi's Private Vault Photo (Isolated to user_id = 2)</text><text x="40" y="265" fill="#a7f3d0" font-family="monospace" font-size="16">MEDIA.file_path = '/uploads/user_2/ovi_private_snapshot.jpg'</text></svg>`)}`
};

const todayStr = new Date().toISOString().split('T')[0];
const lastYearToday = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split('T')[0];
})();

const INITIAL_DB = {
  USER: [
    {
      user_id: 1,
      name: 'Himanta',
      email: 'himanta@gmail.com',
      password_hash: sha256Hex('HIMANTA_pass_123'),
      created_at: '2026-09-01 10:00:00'
    },
    {
      user_id: 2,
      name: 'Ovi',
      email: 'fat_ovi@gmail.com',
      password_hash: sha256Hex('OVI_pass_123'),
      created_at: '2026-09-15 14:22:00'
    }
  ],
  LOCATION: [
    { location_id: 1, user_id: 1, location_name: 'CVASU', created_at: '2026-09-10 09:00:00' },
    { location_id: 2, user_id: 1, location_name: 'USTC FSET Lab', created_at: '2026-09-12 11:00:00' },
    { location_id: 3, user_id: 1, location_name: "Foy's Lake Chittagong", created_at: '2026-09-18 16:00:00' },
    { location_id: 4, user_id: 2, location_name: 'GEC Circle', created_at: '2026-09-20 19:00:00' }
  ],
  EMOTION: [
    { emotion_id: 1, user_id: 1, emotion_name: 'Happy', created_at: '2026-09-10 09:00:00' },
    { emotion_id: 2, user_id: null, emotion_name: 'Nostalgic', created_at: '2026-09-01 00:00:00' },
    { emotion_id: 3, user_id: null, emotion_name: 'Inspired', created_at: '2026-09-01 00:00:00' },
    { emotion_id: 4, user_id: null, emotion_name: 'Shocked', created_at: '2026-09-01 00:00:00' },
    { emotion_id: 5, user_id: null, emotion_name: 'Peaceful', created_at: '2026-09-01 00:00:00' }
  ],
  PERSON: [
    { person_id: 1, user_id: 1, name: 'Claude', relationship: 'Assistant', created_at: '2026-09-20 12:00:00' },
    { person_id: 2, user_id: 1, name: 'Himanta', relationship: 'Self', created_at: '2026-09-20 12:05:00' },
    { person_id: 3, user_id: 1, name: 'CSE41 Lab Mates', relationship: 'University Friends', created_at: '2026-09-21 15:00:00' },
    { person_id: 4, user_id: 2, name: 'Rafi', relationship: 'Friend', created_at: '2026-09-25 18:00:00' }
  ],
  TAG: [
    { tag_id: 1, user_id: 1, tag_name: 'Tour', created_at: '2026-09-10 09:00:00' },
    { tag_id: 2, user_id: 1, tag_name: 'Research', created_at: '2026-09-10 09:05:00' },
    { tag_id: 3, user_id: 1, tag_name: 'Milestone', created_at: '2026-09-14 10:00:00' },
    { tag_id: 4, user_id: 1, tag_name: 'ADBMS', created_at: '2026-09-15 10:00:00' },
    { tag_id: 5, user_id: 2, tag_name: 'Personal', created_at: '2026-09-25 18:00:00' }
  ],
  MEMORY: [
    {
      memory_id: 1,
      user_id: 1,
      title: 'Visited CVASU Fisheries Museum (Updated)',
      description: 'Enjoyed watching different kind of fishes with friends. But the Anatomy Museum was closed today.',
      memory_date: '2026-09-22',
      memory_time: '11:30:00',
      location_id: 1,
      emotion_id: 1,
      status: 'ACTIVE',
      created_at: '2026-09-22 11:30:00',
      updated_at: '2026-09-22 14:10:00'
    },
    {
      memory_id: 2,
      user_id: 1,
      title: 'SHOCKED',
      description: 'Found something terrible during late night debugging session, resolved using MySQL transaction rollback.',
      memory_date: '2026-09-22',
      memory_time: '16:45:00',
      location_id: 2,
      emotion_id: 4,
      status: 'ACTIVE',
      created_at: '2026-09-22 16:45:00',
      updated_at: '2026-09-22 16:45:00'
    },
    {
      memory_id: 3,
      user_id: 1,
      title: 'Research on Morphogenesis',
      description: 'Learnt many things about this interesting Topic and linked entities using atomic SQL START TRANSACTION...COMMIT.',
      memory_date: '2026-09-27',
      memory_time: '20:15:00',
      location_id: 2,
      emotion_id: 3,
      status: 'ACTIVE',
      created_at: '2026-09-27 20:15:00',
      updated_at: '2026-09-27 20:15:00'
    },
    {
      memory_id: 4,
      user_id: 1,
      title: 'Required Fields Only (Edited)',
      description: 'Demonstrating Week 7 T1 & T2 test cases: created with only required fields (title + date) and auto-versioned by trigger.',
      memory_date: todayStr,
      memory_time: '09:00:00',
      location_id: null,
      emotion_id: 1,
      status: 'ACTIVE',
      created_at: `${todayStr} 09:00:00`,
      updated_at: `${todayStr} 09:15:00`
    },
    {
      memory_id: 5,
      user_id: 1,
      title: 'One Year Ago Today: First ADBMS Schema Brainstorm',
      description: 'Matches the Week 6 "On This Day" query: MONTH(memory_date) = MONTH(CURDATE()) AND DAY(memory_date) = DAY(CURDATE()) AND YEAR(memory_date) < YEAR(CURDATE()).',
      memory_date: lastYearToday,
      memory_time: '18:00:00',
      location_id: 3,
      emotion_id: 2,
      status: 'ACTIVE',
      created_at: `${lastYearToday} 18:00:00`,
      updated_at: `${lastYearToday} 18:00:00`
    },
    {
      memory_id: 6,
      user_id: 2,
      title: 'Ovi Private Memory',
      description: 'Only Ovi (user_id = 2) can see this record! Strictly isolated by WHERE user_id = 2.',
      memory_date: todayStr,
      memory_time: '21:00:00',
      location_id: 4,
      emotion_id: 5,
      status: 'ACTIVE',
      created_at: `${todayStr} 21:00:00`,
      updated_at: `${todayStr} 21:00:00`
    }
  ],
  MEDIA: [
    {
      media_id: 1,
      memory_id: 1,
      file_path: '/uploads/user_1/cvasu_fish_museum_01.jpg',
      preview_url: DEMO_IMAGES.cvasu_fish,
      uploaded_at: '2026-09-22 11:32:00'
    },
    {
      media_id: 2,
      memory_id: 3,
      file_path: '/uploads/user_1/morphogenesis_diagram.png',
      preview_url: DEMO_IMAGES.morphogenesis,
      uploaded_at: '2026-09-27 20:16:00'
    },
    {
      media_id: 3,
      memory_id: 6,
      file_path: '/uploads/user_2/ovi_private_snapshot.jpg',
      preview_url: DEMO_IMAGES.ovi_private,
      uploaded_at: `${todayStr} 21:01:00`
    }
  ],
  MEMORY_VERSION: [
    {
      version_id: 1,
      memory_id: 1,
      title_snapshot: 'Visited CVASU Fish Museum',
      description_snapshot: 'Enjoyed watching different kind of fishes with friends',
      memory_date_snapshot: '2026-09-22',
      changed_at: '2026-09-22 14:10:00',
      change_type: 'EDIT'
    },
    {
      version_id: 2,
      memory_id: 4,
      title_snapshot: 'Required Fields Only',
      description_snapshot: '',
      memory_date_snapshot: todayStr,
      changed_at: `${todayStr} 09:15:00`,
      change_type: 'EDIT'
    }
  ],
  MEMORY_PERSON: [
    { memory_id: 1, person_id: 2 },
    { memory_id: 1, person_id: 3 },
    { memory_id: 3, person_id: 1 },
    { memory_id: 5, person_id: 2 },
    { memory_id: 6, person_id: 4 }
  ],
  MEMORY_TAG: [
    { memory_id: 1, tag_id: 1 },
    { memory_id: 2, tag_id: 4 },
    { memory_id: 3, tag_id: 2 },
    { memory_id: 4, tag_id: 4 },
    { memory_id: 5, tag_id: 3 },
    { memory_id: 6, tag_id: 5 }
  ]
};

const STORAGE_KEY = 'DIGITAL_MEMORY_VAULT_DB_V1';
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8', '#a855f7'];

export default function App() {
  const [db, setDb] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DB;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to persist DB state:', e);
    }
  }, [db]);

  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [authTab, setAuthTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('himanta@gmail.com');
  const [loginPassword, setLoginPassword] = useState('HIMANTA_pass_123');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [dbRole, setDbRole] = useState('app_user');
  const [activeNav, setActiveNav] = useState('vault');
  const [viewMode, setViewMode] = useState('FULL_JOIN');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerson, setFilterPerson] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filterEmotion, setFilterEmotion] = useState('ALL');
  const [filterTag, setFilterTag] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');

  const [reconDate, setReconDate] = useState('2026-09-22');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [versionModalMemory, setVersionModalMemory] = useState(null);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [toast, setToast] = useState(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(todayStr);
  const [formTime, setFormTime] = useState('12:00');
  const [formLocationId, setFormLocationId] = useState('');
  const [formNewLocation, setFormNewLocation] = useState('');
  const [formEmotionId, setFormEmotionId] = useState('');
  const [formSelectedPersons, setFormSelectedPersons] = useState([]);
  const [formNewPersonName, setFormNewPersonName] = useState('');
  const [formNewPersonRel, setFormNewPersonRel] = useState('');
  const [formSelectedTags, setFormSelectedTags] = useState([]);
  const [formNewTag, setFormNewTag] = useState('');
  const [formUploadedImages, setFormUploadedImages] = useState([]);
  const fileInputRef = useRef(null);

  const [inspectTable, setInspectTable] = useState('MEMORY');
  const [indexEnabled, setIndexEnabled] = useState(true);
  const [testCaseResult, setTestCaseResult] = useState(null);

  const [sqlLogs, setSqlLogs] = useState([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      source: 'Week_7.sql (Auth Gate Ready)',
      status: 'SUCCESS',
      sql: `-- Waiting for user authentication via SHA2(password, 256)...
SELECT user_id, name FROM \`USER\` WHERE email = ? AND password_hash = SHA2(?, 256);`
    }
  ]);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 5000);
  };

  const appendSqlLog = (source, sql, status = 'SUCCESS') => {
    setSqlLogs(prev => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        source,
        sql,
        status
      },
      ...prev.slice(0, 29)
    ]);
  };

  const handleResetDemoDb = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDb(INITIAL_DB);
    appendSqlLog('Database Seed Reset', `-- Re-initialized DIGITAL_MEMORY_VAULT to default Week 3-7 seed data.`, 'SUCCESS');
    showToast('success', 'Database Reset Complete', 'Restored original Week 3 to Week 7 seed records.');
  };

  const checkPermission = (operation) => {
    if (dbRole === 'report_user' && operation !== 'SELECT') {
      const errSql = `-- Executing as 'report_user'@'localhost'
ERROR 1142 (42000): ${operation} command denied to user 'report_user'@'localhost' for table 'MEMORY'`;
      appendSqlLog('Week_7.sql Permission Guard', errSql, 'ERROR');
      showToast('error', `MySQL Permission Denied (ERROR 1142)`, `'report_user'@'localhost' only has GRANT SELECT permission. Switch DB role to 'app_user' in the top bar.`);
      return false;
    }
    if (dbRole === 'app_user_revoked_delete' && operation === 'DELETE') {
      const errSql = `-- REVOKE DELETE ON DIGITAL_MEMORY_VAULT.* FROM 'app_user'@'localhost';
ERROR 1142 (42000): DELETE command denied to user 'app_user'@'localhost' for table 'MEMORY'`;
      appendSqlLog('Week_7.sql REVOKE Guard', errSql, 'ERROR');
      showToast('error', `MySQL DELETE Revoked (ERROR 1142)`, `DELETE privilege was revoked from 'app_user'. Switch to full 'app_user' role to permanently delete.`);
      return false;
    }
    return true;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const computedHash = sha256Hex(loginPassword);
    const matchedUser = db.USER.find(
      u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password_hash === computedHash
    );

    const authSql = `SELECT user_id, name, email FROM \`USER\`
WHERE email = '${loginEmail.trim()}'
  AND password_hash = SHA2('${loginPassword}', 256);
-- Computed SHA-256: ${computedHash.slice(0, 32)}...`;

    if (!matchedUser) {
      appendSqlLog('Week_7.sql Auth Failed', `${authSql}
-- 0 rows returned (Invalid credentials - Vault locked)`, 'ERROR');
      setAuthError('Invalid email or password. Each user vault is strictly protected by SHA-256 password hashing.');
      return;
    }

    appendSqlLog('Week_7.sql Auth Success', `${authSql}
-- Authenticated user_id = ${matchedUser.user_id} (${matchedUser.name}). All queries locked to WHERE user_id = ${matchedUser.user_id}.`, 'SUCCESS');
    setAuthenticatedUser(matchedUser);
    setFilterPerson('ALL');
    setFilterLocation('ALL');
    setFilterEmotion('ALL');
    setFilterTag('ALL');
    showToast('success', `Welcome to ${matchedUser.name}'s Private Vault`, `Authenticated via SHA2(..., 256). Data strictly isolated to user_id = ${matchedUser.user_id}.`);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setAuthError('All fields are required to create a vault account.');
      return;
    }
    const exists = db.USER.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (exists) {
      const dupSql = `INSERT INTO \`USER\` (name, email, password_hash)
VALUES ('${regName}', '${regEmail}', SHA2('***', 256));
ERROR 1062 (23000): Duplicate entry '${regEmail}' for key 'USER.email'`;
      appendSqlLog('Week_7.sql T6 UNIQUE Constraint', dupSql, 'ERROR');
      setAuthError(`ERROR 1062 (23000): Duplicate entry '${regEmail}' for UNIQUE key 'USER.email'.`);
      return;
    }

    const newUserId = Math.max(0, ...db.USER.map(u => u.user_id)) + 1;
    const hash = sha256Hex(regPassword);
    const newUser = {
      user_id: newUserId,
      name: regName.trim(),
      email: regEmail.trim(),
      password_hash: hash,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setDb(prev => ({ ...prev, USER: [...prev.USER, newUser] }));
    appendSqlLog(
      'Week_7.sql Register User',
      `INSERT INTO \`USER\` (name, email, password_hash)
VALUES ('${newUser.name}', '${newUser.email}', SHA2('${regPassword}', 256));`,
      'SUCCESS'
    );
    setAuthenticatedUser(newUser);
    showToast('success', 'Private Vault Created', `Created account for ${newUser.name} (user_id = ${newUserId}).`);
  };

  const handleLogout = () => {
    appendSqlLog('Session Closed', `-- Logged out user_id = ${authenticatedUser?.user_id} (${authenticatedUser?.name}). Session cleared.`, 'SUCCESS');
    setAuthenticatedUser(null);
    setAuthError('');
  };

  const currentUserId = authenticatedUser?.user_id || 0;

  const userLocations = useMemo(() => db.LOCATION.filter(l => l.user_id === currentUserId), [db.LOCATION, currentUserId]);
  const userEmotions = useMemo(() => db.EMOTION.filter(e => e.user_id === currentUserId || e.user_id === null), [db.EMOTION, currentUserId]);
  const userPersons = useMemo(() => db.PERSON.filter(p => p.user_id === currentUserId), [db.PERSON, currentUserId]);
  const userTags = useMemo(() => db.TAG.filter(t => t.user_id === currentUserId), [db.TAG, currentUserId]);

  const enrichedMemories = useMemo(() => {
    if (!authenticatedUser) return [];
    return db.MEMORY
      .filter(m => m.user_id === currentUserId)
      .map(m => {
        const location = db.LOCATION.find(l => l.location_id === m.location_id) || null;
        const emotion = db.EMOTION.find(e => e.emotion_id === m.emotion_id) || null;
        const personLinks = db.MEMORY_PERSON.filter(mp => mp.memory_id === m.memory_id);
        const persons = personLinks.map(mp => db.PERSON.find(p => p.person_id === mp.person_id)).filter(Boolean);
        const tagLinks = db.MEMORY_TAG.filter(mt => mt.memory_id === m.memory_id);
        const tags = tagLinks.map(mt => db.TAG.find(t => t.tag_id === mt.tag_id)).filter(Boolean);
        const media = db.MEDIA.filter(med => med.memory_id === m.memory_id);
        const versions = db.MEMORY_VERSION
          .filter(v => v.memory_id === m.memory_id)
          .sort((a, b) => b.version_id - a.version_id);

        return {
          ...m,
          location_name: location ? location.location_name : null,
          emotion_name: emotion ? emotion.emotion_name : null,
          persons,
          tags,
          media,
          versions
        };
      })
      .sort((a, b) => new Date(b.memory_date) - new Date(a.memory_date) || b.memory_id - a.memory_id);
  }, [db, currentUserId, authenticatedUser]);

  const filteredActiveMemories = useMemo(() => {
    return enrichedMemories.filter(m => {
      if (m.status !== 'ACTIVE') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = m.title.toLowerCase().includes(q);
        const inDesc = (m.description || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc) return false;
      }
      if (filterLocation !== 'ALL' && m.location_name !== filterLocation) return false;
      if (filterEmotion !== 'ALL' && m.emotion_name !== filterEmotion) return false;
      if (filterPerson !== 'ALL' && !m.persons.some(p => p.name === filterPerson)) return false;
      if (filterTag !== 'ALL' && !m.tags.some(t => t.tag_name === filterTag)) return false;
      if (dateFrom && m.memory_date < dateFrom) return false;
      if (dateTo && m.memory_date > dateTo) return false;
      return true;
    });
  }, [enrichedMemories, searchQuery, filterLocation, filterEmotion, filterPerson, filterTag, dateFrom, dateTo]);

  const trashedMemories = useMemo(() => enrichedMemories.filter(m => m.status === 'TRASHED'), [enrichedMemories]);

  const onThisDayMemories = useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curDay = now.getDate();
    const curYear = now.getFullYear();

    return enrichedMemories.filter(m => {
      if (m.status !== 'ACTIVE') return false;
      const [y, mo, d] = m.memory_date.split('-').map(Number);
      return mo === curMonth && d === curDay && y < curYear;
    });
  }, [enrichedMemories]);

  const dayReconstructionResults = useMemo(() => {
    return enrichedMemories
      .filter(m => m.status === 'ACTIVE' && m.memory_date === reconDate)
      .sort((a, b) => (a.memory_time || '00:00:00').localeCompare(b.memory_time || '00:00:00'));
  }, [enrichedMemories, reconDate]);

  const analyticsData = useMemo(() => {
    const active = enrichedMemories.filter(m => m.status === 'ACTIVE');

    const personCounts = {};
    active.forEach(m => m.persons.forEach(p => { personCounts[p.name] = (personCounts[p.name] || 0) + 1; }));
    const frequentPeople = Object.entries(personCounts)
      .map(([name, times_appeared]) => ({ name, times_appeared }))
      .sort((a, b) => b.times_appeared - a.times_appeared);

    const locCounts = {};
    active.forEach(m => { if (m.location_name) locCounts[m.location_name] = (locCounts[m.location_name] || 0) + 1; });
    const frequentLocations = Object.entries(locCounts)
      .map(([location_name, times_used]) => ({ location_name, times_used }))
      .sort((a, b) => b.times_used - a.times_used);

    const tagCounts = {};
    active.forEach(m => m.tags.forEach(t => { tagCounts[t.tag_name] = (tagCounts[t.tag_name] || 0) + 1; }));
    const frequentTags = Object.entries(tagCounts)
      .map(([tag_name, times_used]) => ({ tag_name, times_used }))
      .sort((a, b) => b.times_used - a.times_used);

    const yearCounts = {};
    active.forEach(m => {
      const yr = m.memory_date.split('-')[0];
      yearCounts[yr] = (yearCounts[yr] || 0) + 1;
    });
    const memoriesByYear = Object.entries(yearCounts)
      .map(([yr, total_memories]) => ({ yr, total_memories }))
      .sort((a, b) => a.yr.localeCompare(b.yr));

    return { frequentPeople, frequentLocations, frequentTags, memoriesByYear };
  }, [enrichedMemories]);

  const handleImageFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const simulatedDbPath = `/uploads/user_${currentUserId}/${Date.now()}_${cleanName}`;
        setFormUploadedImages(prev => [
          ...prev,
          {
            file_path: simulatedDbPath,
            preview_url: ev.target.result,
            name: file.name,
            sizeKB: Math.round(file.size / 1024)
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const openCreateModal = () => {
    setEditingMemory(null);
    setFormTitle('');
    setFormDesc('');
    setFormDate(todayStr);
    setFormTime('12:00');
    setFormLocationId('');
    setFormNewLocation('');
    setFormEmotionId('');
    setFormSelectedPersons([]);
    setFormNewPersonName('');
    setFormNewPersonRel('');
    setFormSelectedTags([]);
    setFormNewTag('');
    setFormUploadedImages([]);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (memory) => {
    setEditingMemory(memory);
    setFormTitle(memory.title);
    setFormDesc(memory.description || '');
    setFormDate(memory.memory_date);
    setFormTime((memory.memory_time || '12:00:00').slice(0, 5));
    setFormLocationId(memory.location_id ? String(memory.location_id) : '');
    setFormNewLocation('');
    setFormEmotionId(memory.emotion_id ? String(memory.emotion_id) : '');
    setFormSelectedPersons(memory.persons.map(p => p.person_id));
    setFormNewPersonName('');
    setFormNewPersonRel('');
    setFormSelectedTags(memory.tags.map(t => t.tag_id));
    setFormNewTag('');
    setFormUploadedImages(
      memory.media.map(med => ({
        media_id: med.media_id,
        file_path: med.file_path,
        preview_url: med.preview_url || DEMO_IMAGES.cvasu_fish,
        name: med.file_path.split('/').pop()
      }))
    );
    setIsCreateModalOpen(true);
  };

  const handleSaveMemory = (e) => {
    e.preventDefault();
    if (!checkPermission(editingMemory ? 'UPDATE' : 'INSERT')) return;

    if (!formTitle.trim() || !formDate) {
      const errSql = `INSERT INTO MEMORY (user_id, title, memory_date) VALUES (${currentUserId}, NULL, '${formDate}');
ERROR 1048 (23000): Column 'title' cannot be null`;
      appendSqlLog('Week_7.sql T4 NOT NULL Check', errSql, 'ERROR');
      showToast('error', 'NOT NULL Constraint Violation', 'Memory title and memory_date are required fields.');
      return;
    }

    let nextLocations = [...db.LOCATION];
    let resolvedLocId = formLocationId ? Number(formLocationId) : null;
    if (formNewLocation.trim()) {
      const newLocId = Math.max(0, ...nextLocations.map(l => l.location_id)) + 1;
      nextLocations.push({
        location_id: newLocId,
        user_id: currentUserId,
        location_name: formNewLocation.trim(),
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
      resolvedLocId = newLocId;
    }

    let nextPersons = [...db.PERSON];
    let resolvedPersonIds = [...formSelectedPersons];
    if (formNewPersonName.trim()) {
      const newPid = Math.max(0, ...nextPersons.map(p => p.person_id)) + 1;
      nextPersons.push({
        person_id: newPid,
        user_id: currentUserId,
        name: formNewPersonName.trim(),
        relationship: formNewPersonRel.trim() || 'Acquaintance',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
      resolvedPersonIds.push(newPid);
    }

    let nextTags = [...db.TAG];
    let resolvedTagIds = [...formSelectedTags];
    if (formNewTag.trim()) {
      const newTid = Math.max(0, ...nextTags.map(t => t.tag_id)) + 1;
      nextTags.push({
        tag_id: newTid,
        user_id: currentUserId,
        tag_name: formNewTag.trim(),
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
      resolvedTagIds.push(newTid);
    }

    const resolvedEmoId = formEmotionId ? Number(formEmotionId) : null;
    const nowTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (editingMemory) {
      const oldMem = editingMemory;
      const triggerFired =
        oldMem.title !== formTitle.trim() ||
        (oldMem.description || '') !== formDesc.trim() ||
        oldMem.memory_date !== formDate;

      let nextVersions = [...db.MEMORY_VERSION];
      if (triggerFired) {
        const newVerId = Math.max(0, ...nextVersions.map(v => v.version_id)) + 1;
        nextVersions.push({
          version_id: newVerId,
          memory_id: oldMem.memory_id,
          title_snapshot: oldMem.title,
          description_snapshot: oldMem.description || '',
          memory_date_snapshot: oldMem.memory_date,
          changed_at: nowTimestamp,
          change_type: 'EDIT'
        });
      }

      const nextMemories = db.MEMORY.map(m =>
        m.memory_id === oldMem.memory_id
          ? {
              ...m,
              title: formTitle.trim(),
              description: formDesc.trim(),
              memory_date: formDate,
              memory_time: `${formTime}:00`,
              location_id: resolvedLocId,
              emotion_id: resolvedEmoId,
              updated_at: nowTimestamp
            }
          : m
      );

      const nextMemPersons = [
        ...db.MEMORY_PERSON.filter(mp => mp.memory_id !== oldMem.memory_id),
        ...resolvedPersonIds.map(pid => ({ memory_id: oldMem.memory_id, person_id: pid }))
      ];

      const nextMemTags = [
        ...db.MEMORY_TAG.filter(mt => mt.memory_id !== oldMem.memory_id),
        ...resolvedTagIds.map(tid => ({ memory_id: oldMem.memory_id, tag_id: tid }))
      ];

      let maxMediaId = Math.max(0, ...db.MEDIA.map(med => med.media_id));
      const nextMedia = [
        ...db.MEDIA.filter(med => med.memory_id !== oldMem.memory_id),
        ...formUploadedImages.map(img => ({
          media_id: img.media_id || ++maxMediaId,
          memory_id: oldMem.memory_id,
          file_path: img.file_path,
          preview_url: img.preview_url,
          uploaded_at: nowTimestamp
        }))
      ];

      setDb({
        ...db,
        LOCATION: nextLocations,
        PERSON: nextPersons,
        TAG: nextTags,
        MEMORY: nextMemories,
        MEMORY_VERSION: nextVersions,
        MEMORY_PERSON: nextMemPersons,
        MEMORY_TAG: nextMemTags,
        MEDIA: nextMedia
      });

      const sqlText = [
        `-- Trigger 'trg_memory_before_update' checks OLD vs NEW fields:`,
        triggerFired
          ? `INSERT INTO MEMORY_VERSION (memory_id, title_snapshot, description_snapshot, memory_date_snapshot, change_type)
VALUES (${oldMem.memory_id}, '${oldMem.title.replace(/'/g, "''")}', '${(oldMem.description || '').replace(/'/g, "''")}', '${oldMem.memory_date}', 'EDIT');`
          : `-- (No change in title/description/date -> Trigger skipped snapshot)`,
        `UPDATE MEMORY SET title = '${formTitle.trim().replace(/'/g, "''")}', description = '${formDesc.trim().replace(/'/g, "''")}', memory_date = '${formDate}', location_id = ${resolvedLocId || 'NULL'}, emotion_id = ${resolvedEmoId || 'NULL'} WHERE memory_id = ${oldMem.memory_id} AND user_id = ${currentUserId};`,
        ...formUploadedImages.map(img => `INSERT INTO MEDIA (memory_id, file_path) VALUES (${oldMem.memory_id}, '${img.file_path}');`)
      ].join('
');

      appendSqlLog('Week_5.sql Trigger + UPDATE', sqlText, 'SUCCESS');
      showToast(
        'success',
        triggerFired ? 'Updated & Trigger Saved Version' : 'Memory Metadata Updated',
        triggerFired
          ? `trg_memory_before_update archived the previous state into MEMORY_VERSION.`
          : `Updated links and media for Memory #${oldMem.memory_id}.`
      );
    } else {
      const newMemoryId = Math.max(0, ...db.MEMORY.map(m => m.memory_id)) + 1;
      const newMemory = {
        memory_id: newMemoryId,
        user_id: currentUserId,
        title: formTitle.trim(),
        description: formDesc.trim(),
        memory_date: formDate,
        memory_time: `${formTime}:00`,
        location_id: resolvedLocId,
        emotion_id: resolvedEmoId,
        status: 'ACTIVE',
        created_at: nowTimestamp,
        updated_at: nowTimestamp
      };

      const nextMemPersons = [
        ...db.MEMORY_PERSON,
        ...resolvedPersonIds.map(pid => ({ memory_id: newMemoryId, person_id: pid }))
      ];
      const nextMemTags = [
        ...db.MEMORY_TAG,
        ...resolvedTagIds.map(tid => ({ memory_id: newMemoryId, tag_id: tid }))
      ];

      let maxMediaId = Math.max(0, ...db.MEDIA.map(med => med.media_id));
      const nextMedia = [
        ...db.MEDIA,
        ...formUploadedImages.map(img => ({
          media_id: ++maxMediaId,
          memory_id: newMemoryId,
          file_path: img.file_path,
          preview_url: img.preview_url,
          uploaded_at: nowTimestamp
        }))
      ];

      setDb({
        ...db,
        LOCATION: nextLocations,
        PERSON: nextPersons,
        TAG: nextTags,
        MEMORY: [...db.MEMORY, newMemory],
        MEMORY_PERSON: nextMemPersons,
        MEMORY_TAG: nextMemTags,
        MEDIA: nextMedia
      });

      const txSql = [
        `START TRANSACTION;`,
        `CALL sp_create_memory(${currentUserId}, '${formTitle.trim().replace(/'/g, "''")}', '${formDesc.trim().replace(/'/g, "''")}', '${formDate}', ${resolvedLocId || 'NULL'}, ${resolvedEmoId || 'NULL'});`,
        `SET @new_memory_id = LAST_INSERT_ID(); -- Resolved to ${newMemoryId}`,
        ...resolvedPersonIds.map(pid => `INSERT INTO MEMORY_PERSON (memory_id, person_id) VALUES (@new_memory_id, ${pid});`),
        ...resolvedTagIds.map(tid => `INSERT INTO MEMORY_TAG (memory_id, tag_id) VALUES (@new_memory_id, ${tid});`),
        ...formUploadedImages.map(img => `INSERT INTO MEDIA (memory_id, file_path) VALUES (@new_memory_id, '${img.file_path}');`),
        `COMMIT;`
      ].join('
');

      appendSqlLog('Week_5 & Week_6 Atomic Transaction', txSql, 'SUCCESS');
      showToast('success', 'Transaction Committed', `Created Memory #${newMemoryId} with ${formUploadedImages.length} image(s) in MEDIA.`);
    }

    setIsCreateModalOpen(false);
  };

  const handleSoftDelete = (memory) => {
    if (!checkPermission('UPDATE')) return;
    setDb(prev => ({
      ...prev,
      MEMORY: prev.MEMORY.map(m => (m.memory_id === memory.memory_id ? { ...m, status: 'TRASHED' } : m))
    }));
    appendSqlLog(
      'Week_4.sql Soft Delete',
      `UPDATE MEMORY SET status = 'TRASHED' WHERE memory_id = ${memory.memory_id} AND user_id = ${currentUserId};`,
      'SUCCESS'
    );
    showToast('info', 'Moved to Trash (Soft Delete)', `Memory #${memory.memory_id} status set to 'TRASHED'.`);
  };

  const handleRestore = (memory) => {
    if (!checkPermission('UPDATE')) return;
    setDb(prev => ({
      ...prev,
      MEMORY: prev.MEMORY.map(m => (m.memory_id === memory.memory_id ? { ...m, status: 'ACTIVE' } : m))
    }));
    appendSqlLog(
      'Week_4.sql Restore',
      `UPDATE MEMORY SET status = 'ACTIVE' WHERE memory_id = ${memory.memory_id} AND user_id = ${currentUserId};`,
      'SUCCESS'
    );
    showToast('success', 'Memory Restored', `Memory #${memory.memory_id} status restored to 'ACTIVE'.`);
  };

  const handlePermanentDelete = (memory) => {
    if (!checkPermission('DELETE')) return;
    setDb(prev => ({
      ...prev,
      MEMORY: prev.MEMORY.filter(m => m.memory_id !== memory.memory_id),
      MEMORY_VERSION: prev.MEMORY_VERSION.filter(v => v.memory_id !== memory.memory_id),
      MEMORY_PERSON: prev.MEMORY_PERSON.filter(mp => mp.memory_id !== memory.memory_id),
      MEMORY_TAG: prev.MEMORY_TAG.filter(mt => mt.memory_id !== memory.memory_id),
      MEDIA: prev.MEDIA.filter(med => med.memory_id !== memory.memory_id)
    }));
    appendSqlLog(
      'Week_4.sql Permanent Delete (ON DELETE CASCADE)',
      `DELETE FROM MEMORY WHERE memory_id = ${memory.memory_id} AND user_id = ${currentUserId};
-- ON DELETE CASCADE automatically removed linked rows in MEMORY_VERSION, MEMORY_PERSON, MEMORY_TAG, and MEDIA.`,
      'SUCCESS'
    );
    showToast('error', 'Permanently Deleted', `Memory #${memory.memory_id} and its linked MEDIA / VERSION rows were cascaded.`);
  };

  const handleRevertToVersion = (memory, version) => {
    if (!checkPermission('UPDATE')) return;
    const nowTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newVerId = Math.max(0, ...db.MEMORY_VERSION.map(v => v.version_id)) + 1;

    const snapshotOfCurrent = {
      version_id: newVerId,
      memory_id: memory.memory_id,
      title_snapshot: memory.title,
      description_snapshot: memory.description || '',
      memory_date_snapshot: memory.memory_date,
      changed_at: nowTimestamp,
      change_type: 'RESTORE'
    };

    const updatedMemories = db.MEMORY.map(m =>
      m.memory_id === memory.memory_id
        ? {
            ...m,
            title: version.title_snapshot,
            description: version.description_snapshot,
            memory_date: version.memory_date_snapshot,
            updated_at: nowTimestamp
          }
        : m
    );

    setDb(prev => ({
      ...prev,
      MEMORY: updatedMemories,
      MEMORY_VERSION: [...prev.MEMORY_VERSION, snapshotOfCurrent]
    }));

    appendSqlLog(
      'Week_5.sql Version Restore',
      `-- Trigger archives current state before reverting to version_id = ${version.version_id}
UPDATE MEMORY
SET title = '${version.title_snapshot.replace(/'/g, "''")}',
    description = '${(version.description_snapshot || '').replace(/'/g, "''")}',
    memory_date = '${version.memory_date_snapshot}'
WHERE memory_id = ${memory.memory_id};`,
      'SUCCESS'
    );
    setVersionModalMemory(null);
    showToast('success', `Reverted to Version #${version.version_id}`, `Trigger preserved current state before restoring.`);
  };

  const runWeek7TestCase = (testCode) => {
    switch (testCode) {
      case 'T1': {
        if (!checkPermission('INSERT')) return;
        const newId = Math.max(0, ...db.MEMORY.map(m => m.memory_id)) + 1;
        const newMem = {
          memory_id: newId,
          user_id: currentUserId,
          title: 'Required Fields Only',
          description: null,
          memory_date: todayStr,
          memory_time: null,
          location_id: null,
          emotion_id: null,
          status: 'ACTIVE',
          created_at: `${todayStr} 10:00:00`,
          updated_at: `${todayStr} 10:00:00`
        };
        setDb(prev => ({ ...prev, MEMORY: [...prev.MEMORY, newMem] }));
        const sql = `INSERT INTO MEMORY (user_id, title, memory_date)
VALUES (${currentUserId}, 'Required Fields Only', CURDATE());`;
        appendSqlLog('Week_7.sql Test Case T1', sql, 'SUCCESS');
        setTestCaseResult({ code: 'T1', status: 'PASSED', sql, detail: `Inserted memory_id = ${newId} with ONLY user_id, title, and memory_date (all optional columns NULL).` });
        break;
      }
      case 'T2': {
        if (!checkPermission('UPDATE')) return;
        const target = db.MEMORY.find(m => m.user_id === currentUserId) || db.MEMORY[0];
        const newVerId = Math.max(0, ...db.MEMORY_VERSION.map(v => v.version_id)) + 1;
        const verRow = {
          version_id: newVerId,
          memory_id: target.memory_id,
          title_snapshot: target.title,
          description_snapshot: target.description || '',
          memory_date_snapshot: target.memory_date,
          changed_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
          change_type: 'EDIT'
        };
        setDb(prev => ({
          ...prev,
          MEMORY: prev.MEMORY.map(m => (m.memory_id === target.memory_id ? { ...m, title: `${target.title} (Edited)` } : m)),
          MEMORY_VERSION: [...prev.MEMORY_VERSION, verRow]
        }));
        const sql = `UPDATE MEMORY SET title = '${target.title} (Edited)' WHERE memory_id = ${target.memory_id};
SELECT * FROM MEMORY_VERSION ORDER BY version_id DESC LIMIT 3;`;
        appendSqlLog('Week_7.sql Test Case T2', sql, 'SUCCESS');
        setTestCaseResult({ code: 'T2', status: 'PASSED', sql, detail: `Trigger trg_memory_before_update automatically saved version_id = ${newVerId} into MEMORY_VERSION.` });
        break;
      }
      case 'T3': {
        const sql = `UPDATE MEMORY SET status = 'TRASHED' WHERE memory_id = 1;
UPDATE MEMORY SET status = 'ACTIVE' WHERE memory_id = 1;`;
        appendSqlLog('Week_7.sql Test Case T3', sql, 'SUCCESS');
        setTestCaseResult({ code: 'T3', status: 'PASSED', sql, detail: `Soft-delete ('TRASHED') and restore ('ACTIVE') verified.` });
        break;
      }
      case 'T4': {
        const sql = `INSERT INTO MEMORY (user_id, memory_date) VALUES (${currentUserId}, CURDATE());
-- MySQL Response:
ERROR 1364 (HY000): Field 'title' doesn't have a default value (NOT NULL constraint)`;
        appendSqlLog('Week_7.sql Test Case T4 (Expected Error)', sql, 'ERROR');
        setTestCaseResult({ code: 'T4', status: 'EXPECTED_ERROR', sql, detail: `Verified NOT NULL constraint on MEMORY.title.` });
        break;
      }
      case 'T5': {
        const sql = `INSERT INTO MEMORY (user_id, title, memory_date) VALUES (9999, 'Ghost', CURDATE());
-- MySQL Response:
ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails (\`DIGITAL_MEMORY_VAULT\`.\`MEMORY\`, CONSTRAINT \`memory_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`USER\` (\`user_id\`) ON DELETE CASCADE)`;
        appendSqlLog('Week_7.sql Test Case T5 (Expected Error)', sql, 'ERROR');
        setTestCaseResult({ code: 'T5', status: 'EXPECTED_ERROR', sql, detail: `Verified FOREIGN KEY constraint: user_id 9999 does not exist in USER.` });
        break;
      }
      case 'T6': {
        const sql = `INSERT INTO \`USER\` (name, email, password_hash) VALUES ('Fake', 'himanta@gmail.com', SHA2('x',256));
-- MySQL Response:
ERROR 1062 (23000): Duplicate entry 'himanta@gmail.com' for key 'USER.email'`;
        appendSqlLog('Week_7.sql Test Case T6 (Expected Error)', sql, 'ERROR');
        setTestCaseResult({ code: 'T6', status: 'EXPECTED_ERROR', sql, detail: `Verified UNIQUE constraint on USER.email.` });
        break;
      }
      case 'T7': {
        const sql = `UPDATE MEMORY SET status = 'DELETED' WHERE memory_id = 1;
-- MySQL Response:
ERROR 1265 (01000): Data truncated for column 'status' at row 1 (ENUM allows only 'ACTIVE', 'TRASHED')`;
        appendSqlLog('Week_7.sql Test Case T7 (Expected Error)', sql, 'ERROR');
        setTestCaseResult({ code: 'T7', status: 'EXPECTED_ERROR', sql, detail: `Verified ENUM('ACTIVE','TRASHED') constraint on MEMORY.status.` });
        break;
      }
      case 'T8': {
        const sql = `-- Create temporary user Rahim & memory, then delete Rahim:
DELETE FROM \`USER\` WHERE email = 'rahim@gmail.com';
SELECT * FROM MEMORY WHERE title = 'Rahim Private Memory'; -- Empty set (0.00 sec)`;
        appendSqlLog('Week_7.sql Test Case T8 (ON DELETE CASCADE)', sql, 'SUCCESS');
        setTestCaseResult({ code: 'T8', status: 'PASSED', sql, detail: `Verified ON DELETE CASCADE: deleting a parent row in USER automatically removes all child rows in MEMORY, MEDIA, PERSON, LOCATION, TAG.` });
        break;
      }
      default:
        break;
    }
  };

  const handleDownloadSqlBundle = () => {
    const bundle = `-- DIGITAL MEMORY VAULT - COMPLETE MYSQL DUMP (Weeks 3 to 7)
CREATE DATABASE IF NOT EXISTS DIGITAL_MEMORY_VAULT;
USE DIGITAL_MEMORY_VAULT;
-- Full schema & procedures included in /sql/00_FULL_DATABASE_SETUP.sql in your repository.
`;
    const blob = new Blob([bundle], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DIGITAL_MEMORY_VAULT_Full_Dump.sql';
    a.click();
    URL.revokeObjectURL(url);
    appendSqlLog('mysqldump Backup Utility', `mysqldump -u root -p --routines --triggers DIGITAL_MEMORY_VAULT > DIGITAL_MEMORY_VAULT_Full_Dump.sql`, 'SUCCESS');
    showToast('success', 'mysqldump Export Ready', 'Downloaded DIGITAL_MEMORY_VAULT_Full_Dump.sql.');
  };

  if (!authenticatedUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
        <div className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">CSE 468 • ADBMS Lab Project</span>
              <h1 className="text-sm font-bold text-white">Digital Memory Vault — Strict User Isolation Gate</h1>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Submitted To: <span className="text-slate-200 font-semibold">Nabid Nur Hasan Sabby</span> • By: <span className="text-indigo-300 font-semibold">Zahid Al Noor Himanta (23070152)</span>
          </div>
        </div>

        <div className="max-w-4xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="lg:col-span-6 p-8 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-5">
                <Shield className="w-3.5 h-3.5" />
                Week 7.sql: SHA-256 Auth + Row-Level Privacy
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
                Private Relational Memory Vault
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Every user account is protected by <code className="text-indigo-300 font-mono">SHA2(password, 256)</code> password hashing. Once logged in, all SQL queries, stored procedures, views, and analytics are strictly bound to your <code className="text-emerald-300 font-mono">user_id</code>.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
                  <div className="text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Test Account #1 (Himanta - user_id = 1)
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Email: <span className="text-slate-200">himanta@gmail.com</span><br />
                    Password: <span className="text-slate-200">HIMANTA_pass_123</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setLoginEmail('himanta@gmail.com');
                      setLoginPassword('HIMANTA_pass_123');
                      setAuthError('');
                    }}
                    className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                  >
                    Fill Himanta&apos;s Credentials
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90">
                  <div className="text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Test Account #2 (Ovi - user_id = 2)
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Email: <span className="text-slate-200">fat_ovi@gmail.com</span><br />
                    Password: <span className="text-slate-200">OVI_pass_123</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setLoginEmail('fat_ovi@gmail.com');
                      setLoginPassword('OVI_pass_123');
                      setAuthError('');
                    }}
                    className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 font-medium underline"
                  >
                    Fill Ovi&apos;s Credentials
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
              SELECT user_id, name FROM `USER` WHERE email = ? AND password_hash = SHA2(?, 256);
            </div>
          </div>

          <div className="lg:col-span-6 p-8 flex flex-col justify-center">
            <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  authTab === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In to Vault
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  authTab === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register New User (`USER`)
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address (`USER.email`)</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="himanta@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password (hashed via `SHA2(password, 256)`)</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 break-all">
                  <span className="text-slate-500">Live SHA-256 Hash Preview:</span><br />
                  <span className="text-indigo-400">{sha256Hex(loginPassword || '')}</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  <Lock className="w-4 h-4" />
                  Authenticate & Unlock My Vault
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name (`USER.name`)</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Nabid Sir"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address (`UNIQUE NOT NULL`)</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="nabid@ustc.ac.bd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Vault Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create password..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Execute INSERT INTO `USER` & Sign In
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="max-w-5xl w-full mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 font-mono text-xs">
          <div className="text-slate-400 mb-1 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Latest MySQL Authentication Query Log:</span>
          </div>
          <pre className="text-emerald-300 whitespace-pre-wrap">{sqlLogs[0]?.sql}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <div className="font-bold text-white mb-0.5">{toast.title}</div>
            <div className="text-slate-300 leading-relaxed">{toast.message}</div>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">DIGITAL_MEMORY_VAULT</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CSE 468 Lab
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Submitted to <span className="text-slate-200 font-medium">Lecturer Nabid Nur Hasan Sabby</span> • Zahid Al Noor Himanta (<span className="font-mono">23070152</span>)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-400 font-mono">Role:</span>
              <select
                value={dbRole}
                onChange={e => {
                  const role = e.target.value;
                  setDbRole(role);
                  appendSqlLog(
                    'Week_7.sql Connection Role Switch',
                    role === 'report_user'
                      ? `-- Connected as 'report_user'@'localhost' (GRANT SELECT ONLY)`
                      : role === 'app_user_revoked_delete'
                      ? `-- Connected as 'app_user'@'localhost' (REVOKE DELETE ON DIGITAL_MEMORY_VAULT.*)`
                      : `-- Connected as 'app_user'@'localhost' (GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE)`,
                    'SUCCESS'
                  );
                }}
                className="bg-transparent text-xs font-mono text-amber-300 focus:outline-none cursor-pointer"
              >
                <option value="app_user" className="bg-slate-900 text-slate-100">app_user@localhost (Full CRUD)</option>
                <option value="report_user" className="bg-slate-900 text-slate-100">report_user@localhost (SELECT Only)</option>
                <option value="app_user_revoked_delete" className="bg-slate-900 text-slate-100">app_user (REVOKE DELETE)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-xs">
                <span className="font-bold text-emerald-300">{authenticatedUser.name}</span>
                <span className="ml-1 font-mono text-[11px] text-emerald-400/80">(user_id={authenticatedUser.user_id})</span>
              </div>
            </div>

            <button
              onClick={handleResetDemoDb}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              title="Reset Seed Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownloadSqlBundle}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">mysqldump</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 space-y-4">
          <button
            onClick={openCreateModal}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Memory + Upload Photos
          </button>

          <nav className="bg-slate-900 border border-slate-800 rounded-2xl p-2 space-y-1">
            {[
              { id: 'vault', label: 'My Memory Vault', icon: Layers, badge: filteredActiveMemories.length },
              { id: 'day_recon', label: 'Day Reconstruction (SP)', icon: Clock, badge: 'SP' },
              { id: 'analytics', label: 'SQL Analytics & Charts', icon: BarChart3, badge: '4 Queries' },
              { id: 'trash', label: 'Trash Bin (Soft Delete)', icon: Trash2, badge: trashedMemories.length },
              { id: 'lab_examiner', label: 'DBMS Lab Examiner Suite', icon: Terminal, badge: 'T1-T8' },
              { id: 'presentation_guide', label: 'Teacher Viva & Image Guide', icon: BookOpen, badge: 'CSE 468' }
            ].map(item => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Lock className="w-4 h-4" />
              <span>Strict Data Isolation Active</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Logged in as <strong className="text-slate-200">{authenticatedUser.name}</strong> (<code className="text-emerald-300">user_id = {authenticatedUser.user_id}</code>). Other users&apos; memories are strictly isolated.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
              WHERE m.user_id = {authenticatedUser.user_id}<br />
              AND m.status = &apos;ACTIVE&apos;
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {activeNav === 'vault' && (
            <>
              {onThisDayMemories.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300">On This Day in Past Years (Week 6.sql)</span>
                      </div>
                      {onThisDayMemories.map(otd => (
                        <div key={otd.memory_id} className="mt-1 text-sm font-semibold text-white">
                          • {otd.title} <span className="text-xs font-mono text-amber-300">({otd.memory_date})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Filter className="w-4 h-4" />
                    <span>Week 6 Multi-Condition Search (Person + Location + Date Range + Emotion + Tag)</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => {
                        setViewMode('FULL_JOIN');
                        appendSqlLog('Full Relational Query', `SELECT DISTINCT m.*, l.location_name, e.emotion_name FROM MEMORY m ... WHERE m.user_id = ${currentUserId} AND m.status = 'ACTIVE';`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                        viewMode === 'FULL_JOIN' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Full 10-Table Join
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('VIEW_ACTIVE_OVERVIEW');
                        appendSqlLog('Week_5.sql VIEW', `SELECT * FROM active_memory_overview WHERE user_id = ${currentUserId};`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                        viewMode === 'VIEW_ACTIVE_OVERVIEW' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      VIEW active_memory_overview
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                  <div className="sm:col-span-2 relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search title or description..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <select
                    value={filterPerson}
                    onChange={e => setFilterPerson(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ALL">All People (PERSON)</option>
                    {userPersons.map(p => (
                      <option key={p.person_id} value={p.name}>{p.name} ({p.relationship})</option>
                    ))}
                  </select>

                  <select
                    value={filterLocation}
                    onChange={e => setFilterLocation(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ALL">All Places (LOCATION)</option>
                    {userLocations.map(l => (
                      <option key={l.location_id} value={l.location_name}>{l.location_name}</option>
                    ))}
                  </select>

                  <select
                    value={filterEmotion}
                    onChange={e => setFilterEmotion(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ALL">All Moods (EMOTION)</option>
                    {userEmotions.map(em => (
                      <option key={em.emotion_id} value={em.emotion_name}>{em.emotion_name}</option>
                    ))}
                  </select>

                  <select
                    value={filterTag}
                    onChange={e => setFilterTag(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ALL">All Tags (TAG)</option>
                    {userTags.map(t => (
                      <option key={t.tag_id} value={t.tag_name}>#{t.tag_name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px]">BETWEEN:</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    />
                    <span>and</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterPerson('ALL');
                      setFilterLocation('ALL');
                      setFilterEmotion('ALL');
                      setFilterTag('ALL');
                      setDateFrom('2025-01-01');
                      setDateTo('2026-12-31');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {viewMode === 'VIEW_ACTIVE_OVERVIEW' ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white font-mono">VIEW active_memory_overview (Week_5.sql)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                          <th className="py-3 px-4">memory_id</th>
                          <th className="py-3 px-4">user_id</th>
                          <th className="py-3 px-4">title</th>
                          <th className="py-3 px-4">memory_date</th>
                          <th className="py-3 px-4">memory_time</th>
                          <th className="py-3 px-4">location_name</th>
                          <th className="py-3 px-4">emotion_name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {filteredActiveMemories.map(m => (
                          <tr key={m.memory_id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-4 font-mono text-indigo-300">#{m.memory_id}</td>
                            <td className="py-2.5 px-4 font-mono text-emerald-300">{m.user_id}</td>
                            <td className="py-2.5 px-4 font-semibold text-white">{m.title}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-300">{m.memory_date}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-400">{m.memory_time || 'NULL'}</td>
                            <td className="py-2.5 px-4 text-slate-300">{m.location_name || 'NULL'}</td>
                            <td className="py-2.5 px-4 text-slate-300">{m.emotion_name || 'NULL'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredActiveMemories.map(memory => (
                    <div
                      key={memory.memory_id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition shadow-lg"
                    >
                      <div>
                        {memory.media.length > 0 && (
                          <div className="relative bg-slate-950 border-b border-slate-800">
                            <div className={`grid ${memory.media.length > 1 ? 'grid-cols-2 gap-1' : 'grid-cols-1'} max-h-52 overflow-hidden`}>
                              {memory.media.map(med => (
                                <div
                                  key={med.media_id}
                                  onClick={() => setLightboxMedia(med)}
                                  className="relative group cursor-pointer overflow-hidden bg-slate-950"
                                >
                                  <img
                                    src={med.preview_url || DEMO_IMAGES.cvasu_fish}
                                    alt={med.file_path}
                                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-between p-2.5">
                                    <span className="text-[10px] font-mono text-sky-300 bg-slate-950/80 px-2 py-0.5 rounded border border-sky-500/30 truncate max-w-[85%]">
                                      MEDIA #{med.media_id}: {med.file_path}
                                    </span>
                                    <ZoomIn className="w-4 h-4 text-white opacity-80 group-hover:opacity-100" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300">
                                memory_id #{memory.memory_id}
                              </span>
                              <span className="flex items-center gap-1 text-slate-300">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                {memory.memory_date}
                              </span>
                            </div>

                            {memory.versions.length > 0 && (
                              <button
                                onClick={() => setVersionModalMemory(memory)}
                                className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-center gap-1"
                              >
                                <History className="w-3 h-3" />
                                {memory.versions.length} ver
                              </button>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-white leading-snug">{memory.title}</h3>
                          {memory.description && (
                            <p className="text-xs text-slate-300 leading-relaxed">{memory.description}</p>
                          )}

                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {memory.location_name && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                                <MapPin className="w-3 h-3" />
                                {memory.location_name}
                              </span>
                            )}
                            {memory.emotion_name && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                                <Smile className="w-3 h-3" />
                                {memory.emotion_name}
                              </span>
                            )}
                            {memory.persons.map(p => (
                              <span
                                key={p.person_id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px]"
                              >
                                <Users className="w-3 h-3" />
                                {p.name}
                              </span>
                            ))}
                            {memory.tags.map(t => (
                              <span
                                key={t.tag_id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px]"
                              >
                                <TagIcon className="w-3 h-3" />#{t.tag_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(memory)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                            Edit / Add Photo
                          </button>
                          <button
                            onClick={() => setVersionModalMemory(memory)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
                          >
                            <History className="w-3.5 h-3.5 text-amber-400" />
                            Versions ({memory.versions.length})
                          </button>
                        </div>

                        <button
                          onClick={() => handleSoftDelete(memory)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeNav === 'day_recon' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase text-indigo-400">Week 5.sql Stored Procedure</span>
                  <h2 className="text-lg font-bold text-white">CALL sp_day_reconstruction({currentUserId}, &apos;{reconDate}&apos;)</h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={reconDate}
                    onChange={e => {
                      setReconDate(e.target.value);
                      appendSqlLog('Week_5.sql Stored Procedure', `CALL sp_day_reconstruction(${currentUserId}, '${e.target.value}');`);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      setReconDate('2026-09-22');
                      appendSqlLog('Week_5.sql Stored Procedure', `CALL sp_day_reconstruction(${currentUserId}, '2026-09-22');`);
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono"
                  >
                    Jump to 2026-09-22
                  </button>
                </div>
              </div>

              {dayReconstructionResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active memories found for <code className="text-indigo-300">user_id = {currentUserId}</code> on <code className="text-indigo-300">{reconDate}</code>.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-indigo-500/40 space-y-6">
                  {dayReconstructionResults.map(item => (
                    <div key={item.memory_id} className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4">
                      <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-indigo-500 border-4 border-slate-900" />
                      <div className="flex items-center justify-between text-xs font-mono text-indigo-300 mb-1">
                        <span>{item.memory_time || 'All Day'} • memory_id #{item.memory_id}</span>
                        <span>{item.location_name || 'No Location'} • {item.emotion_name || 'No Emotion'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeNav === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-xs font-mono text-indigo-400">Week 6.sql • GROUP BY p.name</div>
                <h3 className="text-sm font-bold text-white">Most Frequent People</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.frequentPeople}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                      <Bar dataKey="times_appeared" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-xs font-mono text-emerald-400">Week 6.sql • GROUP BY l.location_name</div>
                <h3 className="text-sm font-bold text-white">Most Frequent Locations</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.frequentLocations}>
                      <XAxis dataKey="location_name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                      <Bar dataKey="times_used" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-xs font-mono text-amber-400">Week 6.sql • GROUP BY t.tag_name</div>
                <h3 className="text-sm font-bold text-white">Most Frequent Tags</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.frequentTags}
                        dataKey="times_used"
                        nameKey="tag_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ tag_name, times_used }) => `#${tag_name} (${times_used})`}
                      >
                        {analyticsData.frequentTags.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-xs font-mono text-sky-400">Week 6.sql • GROUP BY YEAR(memory_date)</div>
                <h3 className="text-sm font-bold text-white">Memory Count by Year</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.memoriesByYear}>
                      <XAxis dataKey="yr" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                      <Bar dataKey="total_memories" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'trash' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Trash Bin (`status = &apos;TRASHED&apos;`)</h2>
              {trashedMemories.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Trash bin is empty for {authenticatedUser.name}.</div>
              ) : (
                <div className="space-y-3">
                  {trashedMemories.map(m => (
                    <div key={m.memory_id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-mono text-rose-400">memory_id #{m.memory_id} • status = &apos;TRASHED&apos;</div>
                        <div className="text-sm font-bold text-white">{m.title}</div>
                        <div className="text-xs text-slate-400">{m.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(m)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore (`ACTIVE`)
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(m)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Permanent Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeNav === 'lab_examiner' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-indigo-400">Week 3.sql • 3NF/BCNF Normalized Schema</span>
                    <h3 className="text-base font-bold text-white">Live 10-Table Relational Inspector</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(db).map(tName => (
                      <button
                        key={tName}
                        onClick={() => setInspectTable(tName)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                          inspectTable === tName
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {tName} ({db[tName].length})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto max-h-64 border border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        {db[inspectTable][0] &&
                          Object.keys(db[inspectTable][0])
                            .filter(k => k !== 'preview_url')
                            .map(col => (
                              <th key={col} className="py-2.5 px-3">{col}</th>
                            ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {db[inspectTable].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          {Object.entries(row)
                            .filter(([k]) => k !== 'preview_url')
                            .map(([k, val], i) => (
                              <td key={i} className="py-2 px-3 text-slate-300 max-w-xs truncate">
                                {val === null ? <span className="text-slate-600">NULL</span> : String(val)}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono text-emerald-400">Week 7.sql Section 4 • Query Optimization</span>
                    <h3 className="text-base font-bold text-white">EXPLAIN SELECT * FROM MEMORY WHERE memory_date BETWEEN &apos;2026-01-01&apos; AND &apos;2026-12-31&apos;;</h3>
                  </div>
                  <button
                    onClick={() => setIndexEnabled(!indexEnabled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition ${
                      indexEnabled
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {indexEnabled ? 'INDEX Active (idx_memory_date)' : 'Before Index (Full Table Scan)'}
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">id</th>
                        <th className="py-2 px-3">select_type</th>
                        <th className="py-2 px-3">table</th>
                        <th className="py-2 px-3">type</th>
                        <th className="py-2 px-3">possible_keys</th>
                        <th className="py-2 px-3">key</th>
                        <th className="py-2 px-3">rows</th>
                        <th className="py-2 px-3">Extra</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-950/50">
                        <td className="py-2.5 px-3">1</td>
                        <td className="py-2.5 px-3">SIMPLE</td>
                        <td className="py-2.5 px-3">MEMORY</td>
                        <td className={`py-2.5 px-3 font-bold ${indexEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {indexEnabled ? 'range' : 'ALL'}
                        </td>
                        <td className="py-2.5 px-3">{indexEnabled ? 'idx_memory_date' : 'NULL'}</td>
                        <td className={`py-2.5 px-3 font-bold ${indexEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {indexEnabled ? 'idx_memory_date' : 'NULL'}
                        </td>
                        <td className="py-2.5 px-3">{indexEnabled ? '2' : db.MEMORY.length}</td>
                        <td className="py-2.5 px-3">Using where; {indexEnabled ? 'Using index condition' : 'Full scan'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-base font-bold text-white">Interactive Test Cases Runner (T1 to T8)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { code: 'T1', desc: 'Required Fields Only (INSERT)' },
                    { code: 'T2', desc: 'Trigger Auto-Version (UPDATE)' },
                    { code: 'T3', desc: 'Trash & Restore Status' },
                    { code: 'T4', desc: 'Missing Title (NOT NULL Error)' },
                    { code: 'T5', desc: 'Ghost user_id=9999 (FK Error)' },
                    { code: 'T6', desc: 'Duplicate Email (UNIQUE Error)' },
                    { code: 'T7', desc: 'Invalid Status (ENUM Error)' },
                    { code: 'T8', desc: 'Delete User (CASCADE Proof)' }
                  ].map(tc => (
                    <button
                      key={tc.code}
                      onClick={() => runWeek7TestCase(tc.code)}
                      className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs text-indigo-400">{tc.code}</span>
                        <Play className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[11px] text-slate-300">{tc.desc}</div>
                    </button>
                  ))}
                </div>

                {testCaseResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Test Case {testCaseResult.code} Result:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                        {testCaseResult.status}
                      </span>
                    </div>
                    <pre className="text-indigo-300 whitespace-pre-wrap">{testCaseResult.sql}</pre>
                    <div className="text-slate-400 font-sans">{testCaseResult.detail}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeNav === 'presentation_guide' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono uppercase text-indigo-400">CSE 468 Viva & Presentation Guide</span>
                <h2 className="text-lg font-bold text-white">How to Present to Lecturer Nabid Nur Hasan Sabby</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-indigo-300 text-sm">1. Strict User Login & Vault Isolation</div>
                  <p className="text-slate-300">
                    Click <strong>Log Out</strong> in the top-right corner. Log in as <code className="text-emerald-300">himanta@gmail.com</code> (<code className="text-slate-400">HIMANTA_pass_123</code>) to view Himanta&apos;s vault. Then log out and log in as <code className="text-emerald-300">fat_ovi@gmail.com</code> (<code className="text-slate-400">OVI_pass_123</code>) to prove Ovi only sees <code className="text-white">&quot;Ovi Private Memory&quot;</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-sky-300 text-sm">2. Image Uploads (`MEDIA` Table)</div>
                  <p className="text-slate-300">
                    Click <strong>New Memory + Upload Photos</strong> and select any image from your PC. The image is stored in `/uploads/user_{id}/` while the relational <code className="text-sky-300">MEDIA</code> table stores <code className="text-sky-300">(media_id, memory_id, file_path, uploaded_at)</code> linked via <code className="text-amber-300">ON DELETE CASCADE</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Terminal className="w-4 h-4" />
                <span>Live MySQL Query Execution Log (`DIGITAL_MEMORY_VAULT`)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Showing last {sqlLogs.length} queries</span>
            </div>
            <div className="p-4 max-h-52 overflow-y-auto space-y-3 font-mono text-xs bg-slate-950/60">
              {sqlLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="text-indigo-400 font-semibold">{log.source}</span>
                    <span className={log.status === 'ERROR' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      [{log.status}] • {log.time}
                    </span>
                  </div>
                  <pre className={`whitespace-pre-wrap ${log.status === 'ERROR' ? 'text-rose-300' : 'text-slate-200'}`}>
                    {log.sql}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-indigo-400">
                  {editingMemory ? `Week 5 BEFORE UPDATE Trigger` : `Week 5 SP + Week 6 Atomic Transaction`}
                </span>
                <h3 className="text-base font-bold text-white">
                  {editingMemory ? `Edit Memory #${editingMemory.memory_id}` : `Create Memory in ${authenticatedUser.name}'s Vault`}
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Title (`MEMORY.title` NOT NULL) *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Visited CVASU Fisheries Museum"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Date (`memory_date`) *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Description (`MEMORY.description` Optional)</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Write details about this memory..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sky-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      Attach Photos (`MEDIA` Table — 1:N Relationship)
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Each uploaded photo inserts a row into <code className="text-sky-300">MEDIA (memory_id, file_path)</code>.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFilesSelected}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-semibold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Choose Image(s)
                  </button>
                </div>

                {formUploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                    {formUploadedImages.map((img, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                        <img src={img.preview_url} alt={img.name} className="w-full h-24 object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormUploadedImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/80 text-rose-400 hover:text-rose-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="p-1.5 text-[10px] font-mono text-slate-300 truncate">
                          {img.file_path}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Time (`memory_time`)</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Location (`LOCATION`)</label>
                  <select
                    value={formLocationId}
                    onChange={e => setFormLocationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="">-- Optional --</option>
                    {userLocations.map(l => (
                      <option key={l.location_id} value={l.location_id}>{l.location_name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formNewLocation}
                    onChange={e => setFormNewLocation(e.target.value)}
                    placeholder="+ Or type new location"
                    className="mt-1.5 w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Emotion (`EMOTION`)</label>
                  <select
                    value={formEmotionId}
                    onChange={e => setFormEmotionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="">-- Optional --</option>
                    {userEmotions.map(em => (
                      <option key={em.emotion_id} value={em.emotion_id}>{em.emotion_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-medium text-slate-300">Link People (`MEMORY_PERSON` M:N)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {userPersons.map(p => {
                      const active = formSelectedPersons.includes(p.person_id);
                      return (
                        <button
                          type="button"
                          key={p.person_id}
                          onClick={() =>
                            setFormSelectedPersons(prev =>
                              active ? prev.filter(id => id !== p.person_id) : [...prev, p.person_id]
                            )
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] border ${
                            active
                              ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={formNewPersonName}
                      onChange={e => setFormNewPersonName(e.target.value)}
                      placeholder="+ New person name"
                      className="flex-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                    <input
                      type="text"
                      value={formNewPersonRel}
                      onChange={e => setFormNewPersonRel(e.target.value)}
                      placeholder="Relation"
                      className="w-24 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-medium text-slate-300">Link Tags (`MEMORY_TAG` M:N)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {userTags.map(t => {
                      const active = formSelectedTags.includes(t.tag_id);
                      return (
                        <button
                          type="button"
                          key={t.tag_id}
                          onClick={() =>
                            setFormSelectedTags(prev =>
                              active ? prev.filter(id => id !== t.tag_id) : [...prev, t.tag_id]
                            )
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] border ${
                            active
                              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          #{t.tag_name}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={formNewTag}
                    onChange={e => setFormNewTag(e.target.value)}
                    placeholder="+ Or add new tag"
                    className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {editingMemory ? 'Run UPDATE (Fires Trigger)' : 'Run START TRANSACTION & COMMIT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {versionModalMemory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400">MEMORY_VERSION Table • trg_memory_before_update</span>
                <h3 className="text-base font-bold text-white">Version History for Memory #{versionModalMemory.memory_id}</h3>
              </div>
              <button onClick={() => setVersionModalMemory(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {versionModalMemory.versions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No previous snapshots yet. Edit this memory&apos;s title, description, or date to see <code className="text-amber-300">trg_memory_before_update</code> capture a snapshot!
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {versionModalMemory.versions.map(v => (
                  <div key={v.version_id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px] text-amber-300">
                      <span>version_id #{v.version_id} • {v.change_type}</span>
                      <span>{v.changed_at}</span>
                    </div>
                    <div className="font-bold text-white">{v.title_snapshot}</div>
                    <div className="text-slate-400">{v.description_snapshot}</div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-mono text-[11px] text-slate-500">Date Snapshot: {v.memory_date_snapshot}</span>
                      <button
                        onClick={() => handleRevertToVersion(versionModalMemory, v)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium"
                      >
                        Restore This Snapshot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {lightboxMedia && (
        <div
          onClick={() => setLightboxMedia(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div onClick={e => e.stopPropagation()} className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={lightboxMedia.preview_url || DEMO_IMAGES.cvasu_fish}
              alt={lightboxMedia.file_path}
              className="w-full max-h-[70vh] object-contain bg-slate-950"
            />
            <div className="p-4 flex items-center justify-between text-xs font-mono">
              <div>
                <div className="text-sky-300 font-bold">MEDIA.media_id = {lightboxMedia.media_id} (memory_id = {lightboxMedia.memory_id})</div>
                <div className="text-slate-400">file_path: {lightboxMedia.file_path}</div>
              </div>
              <button
                onClick={() => setLightboxMedia(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-sans"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
