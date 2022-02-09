#ChangeLog Script

Create a "ReleaseNotes" folder in your repository and copy these files inside it.

Run from your root: 
* npm run getJiraReleaseNotes
* npm run getReleaseNotes

These two commands essentially return the changelog from last deploy.
In the package.json is specified the "releaseVersion" (add it if missing) which equals to the tag that should be added (manually) on master branch. Script will search merged pull requests from specified tag to HEAD.

The tag has the 'RD' prefix next to deploy's date, for example RD21.12.02

Each command log in console and write a file with changelog content in "{repo-path}/ReleaseNotes/log" folder.

Remember to add the new tag when pull request has been merged to master!

N.B. This script is based on Jira branch naming convention, it may cause unexpected results if you use different one. in particular "getJiraReleaseNotes" command return HTML log with Confluence template linking to related JIRA platform


##TODO
* add config file