/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  // Your code here
  const exec = require('child_process');
  
  const pull_commands = [
    'pull_request.opened',
    'pull_request.reopened',
    'pull_request.edited',
    'pull_request.synchronize',
  ];

  app.on(pull_commands, async (context) => {
    //const { token } = await context.octokit.auth({ type: "installation" })
    try {
      const branchName = context.payload.pull_request.head.ref;
      const owner = context.payload.repository.owner;
      const repo = context.payload.pull_request.head.repo;
      const repoName = context.payload.repository.name;
      const pullNumber = context.payload.number;
      //const files = await context.octokit.pulls.listFiles();
      // If the pull request has a Dockerfile, then lint it
      //if (files.some(file => { return file["filename"] === "Dockerfile";})) {
    
      const content = await context.octokit.repos.getContent(context.repo({
        path: "Dockerfile",
        ref: branchName
      }));
      
      const text = Buffer.from(content.data.content, 'base64').toString();

      function shellcmd() {
        try {
          return exec(`dockerfilelint '${text}'`).toString();
        } catch (error) {
          error.status;
          error.message; // Holds the message you typically want.
          error.stderr;  // Holds the stderr output. Use `.toString()`.
          error.stdout;  // Holds the stdout output. Use `.toString()`.
        }
      }

      const output = shellcmd();
      console.log(output);
      //const params = context.issue({ body: output });
      return context.octokit.issues.createComment({
        owner,
        repo,
        issue_number : pullNumber,
        body : output,
      });

    } catch (err) {
      //console.log(err);
    }

    //}
  
  });
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
