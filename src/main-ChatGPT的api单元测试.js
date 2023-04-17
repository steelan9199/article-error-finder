const axios = require("axios");
const fs = require("fs");
const sanitize = require("sanitize-filename");
const { SocksProxyAgent } = require("socks-proxy-agent");
const config = require("./config");
const agent = new SocksProxyAgent(config.proxy);

const role = `
你是一个计算机专家, 你分析过很多的计算机相关的文章, 你的经验丰富, 现在你看到了别人写的一篇文章, 如果文章里面有错误, 请你把它指出来,
你要按照以下要求回复内容:
1. 返回的必须是markdown格式的内容
2. 必须包含这些标题, 分别是: 错误的所在的段落, 错误的理由, 改正错误的方法
以上是我想到的, 你可以自己再想想, 有什么要补充的你可以补充, 在符合我的要求的情况下, 你可以自己决定怎么做,
分割线下面是你要纠正的文章:
------------------------------------------------------------------------------\n\n
`;
async function getCompletions(prompt) {
  const data = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: role + prompt }],
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
  };
  try {
    const res = await axios.post("https://api.openai.com/v1/chat/completions", data, {
      headers: config.headers.chatgpt,
      httpsAgent: agent, // 设置代理
    });
    console.log(res.data.choices[0].message.content);
    return res.data;
  } catch (error) {
    console.log(error.message);
  }
}
const prompt = `
conso0le.log('hello world')
`;
getCompletions(prompt);
