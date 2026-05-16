import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, MessageCircle, Award, Home, Info, Newspaper, 
  HelpCircle, LogIn, LogOut, User, Plus, Edit2, Trash2, Heart 
} from 'lucide-react';
import { motion } from 'framer-motion';
// Using local SQLite database via API routes

// Types
interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  published: boolean;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface Question {
  id: number;
  user_id: string;
  user_name: string;
  title: string;
  content: string;
  created_at: string;
  answered: boolean;
}

interface User {
  id: string;
  email: string;
  user_metadata?: { name?: string };
  role?: string;
  full_name?: string;
}

// Categories
const CATEGORIES = [
  'قرارات وزارة التربية',
  'معادلة الشهادات',
  'التحويل المتماثل',
  'أخبار الطلاب'
];

// Guides Data (Structured)
const GUIDES = [
  {
    id: 1,
    title: "دليل معادلة الشهادة في سوريا",
    steps: [
      "تقديم طلب رسمي إلى وزارة التعليم العالي السورية",
      "إرفاق الشهادة الأصلية والترجمة المعتمدة",
      "دفع الرسوم المطلوبة وانتظار الموافقة",
      "الحصول على الشهادة المعادلة خلال 30 يوم عمل"
    ],
    requirements: "جواز سفر سوري، شهادة الثانوية، صور شخصية"
  },
  {
    id: 2,
    title: "شروط النقل والتحويل بين الجامعات",
    steps: [
      "الحصول على موافقة الجامعة الحالية",
      "تقديم طلب تحويل إلى الجامعة المستهدفة",
      "تقديم كشف درجات وشهادات معتمدة",
      "اجتياز اختبار القبول إن وجد"
    ],
    requirements: "معدل تراكمي لا يقل عن 2.5، سنة دراسية كاملة"
  },
  {
    id: 3,
    title: "إرشادات للطلاب العائدين إلى سوريا",
    steps: [
      "التأكد من صحة الوثائق المعادلة",
      "التسجيل في الجامعات السورية عبر المنصة الإلكترونية",
      "التواصل مع مكتب الطلاب السوريين في دمشق",
      "متابعة التحديثات عبر الملتقى"
    ],
    requirements: "شهادة معادلة، سجل أكاديمي، تأشيرة خروج"
  }
];

// FAQ Data
const FAQS = [
  {
    q: "كيف يمكنني التسجيل في الملتقى؟",
    a: "يمكنك إنشاء حساب جديد باستخدام البريد الإلكتروني وكلمة مرور، أو تسجيل الدخول إذا كان لديك حساب بالفعل."
  },
  {
    q: "هل المعلومات في الموقع موثوقة؟",
    a: "نعم، جميع الأخبار والإرشادات يتم التحقق منها من مصادر رسمية مثل وزارة التربية اللبنانية ووزارة التعليم العالي السورية."
  },
  {
    q: "كيف يمكنني طرح سؤال في قسم المجتمع؟",
    a: "بعد تسجيل الدخول، انتقل إلى صفحة المجتمع واضغط على 'طرح سؤال' لمشاركة استفسارك مع الطلاب الآخرين."
  },
  {
    q: "هل يوجد رسوم للاستفادة من خدمات الملتقى؟",
    a: "الملتقى مجاني تماماً لجميع الطلاب السوريين في لبنان."
  }
];

// Main App Component
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  // Local auth state (SQLite)
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setUserRole(parsedUser.role || 'user');
      setIsAdmin(parsedUser.role === 'admin');
    }
    setLoading(false);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
        <Navbar user={user} isAdmin={isAdmin} />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/news" element={<NewsPage user={user} isAdmin={isAdmin} />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/community" element={<CommunityPage user={user} />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/admin" element={<AdminPage user={user} isAdmin={isAdmin} userRole={userRole} />} />
          <Route path="/login" element={<AuthPage />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

// Navbar Component
function Navbar({ user, isAdmin }: { user: User | null; isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const navLinks = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/about', label: 'عن الملتقى', icon: Info },
    { to: '/news', label: 'الأخبار والتحديثات', icon: Newspaper },
    { to: '/guides', label: 'الأدلة الإرشادية', icon: BookOpen },
    { to: '/community', label: 'المجتمع', icon: MessageCircle },
    { to: '/faq', label: 'الأسئلة الشائعة', icon: HelpCircle },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-700 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-2xl text-emerald-900">ملتقى الطلاب السوريين</div>
              <div className="text-xs text-gray-500 -mt-1">في لبنان</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-gray-700 hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                <link.icon className="w-4 h-4" /> {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 font-semibold">
                <Award className="w-4 h-4" /> لوحة الإدارة
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 text-sm bg-gray-100 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4" />
                  <span>{user.user_metadata?.name || user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" /> تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition"
              >
                <LogIn className="w-4 h-4" /> تسجيل الدخول
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden p-2"
            >
              <div className="space-y-1">
                <div className={`h-0.5 w-6 bg-gray-800 transition ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <div className={`h-0.5 w-6 bg-gray-800 transition ${isOpen ? 'opacity-0' : ''}`} />
                <div className={`h-0.5 w-6 bg-gray-800 transition ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-1 text-sm">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-xl" onClick={() => setIsOpen(false)}>
              <link.icon className="w-4 h-4" /> {link.label}
            </Link>
          ))}
          {isAdmin && <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-emerald-700" onClick={() => setIsOpen(false)}>لوحة الإدارة</Link>}
        </div>
      )}
    </nav>
  );
}

// Homepage
function HomePage() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setLatestPosts(data.slice(0, 3));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[620px] bg-emerald-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/90 to-emerald-950/70" />
        
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-white/10 backdrop-blur rounded-full text-sm tracking-wider">منصة رسمية للطلاب السوريين</div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 leading-none">
            ملتقى الطلاب<br />السوريين في لبنان
          </h1>
          <p className="max-w-xl mx-auto text-xl text-emerald-100 mb-10">
            منصة موثوقة توفر معلومات محدثة وفرص تفاعلية لدعم الطلاب السوريين في مسيرتهم التعليمية
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/news" className="px-10 py-4 bg-white text-emerald-950 font-semibold rounded-2xl hover:bg-white/90 transition flex items-center gap-2">
              <Newspaper className="w-5 h-5" /> تصفح الأخبار
            </Link>
            <Link to="/community" className="px-10 py-4 border-2 border-white/70 hover:bg-white/10 rounded-2xl font-semibold transition flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> انضم إلى المجتمع
            </Link>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="uppercase text-emerald-700 tracking-[3px] text-sm mb-3">رسالتنا</div>
            <h2 className="text-5xl font-semibold tracking-tighter leading-none mb-6">نحن هنا لدعمكم</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              يهدف ملتقى الطلاب السوريين في لبنان إلى تمكين الطلاب السوريين من الوصول إلى المعلومات الدقيقة والخدمات التعليمية، وتوفير منصة آمنة للتفاعل والتبادل.
            </p>
          </div>
          <div className="space-y-5 text-lg">
            <div className="flex gap-4"><div className="font-semibold text-emerald-700 min-w-[120px]">الرؤية:</div> <div>تمكين جيل متعلم وقادر على المساهمة في بناء مستقبل سوريا.</div></div>
            <div className="flex gap-4"><div className="font-semibold text-emerald-700 min-w-[120px]">الهدف:</div> <div>تقديم دعم شامل وموثوق لأكثر من ١٢ ألف طالب سوري في لبنان.</div></div>
          </div>
        </div>
      </div>

      {/* Latest News */}
      <div className="bg-white py-16 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="text-emerald-700 text-sm tracking-widest">آخر التحديثات</div>
              <div className="text-4xl font-semibold">أحدث الأخبار</div>
            </div>
            <Link to="/news" className="text-emerald-700 hover:underline flex items-center gap-1">عرض الكل ←</Link>
          </div>

          {loading ? (
            <div className="text-center py-10">جاري التحميل...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {latestPosts.map((post, index) => (
                <motion.div whileHover={{ y: -4 }} key={index} className="border bg-white rounded-3xl p-7 group">
                  <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded mb-4">{post.category}</div>
                  <h3 className="font-semibold text-xl mb-3 leading-tight group-hover:text-emerald-700 transition">{post.title}</h3>
                  <p className="text-gray-600 line-clamp-3 mb-4 text-[15px]">{post.content}</p>
                  <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('ar-EG')}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, title: "الأدلة الإرشادية", desc: "خطوات واضحة لمعادلة الشهادات", link: "/guides" },
          { icon: MessageCircle, title: "المجتمع التفاعلي", desc: "اسأل وشارك مع الطلاب", link: "/community" },
          { icon: Newspaper, title: "الأخبار والقرارات", desc: "متابعة التحديثات الرسمية", link: "/news" },
          { icon: HelpCircle, title: "الأسئلة الشائعة", desc: "إجابات سريعة لاستفساراتكم", link: "/faq" },
        ].map((item, idx) => (
          <Link to={item.link} key={idx} className="group bg-white border hover:border-emerald-200 p-8 rounded-3xl transition">
            <item.icon className="w-9 h-9 text-emerald-700 mb-6 group-hover:scale-110 transition" />
            <div className="font-semibold text-xl mb-1.5">{item.title}</div>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// About Page
function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <div className="text-emerald-700 tracking-[2px] text-sm">من نحن</div>
        <h1 className="text-6xl font-bold tracking-tighter mt-3">عن ملتقى الطلاب السوريين</h1>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <img src="/images/about.jpg" alt="طلاب سوريون" className="w-full rounded-3xl mb-12 shadow" />
        
        <p className="text-2xl font-light mb-12">تأسس ملتقى الطلاب السوريين في لبنان كمبادرة تطوعية تهدف إلى دعم الطلاب السوريين الذين يواجهون تحديات تعليمية وإدارية في لبنان.</p>
        
        <h3 className="text-3xl font-semibold mt-14 mb-6">أهداف الملتقى</h3>
        <ul className="grid md:grid-cols-2 gap-x-12 gap-y-4 text-lg">
          <li className="flex gap-3">• توفير معلومات موثوقة ومحدثة حول القرارات الرسمية</li>
          <li className="flex gap-3">• تسهيل عملية معادلة الشهادات والوثائق</li>
          <li className="flex gap-3">• دعم الطلاب في التحويل بين الجامعات</li>
          <li className="flex gap-3">• بناء مجتمع داعم ومتفاعل بين الطلاب</li>
        </ul>

        <h3 className="text-3xl font-semibold mt-14 mb-6">من المستفيدون؟</h3>
        <p>جميع الطلاب السوريين في لبنان من مرحلة الثانوية حتى الدراسات العليا، بالإضافة إلى العائلات السورية الباحثة عن فرص تعليمية لأبنائها.</p>
      </div>
    </div>
  );
}

// News & Updates Page with CRUD for Admin
function NewsPage({ user, isAdmin }: { user: User | null; isAdmin: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [newPost, setNewPost] = useState({ title: '', content: '', category: CATEGORIES[0] });

  const fetchPosts = () => {
    fetch('/api/posts').then(r => r.json()).then(setPosts);
  };

  useEffect(() => { fetchPosts(); }, []);

  const filteredPosts = posts.filter(p => 
    (selectedCategory === 'الكل' || p.category === selectedCategory) &&
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddOrEdit = async () => {
    const method = editingPost ? 'PUT' : 'POST';
    const body = editingPost ? { id: editingPost.id, ...newPost } : newPost;

    const res = await fetch('/api/posts', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (res.ok) {
      fetchPosts();
      setShowAddModal(false);
      setEditingPost(null);
      setNewPost({ title: '', content: '', category: CATEGORIES[0] });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
    await fetch('/api/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchPosts();
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setNewPost({ title: post.title, content: post.content, category: post.category });
    setShowAddModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">الأخبار والتحديثات</h1>
          <p className="mt-2 text-gray-600">آخر التطورات والقرارات الرسمية</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingPost(null); setNewPost({ title: '', content: '', category: CATEGORIES[0] }); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> إضافة خبر جديد
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <input 
          type="text" 
          placeholder="ابحث في الأخبار..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          className="border px-5 py-3 rounded-2xl flex-1 max-w-xs focus:outline-none focus:border-emerald-400"
        />
        {['الكل', ...CATEGORIES].map(cat => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm transition ${selectedCategory === cat ? 'bg-emerald-700 text-white' : 'bg-white border hover:bg-gray-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="space-y-6">
        {filteredPosts.length === 0 && <div className="text-center py-20 text-gray-500">لا توجد أخبار مطابقة للبحث</div>}
        
        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white p-9 border border-gray-100 rounded-3xl">
            <div className="flex items-center justify-between mb-5">
              <span className="px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">{post.category}</span>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {new Date(post.created_at).toLocaleDateString('ar-EG')}
                {isAdmin && (
                  <div className="flex gap-1 ml-3">
                    <button onClick={() => openEdit(post)} className="p-1 hover:text-emerald-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-1 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
            <h2 className="font-semibold text-3xl tracking-tight mb-4">{post.title}</h2>
            <p className="text-[17px] text-gray-700 whitespace-pre-line leading-relaxed">{post.content}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-9">
            <h3 className="font-semibold text-2xl mb-6">{editingPost ? 'تعديل الخبر' : 'إضافة خبر جديد'}</h3>
            
            <input value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} placeholder="عنوان الخبر" className="w-full border p-4 rounded-2xl mb-4 text-lg" />
            
            <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full border p-4 rounded-2xl mb-4">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <textarea value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} placeholder="المحتوى..." rows={7} className="w-full border p-4 rounded-3xl mb-6 resize-y" />
            
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowAddModal(false); setEditingPost(null); }} className="px-7 py-3 rounded-2xl">إلغاء</button>
              <button onClick={handleAddOrEdit} className="px-8 py-3 bg-emerald-700 text-white rounded-2xl">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Guides Page
function GuidesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <div className="text-emerald-600 text-sm tracking-[3px]">معلومات موثوقة</div>
        <h1 className="font-bold text-6xl tracking-tighter mt-3">الأدلة الإرشادية</h1>
      </div>

      <div className="space-y-16">
        {GUIDES.map((guide, idx) => (
          <div key={idx} className="bg-white border rounded-3xl px-10 py-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-bold text-emerald-100">0{idx + 1}</div>
              <h2 className="font-semibold text-4xl tracking-tighter">{guide.title}</h2>
            </div>
            
            <div className="grid md:grid-cols-5 gap-y-12 gap-x-8 mt-8">
              <div className="md:col-span-3">
                <div className="font-medium mb-4 text-sm tracking-wider text-emerald-700">الخطوات بالتفصيل</div>
                <ol className="space-y-5 text-[15px]">
                  {guide.steps.map((step, i) => <li key={i} className="pl-8 relative before:absolute before:right-0 before:top-1 before:w-5 before:h-5 before:bg-emerald-50 before:rounded-full before:content-['✓'] before:flex before:items-center before:justify-center before:text-emerald-600 before:text-sm">{step}</li>)}
                </ol>
              </div>
              <div className="md:col-span-2 bg-gray-50 p-8 rounded-2xl text-sm">
                <div className="font-medium mb-3">الشروط والمتطلبات</div>
                <div className="text-gray-600 leading-relaxed">{guide.requirements}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Community Page: Questions + Comments on posts
function CommunityPage({ user }: { user: User | null }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'questions' | 'discussions'>('questions');
  
  // Replies for questions
  const [questionReplies, setQuestionReplies] = useState<Record<number, any[]>>({});
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});

  const fetchQuestions = () => fetch('/api/questions').then(r => r.json()).then(setQuestions);
  const fetchPosts = () => fetch('/api/posts').then(r => r.json()).then(setPosts);

  const loadReplies = async (questionId: number) => {
    const res = await fetch(`/api/question-replies?question_id=${questionId}`);
    const data = await res.json();
    setQuestionReplies(prev => ({ ...prev, [questionId]: data }));
  };

  useEffect(() => {
    fetchQuestions();
    fetchPosts();
  }, []);

  const loadComments = async (postId: number) => {
    const res = await fetch(`/api/comments?post_id=${postId}`);
    const data = await res.json();
    setComments(data);
  };

  const openPostDiscussion = (post: Post) => {
    setSelectedPost(post);
    loadComments(post.id);
    setActiveTab('discussions');
  };

  const submitQuestion = async () => {
    if (!user || !newQuestion.title) return alert('يجب تسجيل الدخول لإضافة سؤال');
    
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email,
        ...newQuestion
      })
    });
    setNewQuestion({ title: '', content: '' });
    fetchQuestions();
  };

  const submitReply = async (questionId: number) => {
    if (!user || !replyContent[questionId]) return;
    
    await fetch('/api/question-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_id: questionId,
        user_id: user.id,
        user_name: user.full_name || user.email,
        content: replyContent[questionId]
      })
    });
    
    setReplyContent(prev => ({ ...prev, [questionId]: '' }));
    loadReplies(questionId);
  };

  const submitComment = async () => {
    if (!user || !selectedPost || !newComment) return;
    
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: selectedPost.id,
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email,
        content: newComment
      })
    });
    setNewComment('');
    loadComments(selectedPost.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="font-bold text-5xl tracking-tighter">المجتمع التفاعلي</h1>
          <p className="text-gray-600 mt-1">شارك وتفاعل مع الطلاب السوريين</p>
        </div>
        {!user && <Link to="/login" className="text-emerald-700 underline">سجّل الدخول للمشاركة</Link>}
      </div>

      <div className="flex border-b mb-8">
        <button onClick={() => setActiveTab('questions')} className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'questions' ? 'border-emerald-700 text-emerald-700' : 'border-transparent'}`}>الأسئلة والاستفسارات</button>
        <button onClick={() => setActiveTab('discussions')} className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'discussions' ? 'border-emerald-700 text-emerald-700' : 'border-transparent'}`}>نقاشات على الأخبار</button>
      </div>

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div>
          {user && (
            <div className="bg-white p-8 mb-8 border rounded-3xl">
              <h3 className="font-semibold mb-4 text-xl">اطرح سؤالاً جديداً</h3>
              <input value={newQuestion.title} onChange={e => setNewQuestion({...newQuestion, title: e.target.value})} placeholder="عنوان السؤال" className="w-full border p-3.5 rounded-2xl mb-3" />
              <textarea value={newQuestion.content} onChange={e => setNewQuestion({...newQuestion, content: e.target.value})} placeholder="التفاصيل..." rows={3} className="w-full border p-3.5 rounded-2xl mb-3" />
              <button onClick={submitQuestion} className="bg-emerald-700 text-white px-7 py-3 rounded-full text-sm">نشر السؤال</button>
            </div>
          )}

          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="bg-white border p-8 rounded-3xl">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-medium">{q.user_name}</span>
                  <span className="text-gray-400">{new Date(q.created_at).toLocaleDateString('ar')}</span>
                </div>
                <div className="font-semibold text-2xl mb-3">{q.title}</div>
                <p className="text-gray-700 mb-4">{q.content}</p>

                {/* Replies Section */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-medium text-emerald-700">الإجابات والردود ({(questionReplies[q.id] || []).length})</div>
                    <button 
                      onClick={() => loadReplies(q.id)} 
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      تحديث الردود
                    </button>
                  </div>

                  {/* Display Replies */}
                  <div className="space-y-3 mb-4">
                    {(questionReplies[q.id] || []).map((reply: any) => (
                      <div key={reply.id} className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-emerald-800">{reply.user_name}</span>
                          <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleDateString('ar')}</span>
                        </div>
                        <div className="text-gray-700">{reply.content}</div>
                      </div>
                    ))}
                    {(!questionReplies[q.id] || questionReplies[q.id].length === 0) && (
                      <div className="text-sm text-gray-500">لا توجد إجابات بعد. كن أول من يجيب!</div>
                    )}
                  </div>

                  {/* Reply Input */}
                  {user && (
                    <div className="flex gap-3">
                      <input 
                        value={replyContent[q.id] || ''} 
                        onChange={e => setReplyContent(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="اكتب إجابتك أو ردك هنا..." 
                        className="flex-1 border px-5 py-3 rounded-2xl text-sm" 
                      />
                      <button 
                        onClick={() => submitReply(q.id)} 
                        className="px-6 py-3 bg-emerald-700 text-white rounded-2xl text-sm font-medium"
                      >
                        إرسال الرد
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="font-medium mb-4 px-1">اختر خبراً للمشاركة</div>
            {posts.map(post => (
              <button key={post.id} onClick={() => openPostDiscussion(post)} className={`w-full text-right p-5 mb-2 border rounded-2xl text-sm hover:bg-gray-50 ${selectedPost?.id === post.id ? 'border-emerald-700' : ''}`}>
                {post.title}
              </button>
            ))}
          </div>

          <div className="md:col-span-3">
            {selectedPost ? (
              <div>
                <div className="font-semibold text-2xl mb-6 border-b pb-4">{selectedPost.title}</div>
                
                {user && (
                  <div className="flex mb-7 gap-3">
                    <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="اكتب تعليقك..." className="flex-1 border px-5 py-3 rounded-full" />
                    <button onClick={submitComment} className="px-7 bg-emerald-700 text-white rounded-full">إرسال</button>
                  </div>
                )}
                
                <div className="space-y-4">
                  {comments.length === 0 && <div className="text-gray-500">لا توجد تعليقات بعد. كن أول المعلقين!</div>}
                  {comments.map(c => (
                    <div key={c.id} className="bg-white p-6 border rounded-2xl">
                      <div className="flex justify-between text-sm mb-2"><span className="font-medium">{c.user_name}</span> <span className="text-gray-400">{new Date(c.created_at).toLocaleDateString('ar')}</span></div>
                      <div>{c.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="text-gray-500 py-8">اختر خبراً من القائمة لعرض التعليقات والمشاركة</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// FAQ Page
function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h1 className="font-bold text-6xl tracking-tighter">الأسئلة الشائعة</h1>
      </div>
      <div className="space-y-3">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="border rounded-3xl overflow-hidden bg-white">
            <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="w-full flex justify-between items-center px-9 py-7 text-lg font-medium text-right">
              {faq.q}
              <span className="text-2xl text-emerald-600">{openIndex === idx ? '−' : '+'}</span>
            </button>
            {openIndex === idx && (
              <div className="px-9 pb-8 text-gray-600 text-[15px] leading-relaxed border-t pt-5">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Admin Dashboard - Full Role-Based Management
function AdminPage({ user, isAdmin, userRole }: { user: User | null; isAdmin: boolean; userRole: string }) {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'questions' | 'users'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: CATEGORIES[0] });

  const getAuthHeaders = async () => {
    return { 'Content-Type': 'application/json' };
  };

  const fetchAllData = async () => {
    setLoadingData(true);
    const headers = await getAuthHeaders();

    try {
      // Posts
      const postsRes = await fetch('/api/admin/posts', { headers });
      if (postsRes.ok) setPosts(await postsRes.json());

      // Comments
      const commentsRes = await fetch('/api/admin/comments', { headers });
      if (commentsRes.ok) setComments(await commentsRes.json());

      // Questions
      const questionsRes = await fetch('/api/admin/questions', { headers });
      if (questionsRes.ok) setQuestions(await questionsRes.json());

      // Users
      const usersRes = await fetch('/api/admin/users', { headers });
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (e) {
      console.error('Admin data fetch error');
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (isAdmin) fetchAllData();
  }, [isAdmin]);

  // Protected API Calls
  const adminApiCall = async (endpoint: string, method: string, body?: any) => {
    const headers = await getAuthHeaders();
    const res = await fetch(endpoint, { 
      method, 
      headers, 
      body: body ? JSON.stringify(body) : undefined 
    });
    if (!res.ok) {
      const err = await res.json();
      alert('خطأ: ' + (err.error || 'فشلت العملية'));
      return false;
    }
    return true;
  };

  // Posts Management
  const handleSavePost = async () => {
    const success = await adminApiCall(
      editingPost ? '/api/admin/posts' : '/api/admin/posts',
      editingPost ? 'PUT' : 'POST',
      editingPost ? { id: editingPost.id, ...newPost } : newPost
    );
    if (success) {
      setShowPostModal(false);
      setEditingPost(null);
      setNewPost({ title: '', content: '', category: CATEGORIES[0] });
      fetchAllData();
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('حذف الخبر؟')) return;
    const success = await adminApiCall('/api/admin/posts', 'DELETE', { id });
    if (success) fetchAllData();
  };

  const openEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPost({ title: post.title, content: post.content, category: post.category });
    setShowPostModal(true);
  };

  // Comments Management
  const handleDeleteComment = async (id: number) => {
    if (!confirm('حذف التعليق؟')) return;
    const success = await adminApiCall('/api/admin/comments', 'DELETE', { id });
    if (success) fetchAllData();
  };

  // Questions Management
  const handleToggleAnswered = async (q: Question) => {
    const success = await adminApiCall('/api/admin/questions', 'PUT', { id: q.id, answered: !q.answered });
    if (success) fetchAllData();
  };
  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('حذف السؤال؟')) return;
    const success = await adminApiCall('/api/admin/questions', 'DELETE', { id });
    if (success) fetchAllData();
  };

  // Users Management
  const handleChangeRole = async (id: string, newRole: string) => {
    const success = await adminApiCall('/api/admin/users', 'PUT', { id, role: newRole });
    if (success) fetchAllData();
  };
  const handleDeleteUser = async (id: string) => {
    if (!confirm('حذف المستخدم نهائياً؟')) return;
    const success = await adminApiCall('/api/admin/users', 'DELETE', { id });
    if (success) fetchAllData();
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-3xl font-bold">وصول مقيد</h2>
        <p className="mt-3 text-gray-600">هذه الصفحة مخصصة للمشرفين فقط.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      <div className="flex justify-between items-end mb-9">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">لوحة الإدارة</h1>
          <p className="text-gray-600 mt-1">إدارة المحتوى والمستخدمين</p>
        </div>
        <button onClick={fetchAllData} disabled={loadingData} className="px-6 py-3 text-sm border rounded-2xl">تحديث البيانات</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-9 text-sm">
        {[
          { id: 'posts', label: 'إدارة الأخبار', count: posts.length },
          { id: 'comments', label: 'التعليقات', count: comments.length },
          { id: 'questions', label: 'الأسئلة', count: questions.length },
          { id: 'users', label: 'المستخدمين', count: users.length }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-8 py-4 font-medium border-b-2 transition ${activeTab === tab.id ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-gray-500'}`}
          >
            {tab.label} <span className="text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {loadingData && <div className="py-12 text-center text-gray-400">جاري تحميل البيانات...</div>}

      {/* POSTS TAB */}
      {activeTab === 'posts' && (
        <div>
          <div className="flex justify-between mb-6">
            <div className="text-xl font-semibold">جميع الأخبار ({posts.length})</div>
            <button 
              onClick={() => { setEditingPost(null); setNewPost({ title: '', content: '', category: CATEGORIES[0] }); setShowPostModal(true); }} 
              className="flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm"
            >
              <Plus className="w-4 h-4"/> إضافة خبر جديد
            </button>
          </div>
          <div className="bg-white border rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b text-sm">
                <tr><th className="p-6 text-right">العنوان</th><th className="p-6 text-right">الفئة</th><th className="p-6">التاريخ</th><th className="p-6 w-40"></th></tr>
              </thead>
              <tbody className="divide-y text-sm">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="p-6 font-medium">{post.title}</td>
                    <td className="p-6"><span className="bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full text-xs">{post.category}</span></td>
                    <td className="p-6 text-center text-gray-500">{new Date(post.created_at).toLocaleDateString('ar')}</td>
                    <td className="p-6 text-center">
                      <button onClick={() => openEditPost(post)} className="mx-1 text-emerald-600 hover:underline"><Edit2 className="inline w-4 h-4" /></button>
                      <button onClick={() => handleDeletePost(post.id)} className="mx-1 text-red-600 hover:underline"><Trash2 className="inline w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMMENTS TAB */}
      {activeTab === 'comments' && (
        <div>
          <div className="text-xl font-semibold mb-6">جميع التعليقات ({comments.length})</div>
          <div className="bg-white border rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b text-sm">
                <tr><th className="p-6 text-right">التعليق</th><th className="p-6">الكاتب</th><th className="p-6">التاريخ</th><th></th></tr>
              </thead>
              <tbody className="divide-y text-sm">
                {comments.map(c => (
                  <tr key={c.id}>
                    <td className="p-6 max-w-md text-gray-700">{c.content}</td>
                    <td className="p-6 text-gray-500">{c.user_name}</td>
                    <td className="p-6 text-center text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString('ar')}</td>
                    <td className="p-6"><button onClick={() => handleDeleteComment(c.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUESTIONS TAB */}
      {activeTab === 'questions' && (
        <div>
          <div className="text-xl font-semibold mb-6">جميع الأسئلة ({questions.length})</div>
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="bg-white border p-8 rounded-3xl flex justify-between">
                <div>
                  <div className="font-medium text-xl">{q.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{q.user_name} • {new Date(q.created_at).toLocaleDateString('ar')}</div>
                  <div className="mt-4 text-gray-700">{q.content}</div>
                </div>
                <div className="flex flex-col gap-2 items-end w-48">
                  <button onClick={() => handleToggleAnswered(q)} className={`text-xs px-4 py-1 rounded-full ${q.answered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {q.answered ? 'تمت الإجابة' : 'لم تُجب'}
                  </button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="text-xs text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3"/> حذف</button>

                  {/* Admin Reply Input */}
                  <div className="w-full mt-3">
                    <input 
                      placeholder="اكتب إجابة رسمية..." 
                      className="w-full text-xs border px-3 py-2 rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          // Submit admin reply
                          fetch('/api/question-replies', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              question_id: q.id,
                              user_id: user?.id,
                              user_name: "المشرف",
                              content: e.currentTarget.value.trim()
                            })
                          }).then(() => {
                            e.currentTarget.value = '';
                            alert('تم إرسال الإجابة');
                          });
                        }
                      }}
                    />
                    <div className="text-[10px] text-gray-400 mt-1 text-center">اضغط Enter للإرسال</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div>
          <div className="text-xl font-semibold mb-6">إدارة المستخدمين ({users.length})</div>
          <div className="bg-white border rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b text-sm">
                <tr><th className="p-6 text-right">الاسم / البريد</th><th className="p-6">الدور</th><th className="p-6">تاريخ التسجيل</th><th className="p-6 w-48"></th></tr>
              </thead>
              <tbody className="divide-y text-sm">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="p-6">
                      <div className="font-medium">{u.full_name || '—'}</div>
                      <div className="text-gray-500 text-xs">{u.email}</div>
                    </td>
                    <td className="p-6">
                      {userRole === 'admin' ? (
                        <select value={u.role} onChange={e => handleChangeRole(u.id, e.target.value)} className="border px-3 py-1 rounded-xl text-sm">
                          <option value="user">مستخدم</option>
                          <option value="moderator">مشرف</option>
                          <option value="admin">مدير</option>
                        </select>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 rounded-xl text-sm">{u.role}</span>
                      )}
                    </td>
                    <td className="p-6 text-center text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('ar')}</td>
                    <td className="p-6 text-center">
                      {userRole === 'admin' && u.email !== 'admin@syrian-students.lb' && (
                        <button onClick={() => handleDeleteUser(u.id)} className="px-4 py-1 text-red-600 text-sm">حذف</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-gray-500">ملاحظة: يمكنك ترقية أي مستخدم إلى مشرف.</div>
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-10">
            <h3 className="font-bold text-2xl mb-7">{editingPost ? 'تعديل الخبر' : 'خبر جديد'}</h3>
            <input value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder="عنوان الخبر" className="w-full border p-4 rounded-2xl mb-4 text-lg" />
            <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })} className="w-full border p-4 rounded-2xl mb-4">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} rows={7} placeholder="المحتوى الكامل..." className="w-full border p-4 rounded-3xl mb-7" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowPostModal(false); setEditingPost(null); }} className="px-8 py-3.5 rounded-2xl border">إلغاء</button>
              <button onClick={handleSavePost} className="px-8 py-3.5 bg-emerald-700 text-white rounded-2xl">حفظ التغييرات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Authentication Page (Email/Password)
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'signup',
          email,
          password,
          full_name: name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ');
      }

      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white w-full max-w-md p-10 rounded-3xl border">
        <div className="flex justify-center mb-8">
          <div className="px-4 py-1 bg-emerald-50 text-emerald-700 text-xs tracking-[2px] rounded">ملتقى الطلاب السوريين</div>
        </div>
        
        <h2 className="text-center font-bold text-3xl tracking-tight mb-8">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="الاسم الكامل" className="w-full px-5 py-4 border rounded-2xl" required />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full px-5 py-4 border rounded-2xl" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full px-5 py-4 border rounded-2xl" required />
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          
          <button type="submit" className="mt-2 w-full py-4 bg-emerald-700 text-white font-semibold rounded-2xl">{isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}</button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="text-sm w-full mt-7 text-center text-gray-600 hover:text-emerald-700">
          {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب بالفعل؟ سجّل الدخول'}
        </button>

        <div className="text-center text-xs text-gray-400 mt-9">تجربة تجريبية: استخدم admin@syrian-students.lb / password123</div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t mt-16 py-12 bg-white text-sm text-gray-600">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-y-3 justify-between">
        <div>© ملتقى الطلاب السوريين في لبنان — منصة رسمية</div>
        <div>جميع الحقوق محفوظة ٢٠٢٥</div>
      </div>
    </footer>
  );
}

export default App;
