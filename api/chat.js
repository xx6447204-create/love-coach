/// api/chat.js
// 这是一个运行在云端的 Vercel Serverless Function

const SYSTEM_PROMPT = `你是一位在 YouTube 拥有百万粉丝的顶级“硬核实战流恋爱社交导师”。你精通两性人际博弈。
请根据用户输入的女生的聊天话术，进行犀利的剖析并给出回应。

你必须严格返回一个标准的 JSON 对象，格式如下：
{
  "analysis": "这里填写对女生的潜台词破译，一针见血，分析她的动机和男生的博弈地位",
  "isTest": "明确说明这是否属于废物测试，如果是，写明她是在测试男生的什么特质；如果不是，写明社交信号",
  "replies": [
    { "style": "反向推拉/扣帽子", "content": "这里填写第一种幽默反调的话术内容" },
    { "style": "高框架反击", "content": "这里填写第二种拒绝自证清白、重拿主动权的话术内容" },
    { "style": "降维打击/出其不意", "content": "这里填写第三种跳出逻辑、展现核心自信的话术内容" }
  ]
}`;

export default async function handler(req, res) {
    // 允许跨域请求（方便前端调用）
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(455).json({ error: '只支持 POST 请求' });
    }

    const { userInput } = req.body;
    if (!userInput) {
        return res.status(400).json({ error: '缺少用户输入内容' });
    }

    // 从服务器环境变量中安全读取 API_KEY，前端绝对看不见！
    const API_KEY = process.env.DEEPSEEK_API_KEY; 
    
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                temperature: 0.8,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userInput }
                ]
            })
        });

        const resData = await response.json();
        const aiRawContent = resData.choices[0].message.content;
        const resultObject = JSON.parse(aiRawContent);

        return res.status(200).json({ success: true, data: resultObject });
    } catch (error) {
        return res.status(500).json({ success: false, error: '军师大脑塞车，请稍后再试' });
    }
}
