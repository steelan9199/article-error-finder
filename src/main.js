// 分析小册错误
const axios = require("axios");
const fs = require("fs");
const sanitize = require("sanitize-filename");
const { SocksProxyAgent } = require("socks-proxy-agent");
const config = require("./config");
const agent = new SocksProxyAgent(config.proxy);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function findErrors() {
  const dirPath = "./sections";
  const errorsPath = "./errors";
  if (!fs.existsSync(errorsPath)) {
    fs.mkdirSync(errorsPath);
  }
  const files = fs.readdirSync(dirPath);
  for (let i = 0; i < files.length; i++) {
    const filePath = dirPath + "/" + files[i];
    console.log("filePath", filePath);
    if (fs.statSync(filePath).isFile()) {
      console.log("开始读取文件: ", filePath);
      const content = fs.readFileSync(filePath, "utf-8");
      const chunks = splitContent(content);
      let errors = "";
      for (let j = 0; j < chunks.length; j++) {
        // for (let j = 0; j < 1; j++) {
        console.log(files[i] + " j = " + j);
        if (chunks[j].trim().length < 1) {
          continue;
        }
        const errorText = await getCompletions(chunks[j]);
        console.log("ChatGPT的建议------------------------", errorText);
        errors += errorText + "\n\n";
      }
      console.log(files[i] + "处理完成------------------------------");
      if (errors !== "") {
        console.log("有错误");
        const filename = sanitize(files[i]);
        console.log("错误与信息, 写入文件filename", filename);
        fs.writeFileSync(errorsPath + "/" + filename, errors);
        console.log("Found errors in: " + filename);
      } else {
        console.log("没有错误");
      }
    }
  }
}

function splitContent(content) {
  const chunks = [];
  const lines = content.split("\n");
  let chunk = "";
  for (let i = 0; i < lines.length; i++) {
    if (chunk.length + lines[i].length + 1 <= 666) {
      chunk += lines[i] + "\n";
    } else {
      chunks.push(chunk);
      chunk = lines[i] + "\n";
    }
  }
  if (chunk !== "") {
    chunks.push(chunk);
  }
  return chunks;
}
const role = `
现在给你看一篇文章, 如果文章里面有错误, 请你把它指出来,
你要按照以下要求回复内容:
1. 生成的回复内容长度禁止超过1500个字, 如果超出了, 后面的内容丢弃, 此条规则, 优先级最高;
2. 返回的必须是markdown格式的内容
3. 必须包含这些标题, 分别是: 错误所在的段落, 错误的理由, 改正错误的方法
4. 其中, 标题为"错误误所在的段落", 写段落中的10个字即可
分割线后面是你要分析的文章内容, 请你分析文章, 并且把错误指出来, 并且按照我的要求回复.
-----------------------------------------------------------------------
`;
// 定义后缀
const suffix = `
-----------------------------------------------------------------------
请按照要求指出分割线中间的文章中的错误, 并且按照我的要求回复.
`;
async function getCompletions(prompt) {
  // console.log("等待三秒");
  // for (var i = 0; i < 3; i++) {
  //   await sleep(1000);
  //   console.log("等待了 " + (i + 1) + " 秒");
  // }
  console.log("prompt = ", prompt);
  // 打印prompt长度
  console.log("prompt.length = ", prompt.length);
  const data = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: role + prompt + suffix }],
    temperature: 0.7,
    max_tokens: 3000,
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
    return res.data.choices[0].message.content;
  } catch (error) {
    console.log(error?.response?.data?.error?.message);
    console.log("getCompletions 出错了: " + error?.message);
    return "chatgpt请求出错了";
  }
}

findErrors();
