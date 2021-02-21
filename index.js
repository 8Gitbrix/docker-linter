/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  // Your code here
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);
  
  const pull_commands = [
    'pull_request.opened',
    'pull_request.reopened',
    'pull_request.edited',
    'pull_request.synchronize',
  ];

  app.on(pull_commands, async (context) => {
    exec('dockerfilelint Dockerfile', (err, stdout, stderr) => {
      if (err) {
        console.log(err);
      } else {
        params = context.pullRequest({ body: stdout });
        return context.octokit.pulls.createReview(params);
      }
    });
  });

  app.on("issues.opened", async (context) => {
    try {
      const { stdout, stderr } = await exec('dockerfilelint Dockerfile');
      const params = context.issue({ body: stdout });
      return context.octokit.issues.createComment(params);

    } catch (err) {
      console.error(err);
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
