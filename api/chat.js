// api/chat.js

function detectScene(text) {
    const input = text.toLowerCase();

    // 冷淡回复
    const coldKeywords = [
        "嗯",
        "哦",
        "噢",
        "行",
        "随便",
        "哈哈",
        "呵呵"
    ];

    // 疲惫场景
    const fatigueKeywords = [
        "累",
        "加班",
        "困",
        "睡觉",
        "疲惫",
        "忙死",
        "忙疯"
    ];

    if (coldKeywords.some(word => input.includes(word))) {
        return "cold_reply";
    }

    if (fatigueKeywords.some(word => input.includes(word))) {
        return "share_fatigue";
    }

    return "general";
}

function buildConvOSPrompt(userInput, scene) {

    let sceneInstruction = "";

    if (scene === "cold_reply") {
        sceneInstruction = `
场景：对方回复比较简短。

目标：
- 不追问
- 不分析原因
- 保持轻松
- 给对方空间

避免：
- 怎么了？
- 为什么这么冷淡？
- 你是不是不开心？
`;
    }

    if (scene === "share_fatigue") {
        sceneInstruction = `
场景：对方表达疲惫。

目标：
- 接住情绪
- 表达关心
- 不给建议
- 不追问

避免：
- 为什么累？
- 早点睡
- 多喝热水
`;
    }

    if (scene === "general") {
        sceneInstruction = `
场景：普通聊天。

目标：
- 自然
- 真诚
- 像真人
`;
    }

    return `
你是 Conversation Coach（聊天教练）。

你的职责：

帮助用户表达真实想表达的话。

不是分析师。
不是情感导师。
不是心理学家。

【核心原则】

自然 > 精彩

真诚 > 套路

简短 > 长篇分析

${sceneInstruction}

请返回 JSON：

{
  "scene":"${scene}",
  "replies":[
    {
      "style":"自然",
      "content":"..."
    },
    {
      "style":"轻松",
      "content":"..."
    },
    {
      "style":"温柔",
      "content":"..."
    }
  ]
}

用户输入：

${userInput}
`;
}

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: "只支持 POST 请求"
        });
    }

    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({
            success: false,
            message: "内容不能为空"
        });
    }

    try {

        const scene = detectScene(userInput);

        const response = await fetch(
            "https://api.deepseek.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: buildConvOSPrompt(userInput, scene)
                        },
                        {
                            role: "user",
                            content: userInput
                        }
                    ],
                    response_format: {
                        type: "json_object"
                    }
                })
            }
        );

        const data = await response.json();

        let aiContent;

        try {
            aiContent = JSON.parse(
                data.choices[0].message.content
            );
        } catch (e) {

            aiContent = {
                scene,
                replies: [
                    {
                        style: "自然",
                        content: "收到啦"
                    },
                    {
                        style: "轻松",
                        content: "慢慢来"
                    },
                    {
                        style: "温柔",
                        content: "别给自己太大压力"
                    }
                ]
            };
        }

        return res.status(200).json({
            success: true,
            data: aiContent
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "服务器异常"
        });

    }

}