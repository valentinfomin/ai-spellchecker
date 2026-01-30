export default {
  async fetch(request, env, ctx) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local AI - Private Browser Intelligence</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f4f4f9; color: #333; margin: 0; padding: 0; display: flex; flex-direction: column; min-height: 100vh; }
        header { background: #007bff; color: white; padding: 2rem 1rem; text-align: center; }
        h1 { margin: 0; font-size: 2.5rem; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; margin-top: 0.5rem; }
        main { flex: 1; max-width: 800px; margin: 2rem auto; padding: 0 1rem; text-align: center; }
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0.5rem; transition: background 0.2s; }
        .btn:hover { background: #0056b3; }
        .btn-github { background: #333; }
        .btn-github:hover { background: #000; }
        .features { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
        .feature { flex: 1; min-width: 200px; padding: 1rem; }
        footer { text-align: center; padding: 2rem; color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <header>
        <h1>Local AI</h1>
        <div class="subtitle">Private Spell Checker & Page Chat</div>
    </header>
    
    <main>
        <div class="card">
            <h2>AI running locally in your browser.</h2>
            <p>Fix grammar, summarize pages, and chat with your content using WebGPU. No data leaves your device.</p>
            <div style="margin-top: 1.5rem;">
                <a href="#" class="btn">Coming to Chrome Web Store</a>
                <a href="https://github.com/valentinfomin/ai-spellchecker" class="btn btn-github">View on GitHub</a>
            </div>
        </div>

        <div class="features">
            <div class="feature">
                <h3>🔒 Private</h3>
                <p>100% local inference. Your data never touches a server.</p>
            </div>
            <div class="feature">
                <h3>⚡ Fast</h3>
                <p>Powered by WebLLM and WebGPU for hardware acceleration.</p>
            </div>
            <div class="feature">
                <h3>🧠 Smart</h3>
                <p>Supports Llama-3, Phi-3, and other modern LLMs.</p>
            </div>
        </div>
    </main>

    <footer>
        &copy; ${new Date().getFullYear()} Local AI. Open Source Project.
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
