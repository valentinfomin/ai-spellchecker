export default {
  async fetch(request, env, ctx) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local AI - Private Browser Intelligence</title>
    <meta name="description" content="Privacy-first AI spell checker and webpage summarizer running 100% locally using WebGPU.">
    <style>
        :root {
            --primary: #2563eb; /* Royal Blue */
            --primary-dark: #1d4ed8;
            --bg: #0f172a; /* Slate 900 */
            --text: #f8fafc; /* Slate 50 */
            --text-muted: #94a3b8; /* Slate 400 */
            --card-bg: #1e293b; /* Slate 800 */
            --border: #334155; /* Slate 700 */
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }

        a { text-decoration: none; color: inherit; transition: 0.2s; }

        /* Layout */
        .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }

        /* Header */
        header {
            padding: 1.5rem 0;
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(12px);
            z-index: 10;
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-weight: 800;
            font-size: 1.25rem;
            background: linear-gradient(135deg, #60a5fa, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-links a {
            margin-left: 1.5rem;
            color: var(--text-muted);
            font-weight: 500;
            font-size: 0.9rem;
        }
        .nav-links a:hover { color: var(--text); }

        /* Hero */
        .hero {
            padding: 6rem 0 4rem;
            text-align: center;
        }

        h1 {
            font-size: 3.5rem;
            font-weight: 800;
            letter-spacing: -0.025em;
            margin-bottom: 1.5rem;
            line-height: 1.1;
        }

        h1 span {
            color: var(--primary);
        }

        .hero p {
            color: var(--text-muted);
            font-size: 1.25rem;
            max-width: 600px;
            margin: 0 auto 2.5rem;
        }

        .cta-group {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.2s;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }
        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .btn-secondary {
            background: var(--card-bg);
            border: 1px solid var(--border);
            color: var(--text);
        }
        .btn-secondary:hover {
            border-color: var(--text-muted);
        }

        /* Features */
        .features {
            padding: 4rem 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .feature-card {
            background: var(--card-bg);
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid var(--border);
        }

        .feature-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
            display: inline-block;
            background: rgba(37, 99, 235, 0.1);
            padding: 0.5rem;
            border-radius: 8px;
        }

        h3 { font-size: 1.25rem; margin: 0 0 0.5rem; }
        p { color: var(--text-muted); margin: 0; }

        /* Preview Section */
        .preview {
            margin: 4rem 0;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
            border: 1px solid var(--border);
            position: relative;
            padding-bottom: 56.25%; /* 16:9 Aspect Ratio placeholder */
        }
        
        .preview-placeholder {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(to bottom right, var(--card-bg), var(--bg));
            color: var(--text-muted);
            font-size: 1.5rem;
        }

        /* Footer */
        footer {
            border-top: 1px solid var(--border);
            padding: 2rem 0;
            margin-top: 4rem;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        @media (max-width: 640px) {
            h1 { font-size: 2.5rem; }
            .cta-group { flex-direction: column; }
        }
    </style>
</head>
<body>

<header>
    <div class="container">
        <nav>
            <a href="#" class="logo">Local AI</a>
            <div class="nav-links">
                <a href="https://github.com/valentinfomin/ai-spellchecker">GitHub</a>
                <a href="#">Chrome Web Store</a>
            </div>
        </nav>
    </div>
</header>

<div class="container">
    <section class="hero">
        <h1>Private Intelligence.<br><span>Running Locally.</span></h1>
        <p>Fix grammar, summarize webpages, and chat with your content using local LLMs inside your browser. No data leaves your device.</p>
        
        <div class="cta-group">
            <a href="#" class="btn btn-primary">Add to Chrome</a>
            <a href="https://github.com/valentinfomin/ai-spellchecker" class="btn btn-secondary">View Source</a>
        </div>
    </section>

    <div class="preview">
        <div class="preview-placeholder">
            <!-- You can replace this with an <img> tag pointing to your screenshot URL later -->
            <img src="https://raw.githubusercontent.com/valentinfomin/ai-spellchecker/master/screenshots/screenshot1_spellcheck.png" 
                 alt="App Screenshot" 
                 style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;">
        </div>
    </div>

    <section class="features">
        <div class="feature-card">
            <span class="feature-icon">🔒</span>
            <h3>100% Private</h3>
            <p>Your data never touches a server. All AI inference happens directly on your device using WebGPU.</p>
        </div>
        <div class="feature-card">
            <span class="feature-icon">⚡</span>
            <h3>Instant Analysis</h3>
            <p>Chat with any webpage. Summarize articles, ask questions, and extract insights in seconds.</p>
        </div>
        <div class="feature-card">
            <span class="feature-icon">📝</span>
            <h3>Smart Correction</h3>
            <p>Context-aware spell checking and grammar fixing. Replace text instantly with a single click.</p>
        </div>
    </section>
</div>

<footer>
    <div class="container">
        <p>&copy; ${new Date().getFullYear()} Local AI. Open Source Project by Valentin Fomin.</p>
    </div>
</footer>

</body>
</html>
    `;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};