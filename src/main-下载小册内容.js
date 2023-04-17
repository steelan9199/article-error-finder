const axios = require("axios");
const fs = require("fs");
const sanitize = require("sanitize-filename");

const config = require("./config");

async function getDir() {
  const url = config.url.目录;
  const headers = config.headers.目录;
  let res = await axios.post(
    url,
    {
      booklet_id: "7161370789680250917",
    },
    {
      headers: headers,
    }
  );
  const sections = res.data.data.sections;
  return sections;
}

async function getSection(section_id) {
  const url = config.url.first;
  const headers = config.headers.first;
  let res = await axios.post(
    url,
    {
      section_id: section_id,
    },
    {
      headers: headers,
    }
  );
  const section = res.data.data.section;
  return section;
}

async function downloadCourse() {
  const sections = await getDir();
  const dirPath = "./sections";
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  for (let i = 0; i < sections.length; i++) {
    const section = await getSection(sections[i].section_id);
    const filename = sanitize(sections[i].title) + ".md";
    fs.writeFileSync(dirPath + "/" + filename, section.markdown_show);
    console.log("Downloaded: " + filename);
  }
}

downloadCourse();
