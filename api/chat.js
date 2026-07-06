/ api/chat.js

export default async function handler(req, res) {
    // 1. 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: "只支持 POST 请求" });
    }

    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({ success: false, message: "内容不能为空" });
    }

    try {
        // 2. 调用 DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { 
                        role: 'system', 
                        content: '你是顶级恋爱军师。请分析用户输入的潜台词，判断是否为测试，并给出犀利、实用的回复。必须严格返回如下 JSON 格式：{"analysis": "简短犀利的潜台词分析", "isTest": "是/否", "replies": [{"style": "幽默风", "content": "..."}, {"style": "高冷风", "content": "..."}]}' 
                    },
                    { role: 'user', content: userInput }
                ],
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        
        // 3. 解析 AI 返回的 JSON 内容
        const aiContent = JSON.parse(data.choices[0].message.content);

        // 4. 返回给前端
        res.status(200).json({ 
            success: true, 
            data: aiContent 
        });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, message: "后端处理异常，请检查 API Key 或网络" });
    }
}