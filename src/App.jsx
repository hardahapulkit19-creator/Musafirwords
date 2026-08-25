import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { useEffect, useMemo, useState } from "react";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
const POSTS = [
  {
    id: "p1",
    author: "khamosh_lafz",
    name: "Khamosh Lafz",
    avatar: "KL",
    type: "Shayari",
    time: "12 min ago",
    text: "कुछ अल्फ़ाज़ कहे नहीं जाते,\nबस महसूस किए जाते हैं।",
    likes: 284,
    comments: 24,
    tags: ["love", "feelings", "hindi"],
    commentsData: [
      { user: "zindagi_ke_panne", text: "बहुत खूबसूरत ❤️" },
      {
        user: "lafzon_ka_safar",
        text: "कुछ बातें सच में शब्दों से परे होती हैं।",
      },
    ],
  },
  {
    id: "p2",
    author: "lafzon_ka_safar",
    name: "Lafzon Ka Safar",
    avatar: "LS",
    type: "Kavita",
    time: "34 min ago",
    text: "सफ़र अभी बाकी है,\nकुछ रास्ते अभी बाकी हैं,\nजो खो गया उसे जाने दो,\nकुछ ख्वाब अभी बाकी हैं।",
    likes: 192,
    comments: 18,
    tags: ["life", "safar", "kavita"],
    commentsData: [
      { user: "musafir_07", text: "क्या बात है! ✨" },
      { user: "khamosh_lafz", text: "बहुत सुंदर लिखा है।" },
    ],
  },
  {
    id: "p3",
    author: "adhuri_baat",
    name: "Adhuri Baat",
    avatar: "AB",
    type: "Poem",
    time: "1 hr ago",
    text: "वक्त बदलता रहा,\nलोग बदलते रहे,\nऔर हम वही रहे,\nजो कल भी तुम्हें ढूंढते रहे।",
    likes: 421,
    comments: 41,
    tags: ["sad", "love", "poetry"],
    commentsData: [
      { user: "dil_se", text: "This hits different. 💔" },
    ],
  },
  {
    id: "p4",
    author: "sukoon_ke_lafz",
    name: "Sukoon Ke Lafz",
    avatar: "SL",
    type: "Quote",
    time: "2 hr ago",
    text: "हर चीज़ का जवाब देना ज़रूरी नहीं,\nकुछ सवालों को वक्त पर छोड़ देना चाहिए।",
    likes: 337,
    comments: 29,
    tags: ["life", "quote", "thought"],
    commentsData: [],
  },
  {
    id: "p5",
    author: "ek_anjaan_musafir",
    name: "Ek Anjaan Musafir",
    avatar: "EM",
    type: "Line",
    time: "3 hr ago",
    text: "कुछ सफ़र अकेले ही तय करने पड़ते हैं।",
    likes: 156,
    comments: 11,
    tags: ["safar", "life", "line"],
    commentsData: [],
  },
];

const CATEGORIES = [
  "All",
  "Shayari",
  "Poem",
  "Kavita",
  "Quote",
  "Line",
  "Thought",
  "Story",
];

function App() {
  
    // Firebase user
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("For You");

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showLogin, setShowLogin] = useState(false);
  const [loginReason, setLoginReason] = useState("");

  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState("");

  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  const [showShare, setShowShare] = useState(null);
  const [shareStatus, setShareStatus] = useState("");

  const [guestSeconds, setGuestSeconds] = useState(5 * 60);

  // Create Writing
  const [showWriterEditor, setShowWriterEditor] = useState(false);
  const [writingType, setWritingType] = useState("Shayari");
  const [writingTitle, setWritingTitle] = useState("");
  const [writingText, setWritingText] = useState("");

  // Firebase authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Logged-in users do not need a guest session.
        setShowLogin(false);
        setLoginReason("");
      } else {
        // Start a fresh 5-minute guest session after logout.
        setGuestSeconds(5 * 60);
      }
    });

    return () => unsubscribe();
  }, []);

  // Keep the logged-in user's Firestore profile in sync.
  // The "following" array is stored on the current user's document.
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLikedPosts([]);
      setSavedPosts([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        const data = snapshot.exists() ? snapshot.data() : {};
        setUserProfile({
          uid: user.uid,
          name: data.name || user.displayName || "Musafir",
          email: data.email || user.email || "",
          photoURL: data.photoURL || user.photoURL || "",
          following: Array.isArray(data.following) ? data.following : [],
          likedPosts: Array.isArray(data.likedPosts) ? data.likedPosts : [],
          savedPosts: Array.isArray(data.savedPosts) ? data.savedPosts : [],
        });
        setLikedPosts(Array.isArray(data.likedPosts) ? data.likedPosts : []);
        setSavedPosts(Array.isArray(data.savedPosts) ? data.savedPosts : []);
      },
      (error) => {
        console.error("User profile listener error:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Guest timer: runs only after Firebase confirms that
  // the visitor is logged out.
  useEffect(() => {
    if (authLoading || user) return;

    const timer = setInterval(() => {
      setGuestSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setShowLogin(true);
          setLoginReason(
            "Your 5-minute guest reading session has ended."
          );
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authLoading, user]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const requireLogin = (reason) => {
    setLoginReason(reason);
    setShowLogin(true);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          uid: currentUser.uid,
          name: currentUser.displayName || "Musafir",
          email: currentUser.email || "",
          photoURL: currentUser.photoURL || "",
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      setShowLogin(false);
      setLoginReason("");
      console.log("Logged in and user saved:", currentUser.uid);
    } catch (error) {
      console.error("Google login error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        alert(error.message || "Google login failed. Please try again.");
      }
    }
  };

  // Live Firestore posts
  const [firestorePosts, setFirestorePosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const posts = snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data();
          return {
            id: snapshotDoc.id,
            authorId: data.authorId || "",
            author: data.author || "musafir",
            name: data.name || "Musafir",
            avatar: data.avatar || "M",
            type: data.type || "Other",
            title: data.title || "",
            text: data.text || "",
            likes: data.likes || 0,
            comments: data.comments || 0,
            tags: data.tags || [],
            commentsData: [],
            time: data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleString()
              : "Just now",
            isFirestorePost: true,
          };
        });

        setFirestorePosts(posts);
        setPostsLoading(false);
      },
      (error) => {
        console.error("Posts listener error:", error);
        setPostsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const openWriterEditor = () => {
    setShowWriterEditor(true);
  };

  const closeWriterEditor = () => {
    setShowWriterEditor(false);
    setWritingTitle("");
    setWritingText("");
    setWritingType("Shayari");
  };

  const handlePublishWriting = async () => {
    if (!writingText.trim()) {
      alert("Please write something before publishing.");
      return;
    }

    if (!user) {
      requireLogin("Create an account to publish your writing.");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        author: user.email?.split("@")[0] || "musafir",
        name: user.displayName || "Musafir",
        avatar: user.displayName?.charAt(0)?.toUpperCase() || "M",
        type: writingType,
        title: writingTitle.trim(),
        text: writingText.trim(),
        likes: 0,
        comments: 0,
        tags: [],
        createdAt: serverTimestamp(),
      });

      alert("Your writing has been published successfully! ✨");
      closeWriterEditor();
    } catch (error) {
      console.error("Publish error:", error);
      alert(error.message || "Could not publish your writing. Please try again.");
    }
  };

  const toggleLike = async (post) => {
    if (!user) {
      requireLogin("Create a free account to like writings.");
      return;
    }

    if (!post.isFirestorePost) {
      setLikedPosts((previous) =>
        previous.includes(post.id)
          ? previous.filter((id) => id !== post.id)
          : [...previous, post.id]
      );
      return;
    }

    const alreadyLiked = likedPosts.includes(post.id);
    try {
      await updateDoc(doc(db, "posts", post.id), {
        likes: increment(alreadyLiked ? -1 : 1),
      });
      await updateDoc(doc(db, "users", user.uid), {
        likedPosts: alreadyLiked ? arrayRemove(post.id) : arrayUnion(post.id),
      });
      setLikedPosts((previous) =>
        alreadyLiked
          ? previous.filter((id) => id !== post.id)
          : [...previous, post.id]
      );
    } catch (error) {
      console.error("Like error:", error);
      alert(error.message || "Could not update like.");
    }
  };

  const toggleSave = async (post) => {
    if (!user) {
      requireLogin("Create a free account to save writings.");
      return;
    }

    const alreadySaved = savedPosts.includes(post.id);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { savedPosts: alreadySaved ? arrayRemove(post.id) : arrayUnion(post.id) },
        { merge: true }
      );
      setSavedPosts((previous) =>
        alreadySaved
          ? previous.filter((id) => id !== post.id)
          : [...previous, post.id]
      );
    } catch (error) {
      console.error("Save error:", error);
      alert(error.message || "Could not update saved posts.");
    }
  };

  const toggleFollow = async (authorId) => {
    if (!user) {
      requireLogin("Create a free account to follow writers.");
      return;
    }

    if (!authorId || authorId === user.uid) return;

    const following = userProfile?.following || [];
    const alreadyFollowing = following.includes(authorId);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        following: alreadyFollowing
          ? arrayRemove(authorId)
          : arrayUnion(authorId),
      });
    } catch (error) {
      console.error("Follow error:", error);
      alert(error.message || "Could not update following.");
    }
  };

  const openWriter = () => {
    if (!user) {
      requireLogin("Create a free account to explore writers.");
      return;
    }
  };

  const openComments = (postId) => {
    setShowComments(postId);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;

    if (!user) {
      requireLogin("Create a free account to comment on writings.");
      return;
    }

    const post = [...firestorePosts, ...POSTS].find((item) => item.id === showComments);
    if (!post) return;

    if (!post.isFirestorePost) {
      requireLogin("Comments on this demo post will be available with the live database.");
      return;
    }

    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        userId: user.uid,
        user: user.displayName || user.email?.split("@")[0] || "Musafir",
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "posts", post.id), {
        comments: increment(1),
      });

      setCommentText("");
    } catch (error) {
      console.error("Comment error:", error);
      alert(error.message || "Could not add comment.");
    }
  };

  const copyLink = async (post) => {
    const url = `${window.location.origin}/p/${post.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("Link copied!");
    } catch {
      setShareStatus("Copy failed. Please copy the page URL.");
    }

    setTimeout(() => setShareStatus(""), 2200);
  };

  const shareNative = async (post) => {
    const url = `${window.location.origin}/p/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.type} by ${post.name}`,
          text: post.text,
          url,
        });
      } catch {
        // User cancelled sharing.
      }
    } else {
      await copyLink(post);
    }
  };

  const createImage = async (post) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1080;
    canvas.height = 1350;

    ctx.fillStyle = "#0d0d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#34343f";
    ctx.lineWidth = 3;
    ctx.strokeRect(55, 55, 970, 1240);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px Arial";
    ctx.fillText("MusafirWords", 90, 130);

    ctx.fillStyle = "#9696a5";
    ctx.font = "24px Arial";
    ctx.fillText(post.type, 90, 175);

    ctx.fillStyle = "#ffffff";
    ctx.font = "44px Arial";

    const lines = post.text.split("\n");
    let y = 570;

    lines.forEach((line) => {
      ctx.fillText(line, 90, y);
      y += 72;
    });

    ctx.fillStyle = "#b4b4c2";
    ctx.font = "26px Arial";
    ctx.fillText(`— ${post.name}`, 90, 1090);

    ctx.fillStyle = "#666675";
    ctx.font = "22px Arial";
    ctx.fillText("Write. Feel. Share.", 90, 1225);

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `musafirwords-${post.id}.png`;
    link.click();

    setShareStatus("Image created!");
    setTimeout(() => setShareStatus(""), 2200);
  };

  const myPosts = useMemo(
    () => firestorePosts.filter((post) => user && post.authorId === user.uid),
    [firestorePosts, user]
  );

  const filteredPosts = useMemo(() => {
    let result;

    if (activeTab === "Following" && user) {
      const following = userProfile?.following || [];
      result = firestorePosts.filter((post) =>
        following.includes(post.authorId)
      );
    } else if (activeTab === "Profile" && user) {
      result = firestorePosts.filter(
        (post) => post.authorId === user.uid
      );
    } else {
      // For You keeps the original demo writings and all live Firestore writings.
      result = [...firestorePosts, ...POSTS];
    }

    if (category !== "All") {
      result = result.filter((post) => post.type === category);
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((post) => {
        return (
          post.text.toLowerCase().includes(query) ||
          post.name.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query) ||
          post.type.toLowerCase().includes(query) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(query)
          )
        );
      });
    }

    return result;
  }, [
    activeTab,
    user,
    userProfile,
    search,
    category,
    firestorePosts,
  ]);

  return (
    <div className="app">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #08080b;
          color: #f4f4f6;
          font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% -20%,
              rgba(125, 88, 255, 0.10),
              transparent 32%
            ),
            #08080b;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          border-bottom: 1px solid #22222a;
          background: rgba(8, 8, 11, 0.88);
          backdrop-filter: blur(18px);
        }

        .brand {
          border: 0;
          background: transparent;
          color: #fff;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -0.7px;
          padding: 0;
        }

        .brand span {
          color: #a98bff;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .guest-pill {
          color: #a7a7b3;
          font-size: 13px;
          padding: 7px 12px;
          border: 1px solid #292932;
          border-radius: 999px;
        }

        .login-btn {
          border: 1px solid #8b68ff;
          background: #8b68ff;
          color: white;
          border-radius: 10px;
          padding: 10px 17px;
          font-weight: 700;
        }

        .login-btn:hover {
          background: #7954f2;
        }

        .layout {
          width: min(1120px, calc(100% - 32px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: 210px minmax(0, 680px);
          gap: 34px;
          justify-content: center;
          padding: 30px 0 70px;
        }

        .sidebar {
          position: sticky;
          top: 102px;
          height: fit-content;
        }

        .sidebar-title {
          color: #777785;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-size: 11px;
          margin: 0 0 14px 10px;
        }

        .nav-btn {
          width: 100%;
          text-align: left;
          border: 0;
          background: transparent;
          color: #a7a7b3;
          padding: 13px 14px;
          border-radius: 11px;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .nav-btn:hover,
        .nav-btn.active {
          color: white;
          background: #17171e;
        }

        .write-side {
          margin-top: 18px;
          width: 100%;
          border: 0;
          background: white;
          color: #09090c;
          border-radius: 12px;
          padding: 13px;
          font-weight: 800;
        }

        .main {
          min-width: 0;
        }

        .hero {
          padding: 10px 4px 26px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 48px);
          letter-spacing: -2px;
          line-height: 1.05;
        }

        .hero p {
          margin: 12px 0 0;
          color: #92929e;
          line-height: 1.6;
          max-width: 600px;
        }

        .tabs-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #24242c;
          margin-bottom: 20px;
        }

        .tabs {
          display: flex;
          gap: 25px;
        }

        .tab {
          position: relative;
          border: 0;
          background: transparent;
          color: #777783;
          padding: 14px 2px;
          font-weight: 700;
        }

        .tab.active {
          color: white;
        }

        .tab.active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          background: #a98bff;
          border-radius: 2px;
        }

        .search-btn {
          width: 38px;
          height: 38px;
          border: 1px solid #292932;
          background: #121219;
          color: #dddde5;
          border-radius: 10px;
          font-size: 17px;
        }

        .search-box {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .search-box input {
          flex: 1;
          border: 1px solid #292932;
          background: #111117;
          color: white;
          outline: none;
          border-radius: 11px;
          padding: 13px 15px;
        }

        .search-box input:focus {
          border-color: #8061e8;
        }

        .category-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 0 0 17px;
          scrollbar-width: none;
        }

        .category-scroll::-webkit-scrollbar {
          display: none;
        }

        .category {
          flex: 0 0 auto;
          border: 1px solid #292932;
          background: #101016;
          color: #9999a6;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 13px;
        }

        .category.active {
          color: white;
          background: #282231;
          border-color: #6d54b7;
        }

        .guest-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border: 1px solid #2a2835;
          background: linear-gradient(90deg, #12111a, #101014);
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 18px;
        }

        .guest-banner strong {
          display: block;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .guest-banner small {
          color: #81818e;
        }

        .timer {
          color: #b69aff;
          font-weight: 800;
          white-space: nowrap;
        }

        .post {
          border: 1px solid #24242c;
          background: rgba(14, 14, 19, 0.88);
          border-radius: 17px;
          padding: 22px;
          margin-bottom: 15px;
          transition: border-color 0.2s;
        }

        .post:hover {
          border-color: #363641;
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .author {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8d6aff, #4e3b91);
          display: grid;
          place-items: center;
          font-weight: 800;
          color: white;
          flex: 0 0 auto;
        }

        .author-name {
          border: 0;
          background: transparent;
          color: white;
          padding: 0;
          font-weight: 750;
          text-align: left;
        }

        .author-meta {
          display: flex;
          gap: 7px;
          margin-top: 3px;
          color: #6f6f7b;
          font-size: 12px;
        }

        .post-type {
          color: #a98bff;
        }

        .post-text {
          white-space: pre-line;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          line-height: 1.75;
          color: #eeeef2;
          padding: 25px 4px 21px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          padding-bottom: 17px;
        }

        .tag {
          color: #858592;
          font-size: 12px;
        }

        .post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          border-top: 1px solid #23232b;
          padding-top: 14px;
        }

        .action {
          border: 0;
          background: transparent;
          color: #888894;
          padding: 8px 9px;
          border-radius: 8px;
          font-size: 13px;
        }

        .action:hover {
          color: white;
          background: #1a1a22;
        }

        .action.spacer {
          margin-left: auto;
        }

        .empty {
          text-align: center;
          border: 1px dashed #30303a;
          border-radius: 15px;
          padding: 50px 20px;
          color: #777783;
        }

        .empty p {
          color: #777783;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(8px);
        }

        .modal {
          width: min(460px, 100%);
          border: 1px solid #30303a;
          background: #111116;
          border-radius: 19px;
          padding: 27px;
          box-shadow: 0 25px 90px rgba(0, 0, 0, 0.5);
        }

        .modal h2 {
          margin: 0 0 9px;
          font-size: 25px;
        }

        .modal p {
          color: #92929e;
          line-height: 1.6;
          margin: 0 0 20px;
        }

        .modal-actions {
          display: grid;
          gap: 10px;
        }

        .google-btn,
        .email-btn,
        .close-btn {
          width: 100%;
          border-radius: 11px;
          padding: 12px 14px;
          font-weight: 750;
        }

        .google-btn {
          background: white;
          border: 0;
          color: #111;
        }

        .email-btn {
          background: #8c69ff;
          color: white;
          border: 0;
        }

        .close-btn {
          background: transparent;
          border: 1px solid #30303a;
          color: #aaaab5;
        }

        .comments {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #24242c;
        }

        .comment {
          padding: 10px 0;
        }

        .comment strong {
          font-size: 13px;
        }

        .comment p {
          color: #c7c7cf;
          margin: 4px 0 0;
          line-height: 1.5;
        }

        .comment-input {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .comment-input input {
          flex: 1;
          min-width: 0;
          background: #09090d;
          border: 1px solid #2c2c35;
          border-radius: 9px;
          color: white;
          padding: 10px;
          outline: none;
        }

        .comment-input button {
          border: 0;
          border-radius: 9px;
          padding: 0 14px;
          background: #8b68ff;
          color: white;
          font-weight: 700;
        }

        .share-options {
          display: grid;
          gap: 9px;
        }

        .share-option {
          border: 1px solid #2b2b35;
          background: #17171e;
          color: white;
          padding: 13px;
          border-radius: 10px;
          text-align: left;
        }

        .share-option:hover {
          border-color: #7157ba;
          background: #1b1922;
        }

        .status {
          position: fixed;
          left: 50%;
          bottom: 28px;
          transform: translateX(-50%);
          z-index: 150;
          background: white;
          color: #101014;
          border-radius: 999px;
          padding: 10px 17px;
          font-size: 13px;
          font-weight: 750;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4);
        }

        .follow-btn {
          border: 1px solid #6d54b7;
          background: #17131f;
          color: #b69aff;
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 800;
        }

        .follow-btn:hover {
          background: #241d31;
        }

        .profile-card {
          border: 1px solid #292932;
          background: linear-gradient(145deg, #15131c, #0f0f14);
          border-radius: 17px;
          padding: 22px;
          margin-bottom: 20px;
        }

        .profile-head {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #8d6aff, #4e3b91);
          color: white;
          font-size: 24px;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .profile-name {
          margin: 0;
          font-size: 22px;
        }

        .profile-email {
          margin: 5px 0 0;
          color: #777783;
          font-size: 13px;
        }

        .profile-stats {
          display: flex;
          gap: 22px;
          margin-top: 18px;
          color: #a7a7b3;
          font-size: 13px;
        }

        .profile-stats strong {
          color: white;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #8d6aff, #4e3b91);
          color: white;
          font-weight: 800;
        }

        .user-info {
          cursor: pointer;
          color: white;
        }

        .user-info strong {
          font-size: 13px;
        }

        .logout-btn {
          border: 1px solid #30303a;
          background: #17171e;
          color: #dddde5;
          border-radius: 9px;
          padding: 9px 12px;
        }

        .logout-btn:hover {
          background: #22222a;
        }

        .mobile-write {
          display: none;
        }

        .editor-label {
          display: block;
          color: #aaaab5;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .editor-input,
        .editor-select,
        .editor-textarea {
          width: 100%;
          background: #09090d;
          border: 1px solid #30303a;
          color: white;
          border-radius: 10px;
          outline: none;
        }

        .editor-input,
        .editor-select {
          padding: 13px;
        }

        .editor-textarea {
          resize: vertical;
          padding: 16px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          line-height: 1.7;
        }

        .editor-input:focus,
        .editor-select:focus,
        .editor-textarea:focus {
          border-color: #8061e8;
        }

        @media (max-width: 820px) {
          .topbar {
            padding: 0 16px;
          }

          .guest-pill {
            display: none;
          }

          .layout {
            display: block;
            width: min(680px, calc(100% - 24px));
            padding-top: 20px;
          }

          .sidebar {
            display: none;
          }

          .mobile-write {
            display: block;
            position: fixed;
            right: 18px;
            bottom: 18px;
            z-index: 40;
            border: 0;
            background: white;
            color: black;
            border-radius: 999px;
            padding: 13px 18px;
            font-weight: 800;
            box-shadow: 0 12px 35px rgba(0,0,0,.35);
          }

          .post {
            padding: 18px;
          }

          .post-text {
            font-size: 21px;
          }
        }

        @media (max-width: 520px) {
          .brand {
            font-size: 20px;
          }

          .login-btn {
            padding: 9px 12px;
          }

          .hero h1 {
            font-size: 34px;
          }

          .post-text {
            font-size: 20px;
            line-height: 1.65;
          }

          .post-actions {
            overflow-x: auto;
          }

          .action {
            white-space: nowrap;
          }
        }
      `}</style>

      {/* TOP BAR */}
      <header className="topbar">
        <button
          className="brand"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Musafir<span>Words</span>
        </button>

        <div className="top-actions">
          {!authLoading && !user && (
            <div className="guest-pill">
              Guest · {formatTime(guestSeconds)}
            </div>
          )}

          {user ? (
  <div className="user-menu">
    <div className="user-avatar">
      {user.displayName?.charAt(0)?.toUpperCase() || "U"}
    </div>

    <button
      className="user-info"
      style={{ border: 0, background: "transparent", padding: 0 }}
      onClick={() => setActiveTab("Profile")}
      title="Open your profile"
    >
      <strong>{user.displayName || "Musafir"}</strong>
    </button>

    <button
      className="logout-btn"
      onClick={async () => {
        try {
          await signOut(auth);
        } catch (error) {
          console.error("Logout error:", error);
        }
      }}
    >
      Logout
    </button>
  </div>
) : (
  <button
    className="login-btn"
    onClick={() =>
      requireLogin("Create an account to continue your journey.")
    }
  >
    Login
  </button>
)}
        </div>
      </header>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Explore</p>

          <button
            className={`nav-btn ${
              activeTab === "For You" ? "active" : ""
            }`}
            onClick={() => setActiveTab("For You")}
          >
            ✦ For You
          </button>

          <button
            className={`nav-btn ${
              activeTab === "Following" ? "active" : ""
            }`}
            onClick={() => {
              if (user) {
                setActiveTab("Following");
              } else {
                requireLogin(
                  "Login to see writings from writers you follow."
                );
              }
            }}
          >
            ♡ Following
          </button>

          <button
            className="nav-btn"
            onClick={() => {
              if (user) {
                openWriterEditor();
              } else {
                requireLogin(
                  "Create an account to write and share your words."
                );
              }
            }}
          >
            ✎ Write
          </button>

          <button
            className={`nav-btn ${
              activeTab === "Profile" ? "active" : ""
            }`}
            onClick={() => {
              if (user) {
                setActiveTab("Profile");
              } else {
                requireLogin("Create an account to view your profile.");
              }
            }}
          >
            ◯ Profile
          </button>

          <button
            className="write-side"
            onClick={() => {
              if (user) {
                openWriterEditor();
              } else {
                requireLogin(
                  "Create an account to write and share your words."
                );
              }
            }}
          >
            + Write something
          </button>
        </aside>

        {/* MAIN */}
        <main className="main">
          <section className="hero">
            <h1>Words that travel with you.</h1>

            <p>
              Read something. Feel something. Write something.
              <br />
              A quiet place for Shayari, Kavita, Poems, Quotes and thoughts.
            </p>
          </section>

          {activeTab === "Profile" && user && (
            <section className="profile-card">
              <div className="profile-head">
                <div className="profile-avatar">
                  {user.displayName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="profile-name">
                    {user.displayName || "Musafir"}
                  </h2>
                  <p className="profile-email">
                    {user.email || "MusafirWords writer"}
                  </p>
                </div>
              </div>

              <div className="profile-stats">
                <span>
                  <strong>{myPosts.length}</strong> writings
                </span>
                <span>
                  <strong>{(userProfile?.following || []).length}</strong>{" "}
                  following
                </span>
              </div>
            </section>
          )}

          {/* TABS */}
          <div className="tabs-row">
            <div className="tabs">
              <button
                className={`tab ${
                  activeTab === "Following" ? "active" : ""
                }`}
                onClick={() => {
                  if (user) {
                    setActiveTab("Following");
                  } else {
                    requireLogin(
                      "Login to see your Following feed."
                    );
                  }
                }}
              >
                Following
              </button>

              <button
                className={`tab ${
                  activeTab === "For You" ? "active" : ""
                }`}
                onClick={() => setActiveTab("For You")}
              >
                For You
              </button>
            </div>

            <button
              className="search-btn"
              title="Search"
              onClick={() => setSearchOpen((value) => !value)}
            >
              🔍
            </button>
          </div>

          {/* SEARCH */}
          {searchOpen && (
            <div className="search-box">
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search words, writers, poems..."
              />

              <button
                className="close-btn"
                style={{
                  width: "auto",
                  padding: "0 15px",
                }}
                onClick={() => {
                  setSearch("");
                  setSearchOpen(false);
                }}
              >
                Close
              </button>
            </div>
          )}

          {/* CATEGORIES */}
          <div className="category-scroll">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                className={`category ${
                  category === item ? "active" : ""
                }`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* GUEST BANNER */}
          {!authLoading && !user && (
            <div className="guest-banner">
              <div>
                <strong>Reading as a guest</strong>

                <small>
                  Read and share public writings. Login to like,
                  comment, follow and write.
                </small>
              </div>

              <div className="timer">
                {formatTime(guestSeconds)}
              </div>
            </div>
          )}

          {/* FEED */}
          {postsLoading && (
            <div className="empty">Loading writings...</div>
          )}

          {activeTab === "Following" && !user ? (
            <div className="empty">
              <strong>Login required.</strong>
              <p>Login to see writings from writers you follow.</p>
              <button
                className="login-btn"
                onClick={() =>
                  requireLogin(
                    "Login to access your Following feed."
                  )
                }
              >
                Login to continue
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="empty">
              {activeTab === "Following" ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>♡</div>
                  <strong>Your Following feed is empty.</strong>
                  <p>
                    Follow writers from the For You feed and their new
                    writings will appear here.
                  </p>
                  <button
                    className="login-btn"
                    onClick={() => setActiveTab("For You")}
                  >
                    Explore writers
                  </button>
                </>
              ) : activeTab === "Profile" ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✎</div>
                  <strong>You haven't published anything yet.</strong>
                  <p>Write your first piece and it will appear on your profile.</p>
                  <button
                    className="login-btn"
                    onClick={openWriterEditor}
                  >
                    Write something
                  </button>
                </>
              ) : (
                <>
                  <strong>No writings found.</strong>
                  <p>Try another word, writer or category.</p>
                </>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isLiked = likedPosts.includes(post.id);
              const isSaved = savedPosts.includes(post.id);
              const commentsOpen = showComments === post.id;

              return (
                <article className="post" key={post.id}>
                  {/* AUTHOR */}
                  <div className="post-header">
                    <div className="author">
                      <div className="avatar">
                        {post.avatar}
                      </div>

                      <div>
                        <button
                          className="author-name"
                          onClick={openWriter}
                        >
                          @{post.author}
                        </button>

                        <div className="author-meta">
                          <span>{post.time}</span>
                          <span>·</span>
                          <span className="post-type">
                            {post.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {post.isFirestorePost &&
                      user &&
                      post.authorId &&
                      post.authorId !== user.uid && (
                        <button
                          className="follow-btn"
                          onClick={() => toggleFollow(post.authorId)}
                        >
                          {(userProfile?.following || []).includes(post.authorId)
                            ? "Following"
                            : "Follow"}
                        </button>
                      )}
                  </div>

                  {/* TEXT */}
                  <div className="post-text">
                    {post.text}
                  </div>

                  {/* TAGS */}
                  <div className="tags">
                    {post.tags.map((tag) => (
                      <span
                        className="tag"
                        key={tag}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* ACTIONS */}
                  <div className="post-actions">
                    <button
                      className="action"
                      onClick={() => toggleLike(post)}
                    >
                      {isLiked ? "♥" : "♡"} {post.likes}
                    </button>

                    <button
                      className="action"
                      onClick={() =>
                        openComments(post.id)
                      }
                    >
                      💬 {post.comments}
                    </button>

                    <button
                      className="action"
                      onClick={() =>
                        toggleSave(post)
                      }
                    >
                      {isSaved ? "🔖" : "♧"} Save
                    </button>

                    <button
                      className="action spacer"
                      onClick={() =>
                        setShowShare(post)
                      }
                    >
                      ↗ Share
                    </button>
                  </div>

                  {/* COMMENTS */}
                  {commentsOpen && (
                    <div className="comments">
                      <strong style={{ fontSize: 14 }}>
                        Comments · {post.comments}
                      </strong>

                      {post.commentsData.length === 0 ? (
                        <p
                          style={{
                            color: "#777783",
                            fontSize: 13,
                          }}
                        >
                          No comments yet.
                        </p>
                      ) : (
                        post.commentsData.map(
                          (comment, index) => (
                            <div
                              className="comment"
                              key={index}
                            >
                              <strong>
                                @{comment.user}
                              </strong>

                              <p>
                                {comment.text}
                              </p>
                            </div>
                          )
                        )
                      )}

                      <div className="comment-input">
                        <input
                          value={commentText}
                          onChange={(event) =>
                            setCommentText(
                              event.target.value
                            )
                          }
                          placeholder="Write a comment..."
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              submitComment();
                            }
                          }}
                        />

                        <button
                          onClick={submitComment}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </main>
      </div>

      {/* MOBILE WRITE */}
      <button
        className="mobile-write"
        onClick={() => {
          if (user) {
            openWriterEditor();
          } else {
            requireLogin(
              "Create an account to write and share your words."
            );
          }
        }}
      >
        ✎ Write
      </button>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Your journey starts here.</h2>

            <p>
              {loginReason ||
                "Create a free MusafirWords account to continue."}
            </p>

            <div className="modal-actions">
              <button
  className="google-btn"
  onClick={handleGoogleLogin}
>
  Continue with Google
</button>

              <button
                className="email-btn"
                onClick={() => {
                  alert(
                    "Email Login will be connected with Firebase in the next phase."
                  );
                }}
              >
                Continue with Email
              </button>

              <button
                className="close-btn"
                onClick={() => setShowLogin(false)}
              >
                Continue reading as guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WRITING EDITOR */}
      {showWriterEditor && (
        <div className="modal-backdrop">
          <div
            className="modal"
            style={{
              width: "min(700px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2>Create your writing</h2>

            <p>
              Let your words travel. Choose a type and write
              what you feel.
            </p>

            {/* TYPE */}
            <div style={{ marginBottom: "18px" }}>
              <label className="editor-label">
                Type
              </label>

              <select
                className="editor-select"
                value={writingType}
                onChange={(event) =>
                  setWritingType(event.target.value)
                }
              >
                <option>Shayari</option>
                <option>Poem</option>
                <option>Kavita</option>
                <option>Quote</option>
                <option>Line</option>
                <option>Thought</option>
                <option>Story</option>
                <option>Other</option>
              </select>
            </div>

            {/* TITLE */}
            <div style={{ marginBottom: "14px" }}>
              <label className="editor-label">
                Title
              </label>

              <input
                className="editor-input"
                value={writingTitle}
                onChange={(event) =>
                  setWritingTitle(event.target.value)
                }
                placeholder="Title (optional)"
                maxLength={120}
              />
            </div>

            {/* TEXT */}
            <div>
              <label className="editor-label">
                Your words
              </label>

              <textarea
                className="editor-textarea"
                value={writingText}
                onChange={(event) =>
                  setWritingText(event.target.value)
                }
                placeholder="Write your words..."
                maxLength={5000}
                rows={12}
              />

              <div
                style={{
                  textAlign: "right",
                  color: "#70707c",
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                {writingText.length} / 5000
              </div>
            </div>

            {/* PREVIEW */}
            {writingText.trim() && (
              <div
                style={{
                  marginTop: 20,
                  border: "1px solid #292932",
                  borderRadius: 14,
                  padding: 20,
                  background: "#0b0b10",
                }}
              >
                <div
                  style={{
                    color: "#8f8f9c",
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  PREVIEW · {writingType}
                </div>

                {writingTitle.trim() && (
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: 20,
                    }}
                  >
                    {writingTitle}
                  </h3>
                )}

                <div
                  style={{
                    whiteSpace: "pre-line",
                    fontFamily:
                      'Georgia, "Times New Roman", serif',
                    fontSize: 20,
                    lineHeight: 1.7,
                    color: "#eeeef2",
                  }}
                >
                  {writingText}
                </div>
              </div>
            )}

            {/* EDITOR BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                className="close-btn"
                onClick={closeWriterEditor}
              >
                Cancel
              </button>

              <button
                className="email-btn"
                onClick={handlePublishWriting}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShare && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Share this writing</h2>

            <p>
              Share the post link or create an image for your
              Story/Status.
            </p>

            <div className="share-options">
              <button
                className="share-option"
                onClick={() => copyLink(showShare)}
              >
                🔗 Copy post link
              </button>

              <button
                className="share-option"
                onClick={() => shareNative(showShare)}
              >
                📤 Share post
              </button>

              <button
                className="share-option"
                onClick={() => createImage(showShare)}
              >
                🖼️ Create image for Story / Status
              </button>

              <button
                className="close-btn"
                onClick={() => setShowShare(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS */}
      {shareStatus && (
        <div className="status">
          {shareStatus}
        </div>
      )}
    </div>
  );
}

export default App;