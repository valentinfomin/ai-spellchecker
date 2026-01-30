export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- Support Page Content ---
    if (path === '/support') {
        const supportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support - Local AI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2563eb;
            --bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
        }
        body { font-family: 'Inter', sans-serif; margin: 0; color: var(--text-main); line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; }
        
        nav { padding: 1.5rem 0; display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); }
        .logo { font-weight: 800; font-size: 1.25rem; color: var(--primary); text-decoration: none; }
        .nav-links a { margin-left: 1.5rem; color: var(--text-muted); text-decoration: none; font-weight: 500; }
        .nav-links a:hover { color: var(--primary); }

        h1 { font-size: 2.5rem; margin-top: 3rem; }
        h2 { margin-top: 2rem; }
        p { color: var(--text-muted); }
        
        .faq-item { margin-bottom: 1.5rem; border: 1px solid var(--border); padding: 1.5rem; border-radius: 8px; }
        .faq-question { font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main); }
        
        .btn-coffee {
            display: inline-block;
            background: #FFDD00;
            color: #000;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <nav>
            <a href="/" class="logo">⚡ Local AI</a>
            <div class="nav-links">
                <a href="/">Home</a>
                <a href="https://github.com/valentinfomin/ai-spellchecker">GitHub</a>
            </div>
        </nav>

        <h1>Support & FAQ</h1>
        <p>Need help with Local AI? Check the common issues below or reach out.</p>

        <h2>Common Issues</h2>
        
        <div class="faq-item">
            <div class="faq-question">❌ Error: WebGPU Context Lost</div>
            <p>This happens if your browser's graphics process crashes. To fix it, try closing and reopening the Side Panel. If that fails, restart your browser.</p>
        </div>

        <div class="faq-item">
            <div class="faq-question">❌ Model not loaded</div>
            <p>Make sure you clicked "Download & Load Model" in the side panel. The model files are large (~2GB) and need to finish downloading before use.</p>
        </div>

        <div class="faq-item">
            <div class="faq-question">⚠️ Brave Browser Issues</div>
            <p>Brave disables WebGPU by default. Go to <code>brave://flags</code> and enable "WebGPU Developer Features", then enable "Graphics Acceleration" in Settings.</p>
        </div>

        <h2>Contact</h2>
        <p>Found a bug? Please open an issue on our GitHub repository.</p>
        <p><a href="https://github.com/valentinfomin/ai-spellchecker/issues">Report an Issue on GitHub &rarr;</a></p>

        <hr style="margin: 3rem 0; border: 0; border-top: 1px solid var(--border);">

        <h2>Support the Project</h2>
        <p>Local AI is free and open source. If you find it useful, consider buying me a coffee to support development!</p>
        <a href="https://www.buymeacoffee.com/watchdogalert" class="btn-coffee" target="_blank">☕ Buy me a coffee</a>
        
        <br><br><br>
    </div>
</body>
</html>
        `;
        return new Response(supportHtml, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }

    // --- Main Landing Page Content ---
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local AI - Private, In-Browser Intelligence</title>
    <meta name="description" content="Privacy-first AI assistant running 100% locally in your browser. Spell check, grammar fixes, and page summarization without data tracking.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2563eb; /* Blue 600 */
            --primary-hover: #1d4ed8; /* Blue 700 */
            --bg: #ffffff;
            --bg-alt: #f8fafc; /* Slate 50 */
            --text-main: #0f172a; /* Slate 900 */
            --text-muted: #64748b; /* Slate 500 */
            --border: #e2e8f0; /* Slate 200 */
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'Inter', system-ui, sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            margin: 0;
            line-height: 1.6;
        }

        a { text-decoration: none; color: inherit; transition: 0.2s; }

        .container {
            max-width: 1024px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }

        /* Navbar */
        nav {
            padding: 1.25rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-weight: 800;
            font-size: 1.5rem;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .nav-links a {
            margin-left: 2rem;
            color: var(--text-muted);
            font-weight: 500;
            font-size: 0.95rem;
        }
        .nav-links a:hover { color: var(--primary); }

        /* Hero Section */
        .hero {
            padding: 5rem 0 3rem;
            text-align: center;
        }

        h1 {
            font-size: 3.5rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            color: var(--text-main);
        }

        h1 span {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero p {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 640px;
            margin: 0 auto 2.5rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.875rem 2rem;
            border-radius: 99px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.2s;
            cursor: pointer;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
        }
        .btn-primary:hover {
            background-color: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
        }

        .btn-outline {
            background: white;
            border: 1px solid var(--border);
            color: var(--text-main);
            margin-left: 1rem;
        }
        .btn-outline:hover {
            border-color: var(--text-muted);
            background-color: var(--bg-alt);
        }

        /* Screenshot Container */
        .browser-mockup {
            margin-top: 4rem;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border);
            overflow: hidden;
            background: white;
        }
        
        .browser-mockup img {
            display: block;
            width: 100%;
            height: auto;
        }

        /* Features Section */
        .section-bg {
            background-color: var(--bg-alt);
            padding: 5rem 0;
            margin-top: 5rem;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2.5rem;
        }

        .feature-card {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border);
            transition: transform 0.2s;
        }
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-md);
        }

        .icon {
            width: 48px;
            height: 48px;
            background: #eff6ff;
            color: var(--primary);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
        }

        h3 { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.75rem; }
        p { color: var(--text-muted); margin: 0; }

        /* Footer */
        footer {
            padding: 3rem 0;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.9rem;
        }
        
        .heart { color: #ef4444; }

        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .hero p { font-size: 1.1rem; }
            .btn { width: 100%; margin: 0.5rem 0 0; }
            .btn-outline { margin-left: 0; }
        }
    </style>
</head>
<body>

    <div class="container">
        <nav>
            <a href="/" class="logo">
                <span>⚡ Local AI</span>
            </a>
            <div class="nav-links">
                <a href="/support">Support</a>
                <a href="https://github.com/valentinfomin/ai-spellchecker">Source Code</a>
            </div>
        </nav>

        <section class="hero">
            <h1>Your Browser,<br><span>Now Intelligent.</span></h1>
            <p>Summarize webpages, fix grammar, and chat with your content—all while keeping your data 100% private on your device.</p>
            
            <div class="cta-buttons">
                <a href="#" class="btn btn-primary">Add to Chrome (Free)</a>
                <a href="https://github.com/valentinfomin/ai-spellchecker" class="btn btn-outline">View on GitHub</a>
            </div>

            <div class="browser-mockup">
                <img src="https://raw.githubusercontent.com/valentinfomin/ai-spellchecker/master/screenshots/screenshot1_spellcheck.png" alt="Local AI Interface">
            </div>
        </section>
    </div>

    <div class="section-bg">
        <div class="container">
            <div class="features-grid">
                <div class="feature-card">
                    <div class="icon">🔒</div>
                    <h3>Private by Design</h3>
                    <p>No cloud servers. No API keys. Your data stays on your computer using advanced WebGPU technology.</p>
                </div>
                <div class="feature-card">
                    <div class="icon">📝</div>
                    <h3>Smart Editor</h3>
                    <p>Context-aware spell check and grammar correction. Fix mistakes instantly with one click.</p>
                </div>
                <div class="feature-card">
                    <div class="icon">🧠</div>
                    <h3>Page Intelligence</h3>
                    <p>Chat with any webpage. Ask for summaries, key points, or specific details effortlessly.</p>
                </div>
            </div>
        </div>
    </div>

    <footer>
        <div class="container">
            <p>Open Source Project &bull; Built with <span class="heart">❤</span> by Michael & Co</p>
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
