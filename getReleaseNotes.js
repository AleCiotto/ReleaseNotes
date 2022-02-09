const { commitsData } = require('./getCommitsData');
const fs = require('fs');
const path = require('path');

// Beta - npm run getReleaseNotes -- --jira
const createJiraTemplate = process.argv.indexOf('--jira') != -1;

const createReleaseDayName = () => {
  const rdDate = new Date();
  const day = rdDate.getDate().toString().padStart(2, '0');
  const month = (rdDate.getMonth() + 1).toString().padStart(2, '0');
  const year = rdDate.getFullYear().toString().slice(2, 4);

  return `RD${year}.${month}.${day}`;
};

const createDirIfMissing = (dirPath) => {
  try {
    fs.accessSync(dirPath, fs.constants.F_OK | fs.constants.W_OK);
    // console.log(`${file} exists, and it is writable`);
    // directory already exists - do nothing
  } catch (err) {
    // console.log(`${dirPath} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`);
    try {
      fs.mkdirSync(dirPath);
    } catch (err) {
      if (err) throw err;
    }
  }
};

const writeLogFile = (logContent) => {
  const logDir = path.resolve(__dirname, 'log');
  createDirIfMissing(logDir);
  fs.writeFile(path.resolve(logDir, `${createReleaseDayName()}.html`), logContent, (err) => {
    if (err) throw err;
    console.log(`The RD${createReleaseDayName()} log file has been saved!`, '\n', logContent);
  });
};

const createTemplate = (array, name) => {
  if (array.length == 0) return '';

  if (createJiraTemplate) {
    return `
      <p>${name}</p>\n
      <ul>
      ${array.map(feature => {
      if (feature.jira === '|' || feature.pr === '|') {
        // console.log(feature, '\n');
        return `<li>${feature.pr} ${feature.jira} ${feature.name}</li>\n`;
      }

      return `
            <li>
              <ac:structured-macro ac:name="jira" ac:schema-version="1">
                <ac:parameter ac:name="server">NET-A-PORTER JIRA</ac:parameter>
                <ac:parameter ac:name="key">${feature.jira}</ac:parameter>
              </ac:structured-macro>
            </li>\n
          `;
    }).join('')}
      </ul>
    `;
  }

  return `${name}\n${array.map(feature => `${feature.pr} ${feature.jira} ${feature.name}\n`).join('')}`;
};

return commitsData().then(async data => {
  let featuresText = createTemplate(data.feature, 'Features');
  let bugfixText = createTemplate(data.bugfix, 'Bugfix');
  let hotfixText = createTemplate(data.hotfix, 'Hotfix');
  let othersText = createTemplate(data.others, 'Others');

  const commits = featuresText + bugfixText + hotfixText + othersText;
  writeLogFile(commits);
}).catch(error => {
  console.error(error);
});