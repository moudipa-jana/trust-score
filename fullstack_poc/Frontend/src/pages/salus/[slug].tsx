import { useQuery } from '@apollo/client/react';
import { lowerCase } from 'lodash';
import {
  Bookmark,
  Clock,
  ExternalLink,
  HelpCircle,
  Mic,
  PlayCircle,
  Search,
  Send,
  Smile,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import ComingSoonOverlay from '@/components/salus/ComingSoonOverlay';
import { useAppSelector } from '@/Hooks/useRedux';
import { fetchQuery } from '@/lib/api';
import { CATEGORY_CONFIG } from '@/pages/sunrise-club/CardSlier';
import {
  QUERY_BLOG_CATEGORIES,
  QUERY_RECENT_BLOGS_BY_CATEGORY,
  QUERY_RECENT_VIDEOS_BY_CATEGORY,
} from '@/service';
import cmsClient from '@/service/cmsClient';
import { QUERY_GET_TOP_QUESTIONS_BY_CATEGORY } from '@/service/graphql/Forum';
import { UserProfile } from '@/types/authentication';

// --- Types ---
type Medicine = { name?: string; price?: number | string; available?: boolean };
type MedicineDoc = {
  id?: string;
  metadata?: {
    name?: string;
    manufacturer?: string;
    price?: number;
    is_discontinued?: false;
  };
  page_content?: string;
  type?: string;
};

type ApiResult = {
  type?: string;
  safety_note?: string;
  most_likely_conditions?: string[];
  recommended_medicines?: Medicine[];
  supportive_advice?: string[];
  confidence?: string | number;
  medicine_docs?: MedicineDoc[];
  answer?: string;
  intake_state?: any;
  question?: { question: string } | string;
  progress?: { current_step: number; total_steps: number };
  [key: string]: any;
} | null;

interface TopQuestionsData {
  questions: {
    id: string;
    title: string;
  }[];
}

interface RecentBlogData {
  sunriseBlogs: {
    data: {
      attributes: {
        Title: string;
        slug: string;
      };
    }[];
  };
}

interface RecentVideoData {
  youtubes: {
    data: {
      attributes: {
        Title: string;
        slug: string;
      };
    }[];
  };
}

interface BlogCategoriesData {
  blogCategories: {
    data: {
      id: string;
      attributes: {
        title: string;
        slug: string;
        slider?: any;
      };
    }[];
  };
}

const CategoryInterface: React.FC = () => {
  // --- State ---
  const router = useRouter();
  const { slug } = router.query;
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ApiResult>(null);
  const [error, setError] = useState<string | null>(null);
  const profile = useAppSelector((state) => state.auth.profile) as UserProfile;

  // Chat messages
  const [messages, setMessages] = useState<
    { id: string; sender: 'user' | 'bot'; text: string; loading?: boolean }[]
  >([]);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Intake flow state
  const [intakeActive, setIntakeActive] = useState<boolean>(false);
  const [intakeState, setIntakeState] = useState<
    { qa_pairs?: { question: string; answer: string }[] } | any
  >({ qa_pairs: [] });
  const [intakeProgress, setIntakeProgress] = useState<{
    current_step?: number;
    total_steps?: number;
  } | null>(null);
  const [pendingBotQuestion, setPendingBotQuestion] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState('Salus');
  const [searchQuery, setSearchQuery] = useState('');
  const catScrollRef = useRef<HTMLDivElement | null>(null);
  const userScrollingRef = useRef(false);

  const ITEM_STEP = 80;
  const TOP_BOTTOM_PADDING = 180;
  const REPEATS = 9;

  const [categoryAbsIndex, setCategoryAbsIndex] = useState(0);
  const [isPositioned, setIsPositioned] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // --- Helpers ---
  const escapeHtml = (str = '') =>
    str.replace(
      /[&<>"']/g,
      (ch) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[ch]!,
    );

  const formatMessageHtml = (text = '') => {
    const escaped = escapeHtml(text);
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return withBold.replace(/\r?\n/g, '<br/>');
  };

  const getLastMessageText = (sender: 'user' | 'bot') => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === sender) return messages[i].text;
    }
    return undefined;
  };

  const getItemStyle = (distance: number) => {
    const clamped = Math.min(distance, 5);

    return {
      opacity: Math.max(0.15, 1 - clamped * 0.18),
      transform: `scale(${1 - clamped * 0.04})`,
      transition: 'all 400ms ease',
      willChange: 'transform, opacity',
      scrollSnapAlign: 'center' as any,
    } as React.CSSProperties;
  };

  const scrollToAbsIndexCentered = (
    absIndex: number,
    behavior: ScrollBehavior = 'smooth',
  ) => {
    const el = catScrollRef.current;
    if (!el) return;

    const target =
      TOP_BOTTOM_PADDING +
      absIndex * ITEM_STEP -
      (el.clientHeight / 2 - ITEM_STEP / 2);

    el.scrollTo({ top: Math.max(0, target), behavior });
  };

  const onCategoryScroll = () => {
    const el = catScrollRef.current;
    if (!el) return;

    userScrollingRef.current = true;

    const categories = blogCategoriesData?.blogCategories?.data || [];
    const n = categories.length;
    if (!n) return;

    const centerY = el.scrollTop + el.clientHeight / 2;
    const yInList = centerY - TOP_BOTTOM_PADDING;
    const abs = Math.round(yInList / ITEM_STEP);

    const total = REPEATS * n;
    const clamped = Math.max(0, Math.min(total - 1, abs));
    setCategoryAbsIndex(clamped);

    window.clearTimeout((window as any).__catSnapT);
    (window as any).__catSnapT = window.setTimeout(() => {
      scrollToAbsIndexCentered(clamped, 'smooth');
      userScrollingRef.current = false;

      const realIdx = ((clamped % n) + n) % n;
      const selectedCategory = categories[realIdx];
      const newSlug = selectedCategory?.attributes?.slug;

      if (newSlug && newSlug !== slug) {
        router.push(`/salus/${newSlug}`, undefined, { shallow: false });
      }

      const midBase = Math.floor(REPEATS / 2) * n;
      const real = ((clamped % n) + n) % n;

      const nearTop = clamped < n * 2;
      const nearBottom = clamped > total - n * 2;

      if (nearTop || nearBottom) {
        const newAbs = midBase + real;
        setCategoryAbsIndex(newAbs);
        scrollToAbsIndexCentered(newAbs, 'auto');
      }
    }, 120);
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  // --- Data Fetching ---
  const mapCategorySlug = (slug: string | undefined) => {
    switch (slug) {
      case 'contagion':
        return 'Contagion';
      case 'mental-health':
        return 'mentalHealth';
      case 'lifestyle-diseases':
        return 'lifestyle';
      case 'hush-talks':
        return 'Hush talks';
      case 'she-reads':
        return 'sheReads';
      case 'wellness-corner':
        return 'wellness';
      default:
        return slug;
    }
  };

  const { data: topQuestionsData } = useQuery<TopQuestionsData>(
    QUERY_GET_TOP_QUESTIONS_BY_CATEGORY,
    {
      variables: { categorySlug: mapCategorySlug(slug as string) },
      skip: !slug,
    },
  );
  const { data: recentBlogsData } = useQuery<RecentBlogData>(
    QUERY_RECENT_BLOGS_BY_CATEGORY,
    {
      client: cmsClient,
      variables: { slug: slug },
      skip: !slug,
    },
  );
  const { data: recentVideosData } = useQuery<RecentVideoData>(
    QUERY_RECENT_VIDEOS_BY_CATEGORY,
    {
      client: cmsClient,
    },
  );
  const { data: blogCategoriesData } = useQuery<BlogCategoriesData>(
    QUERY_BLOG_CATEGORIES,
    {
      client: cmsClient,
    },
  );

  const randomVideos = React.useMemo(() => {
    const videos = recentVideosData?.youtubes?.data || [];
    if (videos.length === 0) return [];
    if (videos.length <= 2) return videos;

    const shuffled = [...videos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 2);
  }, [recentVideosData, slug]);

  useEffect(() => {
    const categories = blogCategoriesData?.blogCategories?.data || [];
    const n = categories.length;
    if (!n || !slug) return;

    const currentIndex = categories.findIndex(
      (cat: any) => cat.attributes?.slug === slug,
    );
    if (currentIndex === -1) return;

    const midBase = Math.floor(REPEATS / 2) * n;
    const targetAbs = midBase + currentIndex;

    setCategoryAbsIndex(targetAbs);
    setIsPositioned(true);

    const el = catScrollRef.current;
    if (el) {
      const target =
        TOP_BOTTOM_PADDING +
        targetAbs * ITEM_STEP -
        (el.clientHeight / 2 - ITEM_STEP / 2);

      el.scrollTop = Math.max(0, target);
    }
  }, [blogCategoriesData, slug]);

  const handleNewChat = () => {
    setChatOpen(false);
    setMessages([]);
    setQuery('');
    setResult(null);
    setError(null);
    setIntakeActive(false);
    setIntakeState({ qa_pairs: [] });
    setIntakeProgress(null);
    setPendingBotQuestion(null);
  };

  const pushMessage = (msg: {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    loading?: boolean;
  }) => {
    setMessages((prev) => [...prev, msg]);
  };

  const replaceMessage = (
    id: string,
    patch: Partial<{ text: string; loading?: boolean }>,
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  };

  const handleSubmit = async (e?: any) => {
    e?.preventDefault?.();
    const trimmed = query.trim();
    if (!trimmed) return;

    setChatOpen(true);
    const userMsgId = `u-${Date.now()}`;
    pushMessage({ id: userMsgId, sender: 'user', text: trimmed });

    // Add bot loading message first
    const botLoadingId = `b-${Date.now()}`;
    pushMessage({
      id: botLoadingId,
      sender: 'bot',
      text: 'Processing your query...',
      loading: true,
    });

    // Show coming soon overlay after bot message appears
    setTimeout(() => {
      setShowComingSoon(true);
    }, 1500);

    setQuery('');
  };

  // --- Data ---
  const allContentItems = [
    topQuestionsData?.questions?.[0] && {
      type: 'Question',
      title: topQuestionsData.questions[0].title,
      icon: ExternalLink,
      badge: 'Question',
      cols: 1,
    },
    recentBlogsData?.sunriseBlogs?.data[0] && {
      type: 'Blog',
      title: recentBlogsData.sunriseBlogs.data[0].attributes.Title,
      icon: ExternalLink,
      badge: 'Blog',
      cols: 1,
    },
    randomVideos[0] && {
      type: 'Video',
      title: randomVideos[0].attributes.Title,
      icon: PlayCircle,
      badge: 'Video',
      cols: 1,
    },
    topQuestionsData?.questions?.[1] && {
      type: 'Question',
      title: topQuestionsData.questions[1].title,
      icon: ExternalLink,
      badge: 'Question',
      cols: 1,
    },
    recentBlogsData?.sunriseBlogs?.data[1] && {
      type: 'Blog',
      title: recentBlogsData.sunriseBlogs.data[1].attributes.Title,
      icon: ExternalLink,
      badge: 'Blog',
      cols: 1,
    },
    randomVideos[1] && {
      type: 'Video',
      title: randomVideos[1].attributes.Title,
      icon: PlayCircle,
      badge: 'Video',
      cols: 1,
    },
  ].filter(Boolean);

  const contentCards = allContentItems as Array<{
    type: string;
    title: string;
    icon: any;
    badge: string;
    cols: number;
  }>;

  const toolsCards = [
    {
      title: 'BMI rate calculator',
      type: 'BMI',
      backgroundImage: '/images/bmi-bg.png',
      content: (
        <div className="relative w-full h-full flex items-center justify-center mt-2" />
      ),
    },
    {
      title: 'Calorie tracker',
      type: 'Tracker',
      backgroundImage: '/images/calorie-tracker-bg.png',
      content: (
        <div className="relative w-full h-full flex items-center justify-center mt-4" />
      ),
    },
  ];

  const categories = blogCategoriesData?.blogCategories?.data || [];
  const n = categories.length;
  const repeatedAbsIndices = n
    ? Array.from({ length: REPEATS * n }, (_, i) => i)
    : [];

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] text-white font-sans flex overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/salus-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Sidebar */}
      <div className="w-[320px] flex-shrink-0 flex flex-col bg-transparent p-4 z-20">
        {/* Logo + search */}
        <div className="mb-6 px-2 flex items-center gap-3">
          <div
            className="w-10 h-10 cursor-pointer"
            onClick={() => router.push('/')}
            title="Go to Home"
          >
            <img src="/images/logoForSalus.png" alt="kofuku-icon" />
          </div>
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search conversation"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled
              className="w-full bg-[#1F1F1F] text-sm text-gray-200 placeholder-gray-500 rounded-full pl-10 pr-4 py-3 outline-none border border-transparent focus:border-white/10 transition-colors"
            />
          </div>
        </div>

        {/* Categories - Infinite Picker */}
        <div className="flex-1 relative overflow-hidden border-r border-white/5">
          <div
            ref={catScrollRef}
            onScroll={onCategoryScroll}
            className="h-full overflow-y-auto pr-2 custom-scrollbar"
            style={{
              scrollSnapType: 'y mandatory',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
              visibility: isPositioned ? 'visible' : 'hidden',
            }}
          >
            <div className="py-[180px] space-y-7">
              {repeatedAbsIndices.map((absIdx) => {
                const realIdx = n ? absIdx % n : 0;
                const category: any = categories[realIdx];

                const distance = Math.abs(absIdx - categoryAbsIndex);
                const isInCenter = absIdx === categoryAbsIndex;
                const isAdjacent = distance === 1;

                const title = lowerCase(category?.attributes?.title || '');
                const config = CATEGORY_CONFIG[title];

                const imageUrl =
                  config?.iconRegular?.src ||
                  config?.iconRegular ||
                  category?.attributes?.slider?.image?.image?.data?.attributes
                    ?.url ||
                  category?.attributes?.slider?.[0]?.image?.image?.data
                    ?.attributes?.url;

                return (
                  <div
                    key={`${absIdx}-${category.id || realIdx}`}
                    onClick={() => {
                      // Calculate the clicked category's real index
                      const clickedRealIdx = ((absIdx % n) + n) % n;
                      const clickedCategory = categories[clickedRealIdx];
                      const clickedSlug = clickedCategory?.attributes?.slug;

                      // If clicking the center item or same category, do nothing
                      if (isInCenter || clickedSlug === slug) return;

                      // Scroll to the clicked item
                      setCategoryAbsIndex(absIdx);
                      scrollToAbsIndexCentered(absIdx, 'smooth');

                      // Navigate to the new category after a brief delay for smooth scroll
                      setTimeout(() => {
                        if (clickedSlug) {
                          router.push(`/salus/${clickedSlug}`, undefined, {
                            shallow: false,
                          });
                        }
                      }, 400);
                    }}
                    style={getItemStyle(distance)}
                    className={`w-[250px] mx-auto h-[52px] flex items-center gap-4 pl-4 pr-6 rounded-full border transition-all duration-300 cursor-pointer
                      ${isInCenter
                        ? 'bg-white/70 border-white/90'
                        : isAdjacent
                          ? 'bg-white/20 border-white/10 hover:bg-white/15 hover:border-white/15'
                          : 'bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/15'
                      }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 relative transition-all
                        ${isInCenter ? 'scale-110 ring-2 ring-white/40' : ''}`}
                    >
                      <img
                        src={
                          imageUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${category.id}`
                        }
                        alt={category?.attributes?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <span
                        className={`text-[15px] block truncate transition-all ${isInCenter ? 'text-white font-semibold' : 'text-white'
                          }`}
                        style={{ opacity: Math.max(0.3, 1 - distance * 0.12) }}
                      >
                        {category?.attributes?.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 pt-4 space-y-2">
          <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition-colors w-full text-left">
            <HelpCircle size={18} />
            <span className="text-sm">FAQ</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition-colors w-full text-left">
            <Bookmark size={18} />
            <span className="text-sm">Saved conversation</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition-colors w-full text-left">
            <Clock size={18} />
            <span className="text-sm">Previous conversation</span>
          </button>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col relative bg-transparent overflow-hidden z-10">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-8 relative z-10 custom-scrollbar">
          {chatOpen ? (
            // --- Active Chat View ---
            <div className="max-w-4xl mx-auto h-full flex flex-col relative">
              <div
                className="flex-1 overflow-y-auto space-y-6 py-4 px-2"
                ref={messagesRef}
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-4 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatars */}
                    {m.sender === 'bot' ? (
                      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-tr from-purple-500 to-blue-500" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-gray-600">
                        {profile?.profilePicture ? (
                          <img
                            src={profile.profilePicture}
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                    )}

                    {/* Bubble */}

                    <div
                      className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${m.sender === 'user'
                          ? 'bg-[#1a1a1a] text-white border border-white/10'
                          : 'bg-[#111] text-gray-200 border border-white/5'
                        }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessageHtml(m.text),
                        }}
                      />
                      {m.loading && (
                        <div className="flex gap-1 mt-2">
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100" />
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="mt-4 bg-[#111] border border-white/10 rounded-2xl p-2 flex items-center gap-2">
                <input
                  className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2"
                  placeholder="Type a message..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="p-2 bg-[#00B2ED] rounded-full text-white hover:bg-[#009acb] transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>

              {/* Coming Soon Overlay - Inside Chat Container */}
              {showComingSoon && (
                <ComingSoonOverlay onGoBack={() => router.push('/salus')} />
              )}
            </div>
          ) : (
            // --- Welcome/Dashboard View ---
            <div className="max-w-5xl mx-auto pt-10">
              {/* Greeting Section */}
              <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 rounded-full shadow-[0_0_100px_rgba(168,85,247,0.4)] overflow-hidden relative">
                  <img
                    src="/images/salus_icon.gif"
                    alt="Salus Icon"
                    className="w-full h-full object-cover scale-150"
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-semibold text-white mb-2 tracking-tight">
                    Hi, {profile?.name ? profile?.name : ''}
                  </h1>
                  <p className="text-gray-400 text-lg font-light tracking-wide">
                    Search and clear all your concern regarding health!
                  </p>
                </div>
              </div>

              {/* Main Search Input */}
              <div className="bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 mb-10 shadow-xl relative overflow-hidden group">
                <textarea
                  className="w-full bg-transparent border-none outline-none text-gray-300 text-lg placeholder-gray-500 resize-none h-10 px-2 font-light"
                  placeholder="Write down your queries"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 px-2">
                  <div className="flex items-center gap-4">
                    <button className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full">
                      <Upload size={18} />
                    </button>
                    <button className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full">
                      <Mic size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <Smile size={18} />
                    </button>
                    {/* Toggle Switch Mockup */}
                    <div className="w-10 h-5 bg-gray-600 rounded-full relative cursor-pointer hover:bg-gray-500 transition-colors">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !query.trim()}
                      className="w-8 h-8 flex items-center justify-center bg-[#333] hover:bg-[#00B2ED] rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-110 active:scale-95 duration-200"
                    >
                      <Send
                        size={14}
                        className={loading ? 'animate-pulse' : ''}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Responsive Content Grid - adapts to available cards */}
              {contentCards.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contentCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setQuery(card.title);
                          setTimeout(handleSubmit, 50);
                        }}
                        className="bg-[#0f0f12] border border-white/5 rounded-2xl p-6 hover:border-white/20 hover:bg-[#151518] transition-all cursor-pointer group h-48 flex flex-col justify-between relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start relative z-10">
                          <span className="bg-white/5 text-white/60 text-[10px] font-bold px-2 py-1 rounded border border-white/5 uppercase tracking-widest">
                            {card.badge}
                          </span>
                          <Icon
                            size={16}
                            className="text-gray-600 group-hover:text-white transition-colors"
                          />
                        </div>
                        <h3 className="text-lg text-gray-300 font-light leading-snug group-hover:text-white relative z-10">
                          {card.title}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CategoryInterface;
