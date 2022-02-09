const commitsData = async () => {
  const pkgJson = require('./../package.json');
  const { exec } = require('child_process');

  let feature = [];
  let bugfix = [];
  let hotfix = [];
  let others = [];

  const execCommand = cmd => {
    return new Promise((resolve, reject) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(stdout);
      });
    });
  };

  const getDataFromCommit = commit => {
    // const re = /(?<pr>#\d+).*\/(?<jira>OMTB-[0-9]+)-(?<name>.+) to/;
    // const re = /(?<pr>#\d+)* in .* from (?:OMTB-[0-9]+\/)*(?<jira>OMTB-[0-9]+)*(?:-|\s)*(?<name>.+) to/;
    const re = /(?<pr>#\d+)* in .* from (?:[A-Za-z0-9]*\/)*(?:OMTB-[0-9]+\/)*(?<jira>OMTB-[0-9]+)*(?:-|\s)*(?<name>.+) to/;
    const result = re.exec(commit);

    return {
      pr: result?.groups.pr ?? '|',
      jira: result?.groups.jira ?? '|',
      name: result?.groups?.name ?? commit
    };
  };

  let fetchPromise = new Promise((resolve, reject) => {
    console.log('Fetching all branches from origin...');
    execCommand(`git fetch --all`).then(stdout => {
      console.log('\n');
      resolve(feature);
    }).catch(error => {
      console.log('Error in git fetch command', error);
    });;
  });

  let featurePromise = new Promise((resolve, reject) => {
    execCommand(`git log --merges RD${pkgJson.releaseVersion}..origin/HEAD --first-parent origin/develop --pretty=format:"%s" --grep=feature`).then(stdout => {
      for (const commit of stdout.split('\n')) {
        if (commit?.length > 0) feature.push(getDataFromCommit(commit));
      }

      resolve(feature);
    }).catch(error => {
      console.log('Error in git log feature command', error);
    });;
  });

  let bugfixPromise = new Promise((resolve, reject) => {
    execCommand(`git log --merges RD${pkgJson.releaseVersion}..origin/HEAD --first-parent origin/develop --pretty=format:"%s" --grep=bugfix`).then(stdout => {
      for (const commit of stdout.split('\n')) {
        if (commit?.length > 0) bugfix.push(getDataFromCommit(commit));
      }

      resolve(bugfix);
    }).catch(error => {
      console.log('Error in git log bugfix command', error);
    });;
  });

  const hotfixPromise = new Promise((resolve, reject) => {
    execCommand(`git log --merges RD${pkgJson.releaseVersion}..origin/HEAD --first-parent origin/develop --pretty=format:"%s" --grep=hotfix`).then(stdout => {
      for (const commit of stdout.split('\n')) {
        if (commit?.length > 0) hotfix.push(getDataFromCommit(commit));
      }

      resolve(hotfix);
    }).catch(error => {
      console.log('Error in git log hotfix command', error);
    });;
  });

  const othersPromise = new Promise((resolve, reject) => {
    execCommand(`git log --merges RD${pkgJson.releaseVersion}..origin/HEAD --first-parent origin/develop --pretty=format:"%s" --grep="bugfix|hotfix|feature" --extended-regexp --invert-grep`).then(stdout => {
      for (const commit of stdout.split('\n')) {
        if (commit?.length > 0) others.push(getDataFromCommit(commit));
      }

      resolve(others);
    }).catch(error => {
      console.log('Error in git log others command', error);
    });
  });

  // await fetchPromise;

  console.log(`Getting data between last release tag RD${pkgJson.releaseVersion} and origin/develop... \n\n`);

  return Promise.all([
    featurePromise,
    bugfixPromise,
    hotfixPromise,
    othersPromise
  ]).then(data => {
    return {
      feature,
      bugfix,
      hotfix,
      others
    };
  }).catch(error => {
    console.error(error);
    return {};
  });
};

module.exports.commitsData = commitsData;