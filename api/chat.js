<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>恋爱军师</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            background: #f8f9fa; 
            margin: 0; 
            padding: 0; 
        }
        .hero-section { 
            text-align: center; 
            padding: 60px 20px; 
            background-color: #ffffff; 
            border-bottom: 1px solid #eee; 
        }
        .brand-title { 
            font-size: 2.5rem; 
            color: #2D3436; 
            margin: 0; 
            letter-spacing: 2px; 
        }
        .slogan { 
            font-size: 1.2rem; 
            color: #636E72; 
            margin-top: 20px; 
            line-height: 1.6; 
        }
        .highlight { 
            color: #6C5CE7; 
            font-weight: 700; 
            border-bottom: 2px solid #6C5CE7; 
        }
        .main-container { 
            max-width: 600px; 
            margin: 40px auto; 
            padding: 0 20px; 
        }
        textarea { 
            width: 100%; 
            height: 120px; 
            padding: 15px; 
            border: 1px solid #ddd; 
            border-radius: 12px; 
            box-sizing: border-box; 
            font-size: 1rem; 
        }
        button { 
            width: 100%; 
            margin-top: 15px; 
            padding: 15px; 
            background: #6C5CE7; 
            color: white; 
            border: none; 
            border-radius: 12px; 
            cursor: pointer; 
            font-size: 1.1rem; 
            font-weight: bold; 
        }
        #result { 
            margin-top: 30px; 
            padding: 20px; 
            background: white; 
            border-radius: 12px; 
            border: 1px solid #eee; 
            white-space: pre-wrap; 
            color: #2D3436; 
            line-height: 1.6; 
        }
    </style>
</head>
<body>

    <header class="hero-section">
        <h1 class="brand-title">恋爱军师</h1>
        <p class="slogan">
            <span class="highlight">你的顶级僚机</span>，破译TA的<span class="highlight">潜台词</span>。
        </p>
    </header>

    <main class="main-container">
        <textarea id="userInput" placeholder="请输入对方发给你的话..."></textarea>
        <button onclick="getAdvice()">局势诊断</button>
        <div id="result">在这里查看军师的破译分析...</div>
    </main>

    <script>
        async function getAdvice() {
            const input = document.getElementById('userInput').value;
            const resultDiv = document.getElementById('result');
            if (!input) return alert("请先输入内容！");
            
            resultDiv.innerText = "军师正在深度破译中，请稍候...";

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userInput: input })
                });

                const data = await response.json();
                if (data.success) {
                    const d = data.data;
                    resultDiv.innerHTML = `<strong>【军师分析】</strong><br>${d.analysis}<br><br><strong>【测试类型】</strong><br>${d.isTest}<br><br><strong>【建议话术】</strong><br>${d.replies.map(r => `• [${r.style}] ${r.content}`).join('<br>')}`;
                } else {
                    resultDiv.innerText = "军师大脑塞车了，请检查 API 配置。";
                }
            } catch (e) {
                resultDiv.innerText = "网络连接异常，请重试。";
            }
        }
    </script>
</body>
</html>