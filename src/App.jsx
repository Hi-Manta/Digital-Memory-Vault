import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Lock, LogOut, Plus, Search, Calendar, Trash2, RotateCcw,
  History, Image as ImageIcon, MapPin, Smile, Tag as TagIcon,
  Users, BarChart3, Clock, CheckCircle2, AlertTriangle, Layers,
  Sparkles, Edit3, X, Filter, Download,
  Upload, UserPlus, ZoomIn, Compass, BookMarked, ShieldCheck, LayoutGrid, List
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

function hashPassword(str) {
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

const SAMPLE_COVERS = {
  aquarium: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="50%" stop-color="#0369a1"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs><rect width="800" height="450" fill="url(#g1)"/><circle cx="650" cy="100" r="140" fill="rgba(255,255,255,0.06)"/><circle cx="140" cy="360" r="180" fill="rgba(255,255,255,0.05)"/><path d="M280 220 C340 160, 450 160, 520 225 C450 290, 340 290, 280 220 Z" fill="#38bdf8" opacity="0.85"/><polygon points="285,220 225,175 240,220 225,265" fill="#0284c7"/><circle cx="475" cy="210" r="8" fill="#0f172a"/><text x="40" y="405" fill="#e0f2fe" font-family="sans-serif" font-size="22" font-weight="bold">Marine Biodiversity &amp; Exhibition</text></svg>`)}`,
  research: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="60%" stop-color="#312e81"/><stop offset="100%" stop-color="#4c1d95"/></linearGradient></defs><rect width="800" height="450" fill="url(#g2)"/><g stroke="#818cf8" stroke-width="2" fill="none" opacity="0.45"><circle cx="400" cy="210" r="95"/><circle cx="350" cy="180" r="65"/><circle cx="450" cy="180" r="65"/><circle cx="400" cy="250" r="65"/></g><circle cx="400" cy="210" r="16" fill="#c084fc"/><circle cx="350" cy="180" r="10" fill="#38bdf8"/><circle cx="450" cy="180" r="10" fill="#38bdf8"/><circle cx="400" cy="250" r="10" fill="#34d399"/><text x="40" y="405" fill="#ede9fe" font-family="sans-serif" font-size="22" font-weight="bold">Morphogenesis Patterning Notes</text></svg>`)}`
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
      password_hash: hashPassword('HIMANTA_pass_123'),
      created_at: '2026-09-01 10:00:00'
    },
    {
      user_id: 2,
      name: 'Ovi',
      email: 'fat_ovi@gmail.com',
      password_hash: hashPassword('OVI_pass_123'),
      created_at: '2026-09-15 14:22:00'
    }
  ],
  LOCATION: [
    { location_id: 1, user_id: 1, location_name: 'CVASU Museum', created_at: '2026-09-10 09:00:00' },
    { location_id: 2, user_id: 1, location_name: 'Research Studio', created_at: '2026-09-12 11:00:00' },
    { location_id: 3, user_id: 1, location_name: "Foy's Lake", created_at: '2026-09-18 16:00:00' },
    { location_id: 4, user_id: 2, location_name: 'GEC Circle', created_at: '2026-09-20 19:00:00' }
  ],
  EMOTION: [
    { emotion_id: 1, user_id: 1, emotion_name: 'Happy', created_at: '2026-09-10 09:00:00' },
    { emotion_id: 2, user_id: null, emotion_name: 'Nostalgic', created_at: '2026-09-01 00:00:00' },
    { emotion_id: 3, user_id: null, emotion_name: 'Inspired', created_at: '2026-09-01 00:00:00' },
    { emotion_id: 4, user_id: null, emotion_name: 'Surprised', created_at: '2026-09-01 00:00:00' },
    { emotion_id: 5, user_id: null, emotion_name: 'Peaceful', created_at: '2026-09-01 00:00:00' },
    { emotion_id: 6, user_id: null, emotion_name: 'Grateful', created_at: '2026-09-01 00:00:00' }
  ],
  PERSON: [
    { person_id: 1, user_id: 1, name: 'Claude', relationship: 'Research Partner', created_at: '2026-09-20 12:00:00' },
    { person_id: 2, user_id: 1, name: 'University Friends', relationship: 'Close Friends', created_at: '2026-09-21 15:00:00' },
    { person_id: 3, user_id: 2, name: 'Rafi', relationship: 'Friend', created_at: '2026-09-25 18:00:00' }
  ],
  TAG: [
    { tag_id: 1, user_id: 1, tag_name: 'Tour', created_at: '2026-09-10 09:00:00' },
    { tag_id: 2, user_id: 1, tag_name: 'Research', created_at: '2026-09-10 09:05:00' },
    { tag_id: 3, user_id: 1, tag_name: 'Milestone', created_at: '2026-09-14 10:00:00' },
    { tag_id: 4, user_id: 1, tag_name: 'Outdoors', created_at: '2026-09-15 10:00:00' },
    { tag_id: 5, user_id: 2, tag_name: 'Personal', created_at: '2026-09-25 18:00:00' }
  ],
  MEMORY: [
    {
      memory_id: 1,
      user_id: 1,
      title: 'Visited CVASU Fisheries Museum',
      description: 'Explored the marine specimen gallery with friends. The main aquarium exhibits were fascinating, though the anatomy wing was closed for maintenance.',
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
      title: 'Late Night Debugging Breakthrough',
      description: 'Tracked down a complex state concurrency bug during a late-night coding session and refactored the data pipeline.',
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
      title: 'Research Notes on Morphogenesis',
      description: 'Documented key findings on biological pattern formation and cellular self-organization models.',
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
      title: 'Sunset Reflection by the Lake',
      description: 'A quiet afternoon away from screens, sketching ideas for upcoming software projects and watching the sunset over the water.',
      memory_date: lastYearToday,
      memory_time: '17:45:00',
      location_id: 3,
      emotion_id: 2,
      status: 'ACTIVE',
      created_at: `${lastYearToday} 17:45:00`,
      updated_at: `${lastYearToday} 17:45:00`
    },
    {
      memory_id: 5,
      user_id: 2,
      title: 'Evening Coffee & Catch-up',
      description: 'Met up at GEC Circle for coffee and long conversations.',
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
      preview_url: SAMPLE_COVERS.aquarium,
      uploaded_at: '2026-09-22 11:32:00'
    },
    {
      media_id: 2,
      memory_id: 3,
      file_path: '/uploads/user_1/morphogenesis_diagram.png',
      preview_url: SAMPLE_COVERS.research,
      uploaded_at: '2026-09-27 20:16:00'
    }
  ],
  MEMORY_VERSION: [
    {
      version_id: 1,
      memory_id: 1,
      title_snapshot: 'Visited CVASU Fish Museum',
      description_snapshot: 'Enjoyed watching different kind of fishes with friends.',
      memory_date_snapshot: '2026-09-22',
      changed_at: '2026-09-22 14:10:00',
      change_type: 'EDIT'
    }
  ],
  MEMORY_PERSON: [
    { memory_id: 1, person_id: 2 },
    { memory_id: 3, person_id: 1 },
    { memory_id: 4, person_id: 2 },
    { memory_id: 5, person_id: 3 }
  ],
  MEMORY_TAG: [
    { memory_id: 1, tag_id: 1 },
    { memory_id: 2, tag_id: 3 },
    { memory_id: 3, tag_id: 2 },
    { memory_id: 4, tag_id: 4 },
    { memory_id: 5, tag_id: 5 }
  ]
};

const STORAGE_KEY = 'MEMORY_VAULT_PROD_V2';
const SESSION_KEY = 'MEMORY_VAULT_ACTIVE_USER_V2';
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
      console.error('Failed to persist vault data:', e);
    }
  }, [db]);

  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem(SESSION_KEY);
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [authTab, setAuthTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeNav, setActiveNav] = useState('vault'); // 'vault' | 'day_recon' | 'analytics' | 'trash'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'compact'

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerson, setFilterPerson] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filterEmotion, setFilterEmotion] = useState('ALL');
  const [filterTag, setFilterTag] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const computedHash = hashPassword(loginPassword);
    const matchedUser = db.USER.find(
      u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password_hash === computedHash
    );

    if (!matchedUser) {
      setAuthError('Invalid email address or password. Please try again.');
      return;
    }

    setAuthenticatedUser(matchedUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(matchedUser));
    setLoginPassword('');
    setFilterPerson('ALL');
    setFilterLocation('ALL');
    setFilterEmotion('ALL');
    setFilterTag('ALL');
    showToast('success', `Welcome back, ${matchedUser.name}`, 'Your personal memory vault is unlocked.');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }
    const exists = db.USER.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (exists) {
      setAuthError('An account with this email address already exists.');
      return;
    }

    const newUserId = Math.max(0, ...db.USER.map(u => u.user_id)) + 1;
    const hash = hashPassword(regPassword);
    const newUser = {
      user_id: newUserId,
      name: regName.trim(),
      email: regEmail.trim(),
      password_hash: hash,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setDb(prev => ({ ...prev, USER: [...prev.USER, newUser] }));
    setAuthenticatedUser(newUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    showToast('success', 'Account Created', `Welcome to MemoryVault, ${newUser.name}!`);
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    setAuthError('');
    setLoginEmail('');
    setLoginPassword('');
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
        const inLoc = (m.location_name || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inLoc) return false;
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
        preview_url: med.preview_url || SAMPLE_COVERS.aquarium,
        name: med.file_path.split('/').pop()
      }))
    );
    setIsCreateModalOpen(true);
  };

  const handleSaveMemory = (e) => {
    e.preventDefault();

    if (!formTitle.trim() || !formDate) {
      showToast('error', 'Missing Required Fields', 'Please provide both a title and a date for your memory.');
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
        relationship: formNewPersonRel.trim() || 'Connection',
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
        tag_name: formNewTag.trim().replace(/^#/, ''),
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
      resolvedTagIds.push(newTid);
    }

    const resolvedEmoId = formEmotionId ? Number(formEmotionId) : null;
    const nowTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (editingMemory) {
      const oldMem = editingMemory;
      const hasContentChanged =
        oldMem.title !== formTitle.trim() ||
        (oldMem.description || '') !== formDesc.trim() ||
        oldMem.memory_date !== formDate;

      let nextVersions = [...db.MEMORY_VERSION];
      if (hasContentChanged) {
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

      showToast(
        'success',
        'Memory Updated',
        hasContentChanged
          ? 'Your changes were saved and the previous revision was archived to version history.'
          : 'Memory details and media attachments updated.'
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

      showToast('success', 'Memory Saved', `"${newMemory.title}" has been added to your vault.`);
    }

    setIsCreateModalOpen(false);
  };

  const handleSoftDelete = (memory) => {
    setDb(prev => ({
      ...prev,
      MEMORY: prev.MEMORY.map(m => (m.memory_id === memory.memory_id ? { ...m, status: 'TRASHED' } : m))
    }));
    showToast('info', 'Moved to Trash', `"${memory.title}" was moved to the Trash bin.`);
  };

  const handleRestore = (memory) => {
    setDb(prev => ({
      ...prev,
      MEMORY: prev.MEMORY.map(m => (m.memory_id === memory.memory_id ? { ...m, status: 'ACTIVE' } : m))
    }));
    showToast('success', 'Memory Restored', `"${memory.title}" is back in your active timeline.`);
  };

  const handlePermanentDelete = (memory) => {
    setDb(prev => ({
      ...prev,
      MEMORY: prev.MEMORY.filter(m => m.memory_id !== memory.memory_id),
      MEMORY_VERSION: prev.MEMORY_VERSION.filter(v => v.memory_id !== memory.memory_id),
      MEMORY_PERSON: prev.MEMORY_PERSON.filter(mp => mp.memory_id !== memory.memory_id),
      MEMORY_TAG: prev.MEMORY_TAG.filter(mt => mt.memory_id !== memory.memory_id),
      MEDIA: prev.MEDIA.filter(med => med.memory_id !== memory.memory_id)
    }));
    showToast('error', 'Permanently Deleted', `"${memory.title}" and all associated media were permanently removed.`);
  };

  const handleRevertToVersion = (memory, version) => {
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

    setVersionModalMemory(null);
    showToast('success', 'Revision Restored', `Reverted memory to the snapshot from ${version.changed_at}.`);
  };

  const handleExportArchive = () => {
    const exportPayload = {
      exported_at: new Date().toISOString(),
      account: {
        name: authenticatedUser.name,
        email: authenticatedUser.email
      },
      memories: enrichedMemories
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MemoryVault_Backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Backup Downloaded', 'Your personal archive has been exported as JSON.');
  };

  // ============================================================================
  // VIEW 1: CLEAN PRODUCTION AUTHENTICATION PAGE
  // ============================================================================
  if (!authenticatedUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
        {/* Top Minimal Brand Header */}
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">MemoryVault</span>
              <span className="hidden sm:inline-block ml-2.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Personal Archive
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Isolated Workspace</span>
          </div>
        </div>

        {/* Center Hero & Auth Card */}
        <div className="max-w-5xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl">
          {/* Left Marketing / Value Proposition Column */}
          <div className="lg:col-span-6 p-8 md:p-10 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Your Life, Connected &amp; Searchable
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                Preserve the moments that matter most.
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                Photos, notes, people, places, and emotions often end up scattered across different apps. MemoryVault brings every detail of your life events together into a structured, private timeline.
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  {
                    icon: Compass,
                    title: 'Multi-Dimensional Search',
                    desc: 'Filter memories simultaneously by people, locations, moods, tags, and custom date ranges.'
                  },
                  {
                    icon: History,
                    title: 'Automatic Revision History',
                    desc: 'Every edit preserves an immutable snapshot so you can revisit or restore earlier versions anytime.'
                  },
                  {
                    icon: Clock,
                    title: 'Day Reconstruction & On This Day',
                    desc: 'Rebuild a chronological walkthrough of any date or rediscover past milestones on the same calendar day.'
                  }
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white mb-0.5">{feature.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Private Personal Cloud</span>
              <span>Version 2.0</span>
            </div>
          </div>

          {/* Right Sign In / Create Account Column */}
          <div className="lg:col-span-6 p-8 md:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                {authTab === 'login' ? 'Sign in to your vault' : 'Create your private vault'}
              </h2>
              <p className="text-xs text-slate-400">
                {authTab === 'login'
                  ? 'Enter your email and password to access your timeline.'
                  : 'Set up a new account in seconds to start archiving memories.'}
              </p>
            </div>

            <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  authTab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  authTab === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 mt-2"
                >
                  <Lock className="w-4 h-4" />
                  Unlock Vault
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-2">
          © {new Date().getFullYear()} MemoryVault. Built for private, structured personal archiving.
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: AUTHENTICATED PRODUCTION WORKSPACE
  // ============================================================================
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

      {/* TOP APPLICATION BAR */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">MemoryVault</h1>
              <p className="text-[11px] text-slate-400">Personal Timeline &amp; Archive</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportArchive}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
              title="Export Vault Backup"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Export Backup</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-slate-200">{authenticatedUser.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3 space-y-4">
          <button
            onClick={openCreateModal}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Memory
          </button>

          <nav className="bg-slate-900 border border-slate-800 rounded-2xl p-2 space-y-1">
            {[
              { id: 'vault', label: 'All Memories', icon: Layers, badge: filteredActiveMemories.length },
              { id: 'day_recon', label: 'Day Timeline', icon: Clock, badge: 'By Date' },
              { id: 'analytics', label: 'Insights & Analytics', icon: BarChart3, badge: 'Stats' },
              { id: 'trash', label: 'Trash', icon: Trash2, badge: trashedMemories.length }
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
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Quick Vault Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-300">Vault Overview</div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-lg font-bold text-white">{enrichedMemories.filter(m => m.status === 'ACTIVE').length}</div>
                <div className="text-[11px] text-slate-400">Memories</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-lg font-bold text-indigo-400">
                  {enrichedMemories.reduce((acc, m) => acc + m.media.length, 0)}
                </div>
                <div className="text-[11px] text-slate-400">Photos</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-lg font-bold text-emerald-400">{userLocations.length}</div>
                <div className="text-[11px] text-slate-400">Places</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-lg font-bold text-amber-400">{userPersons.length}</div>
                <div className="text-[11px] text-slate-400">People</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: ALL MEMORIES */}
          {activeNav === 'vault' && (
            <>
              {/* ON THIS DAY REDISCOVERY BANNER */}
              {onThisDayMemories.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        On This Day in Your History
                      </span>
                      {onThisDayMemories.map(otd => (
                        <div key={otd.memory_id} className="mt-1 text-sm font-semibold text-white">
                          {otd.title}{' '}
                          <span className="text-xs font-normal text-amber-300/90">({otd.memory_date})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SEARCH & FILTER BAR */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Filter className="w-4 h-4 text-indigo-400" />
                    <span>Filter &amp; Search Memories</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setLayoutMode('grid')}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition ${
                        layoutMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Cards
                    </button>
                    <button
                      onClick={() => setLayoutMode('compact')}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition ${
                        layoutMode === 'compact' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      Compact List
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
                      placeholder="Search titles, notes, or places..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <select
                    value={filterPerson}
                    onChange={e => setFilterPerson(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ALL">All People</option>
                    {userPersons.map(p => (
                      <option key={p.person_id} value={p.name}>{p.name}</option>
                    ))}
                  </select>

                  <select
                    value={filterLocation}
                    onChange={e => setFilterLocation(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ALL">All Locations</option>
                    {userLocations.map(l => (
                      <option key={l.location_id} value={l.location_name}>{l.location_name}</option>
                    ))}
                  </select>

                  <select
                    value={filterEmotion}
                    onChange={e => setFilterEmotion(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ALL">All Moods</option>
                    {userEmotions.map(em => (
                      <option key={em.emotion_id} value={em.emotion_name}>{em.emotion_name}</option>
                    ))}
                  </select>

                  <select
                    value={filterTag}
                    onChange={e => setFilterTag(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ALL">All Tags</option>
                    {userTags.map(t => (
                      <option key={t.tag_id} value={t.tag_name}>#{t.tag_name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>Date Range:</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    />
                    <span>to</span>
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
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* MEMORY DISPLAY */}
              {filteredActiveMemories.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <BookMarked className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">No memories found</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Start capturing moments by clicking &quot;New Memory&quot; or adjust your search filters.
                  </p>
                </div>
              ) : layoutMode === 'compact' ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Mood</th>
                          <th className="py-3 px-4">Tags</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {filteredActiveMemories.map(m => (
                          <tr key={m.memory_id} className="hover:bg-slate-800/40">
                            <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{m.memory_date}</td>
                            <td className="py-3 px-4 font-semibold text-white">{m.title}</td>
                            <td className="py-3 px-4 text-slate-300">{m.location_name || '—'}</td>
                            <td className="py-3 px-4 text-slate-300">{m.emotion_name || '—'}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {m.tags.map(t => (
                                  <span key={t.tag_id} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px]">
                                    #{t.tag_name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => openEditModal(m)}
                                className="text-indigo-400 hover:text-indigo-300 mr-3 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleSoftDelete(m)}
                                className="text-rose-400 hover:text-rose-300 font-medium"
                              >
                                Trash
                              </button>
                            </td>
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
                                    src={med.preview_url || SAMPLE_COVERS.aquarium}
                                    alt={memory.title}
                                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-end p-2.5">
                                    <ZoomIn className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{memory.memory_date}</span>
                              {memory.memory_time && (
                                <span className="text-slate-500">• {memory.memory_time.slice(0, 5)}</span>
                              )}
                            </div>

                            {memory.versions.length > 0 && (
                              <button
                                onClick={() => setVersionModalMemory(memory)}
                                className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1 hover:bg-amber-500/20 transition"
                              >
                                <History className="w-3 h-3" />
                                {memory.versions.length} {memory.versions.length === 1 ? 'revision' : 'revisions'}
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
                            Edit
                          </button>
                          {memory.versions.length > 0 && (
                            <button
                              onClick={() => setVersionModalMemory(memory)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
                            >
                              <History className="w-3.5 h-3.5 text-amber-400" />
                              History
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleSoftDelete(memory)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Move to Trash"
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

          {/* TAB 2: DAY TIMELINE RECONSTRUCTION */}
          {activeNav === 'day_recon' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Day Timeline Reconstruction</h2>
                  <p className="text-xs text-slate-400">
                    Select any date to view a chronological walkthrough of your recorded moments from that day.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={reconDate}
                    onChange={e => setReconDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              {dayReconstructionResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No memories recorded on <span className="text-slate-200 font-medium">{reconDate}</span>. Try selecting another date or creating a new entry.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-indigo-500/40 space-y-6">
                  {dayReconstructionResults.map(item => (
                    <div key={item.memory_id} className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4">
                      <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-indigo-500 border-4 border-slate-900" />
                      <div className="flex items-center justify-between text-xs text-indigo-300 mb-1">
                        <span className="font-semibold">{item.memory_time ? item.memory_time.slice(0, 5) : 'All Day'}</span>
                        <span className="text-slate-400">
                          {[item.location_name, item.emotion_name].filter(Boolean).join(' • ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INSIGHTS & ANALYTICS */}
          {activeNav === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Most Featured People</h3>
                <p className="text-xs text-slate-400">Connections who appear most frequently across your memories.</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.frequentPeople}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                      <Bar dataKey="times_appeared" name="Memories" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Top Locations</h3>
                <p className="text-xs text-slate-400">Places where you have captured the most moments.</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.frequentLocations}>
                      <XAxis dataKey="location_name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                      <Bar dataKey="times_used" name="Memories" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Tag Distribution</h3>
                <p className="text-xs text-slate-400">Themes and categories across your personal archive.</p>
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
                <h3 className="text-sm font-bold text-white">Memories by Year</h3>
                <p className="text-xs text-slate-400">Annual activity across your timeline.</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.memoriesByYear}>
                      <XAxis dataKey="yr" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                      <Bar dataKey="total_memories" name="Memories" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRASH BIN */}
          {activeNav === 'trash' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Trash</h2>
                <p className="text-xs text-slate-400">
                  Items in Trash are hidden from your timeline and analytics. Restore them anytime or delete them permanently.
                </p>
              </div>
              {trashedMemories.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Your trash bin is empty.</div>
              ) : (
                <div className="space-y-3">
                  {trashedMemories.map(m => (
                    <div key={m.memory_id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">{m.memory_date}</div>
                        <div className="text-sm font-bold text-white">{m.title}</div>
                        <div className="text-xs text-slate-400">{m.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(m)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 hover:bg-emerald-600/30 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(m)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 hover:bg-rose-600/30 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: CREATE / EDIT MEMORY */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingMemory ? 'Edit Memory' : 'Capture New Memory'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingMemory
                    ? 'Changes to your title, story, or date will automatically archive the previous version.'
                    : 'Only a title and date are required — add photos, places, moods, or people as you wish.'}
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="What happened?"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Story / Notes</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Write down the details, thoughts, or highlights you want to remember..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* PHOTO UPLOADER */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      Photos &amp; Media
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Attach one or more photos from your device to this memory.
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
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-semibold flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photos
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
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Location</label>
                  <select
                    value={formLocationId}
                    onChange={e => setFormLocationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="">-- Select Place --</option>
                    {userLocations.map(l => (
                      <option key={l.location_id} value={l.location_id}>{l.location_name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formNewLocation}
                    onChange={e => setFormNewLocation(e.target.value)}
                    placeholder="+ Or add new place"
                    className="mt-1.5 w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Mood / Emotion</label>
                  <select
                    value={formEmotionId}
                    onChange={e => setFormEmotionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="">-- Select Mood --</option>
                    {userEmotions.map(em => (
                      <option key={em.emotion_id} value={em.emotion_id}>{em.emotion_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-medium text-slate-300">People Involved</div>
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
                          className={`px-2 py-1 rounded-lg text-[11px] border transition ${
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
                      placeholder="+ Add person"
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
                  <div className="font-medium text-slate-300">Tags</div>
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
                          className={`px-2 py-1 rounded-lg text-[11px] border transition ${
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
                    placeholder="+ Add new tag"
                    className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                >
                  {editingMemory ? 'Save Changes' : 'Save Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVISION HISTORY */}
      {versionModalMemory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Revision History</h3>
                <p className="text-xs text-slate-400">
                  Earlier snapshots of &quot;{versionModalMemory.title}&quot;
                </p>
              </div>
              <button onClick={() => setVersionModalMemory(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {versionModalMemory.versions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No previous revisions recorded for this memory yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {versionModalMemory.versions.map(v => (
                  <div key={v.version_id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-amber-300">
                      <span className="font-semibold">Archived Revision ({v.change_type})</span>
                      <span className="text-slate-400">{v.changed_at}</span>
                    </div>
                    <div className="font-bold text-white">{v.title_snapshot}</div>
                    <div className="text-slate-400">{v.description_snapshot}</div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500">Original Date: {v.memory_date_snapshot}</span>
                      <button
                        onClick={() => handleRevertToVersion(versionModalMemory, v)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium transition"
                      >
                        Restore This Version
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: PHOTO LIGHTBOX */}
      {lightboxMedia && (
        <div
          onClick={() => setLightboxMedia(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div onClick={e => e.stopPropagation()} className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={lightboxMedia.preview_url || SAMPLE_COVERS.aquarium}
              alt="Memory attachment"
              className="w-full max-h-[75vh] object-contain bg-slate-950"
            />
            <div className="p-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">Uploaded {lightboxMedia.uploaded_at}</span>
              <button
                onClick={() => setLightboxMedia(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
