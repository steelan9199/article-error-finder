const axios = require("axios");
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
  console.log(sections[0]);
  return res;
}
async function getSection(section_id) {
  const url = config.url.first;
  const headers = config.headers.first;
  let res = await axios.post(
    url,
    {
      section_id: section_id
    },
    {
      headers: headers,
    }
  );
  const section = res.data.data.section;
  return section;
}
getFirst()
// const sections = res.data.sections;
// console.log(sections[0]);
