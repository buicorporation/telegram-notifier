import { getInput, debug, setOutput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import sendMessage from './send-message';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';

const main = async (): Promise<void> => {
  try {
    const telegramToken = getInput('telegram_token', { required: true });
    const telegramCHatId = getInput('telegram_chat_id', { required: true });
    const telegramMessageThreadId = getInput('telegram_message_thread_id');

    if (context.eventName !== 'pull_request') {
      throw new Error('This action only works on pull_request events');
    }

    const payload = context.payload as PullRequestEvent;

    if (!telegramToken || !telegramCHatId) {
      throw new Error('bot_token and chat_id are required');
    }

    const uri = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const message = formatMessage(payload);

    await sendMessage(telegramCHatId, message, uri, telegramMessageThreadId);

    debug(`Message sent!`);
    setOutput('Finshed time', new Date().toTimeString());
  } catch (error) {
    console.error(error);

    if (error instanceof Error) setFailed(error.message);
  }
};

const formatMessage = (payload: PullRequestEvent): string => {
  let message: string;

  const { action, pull_request, repository, sender, number } = payload;
  const { name, owner } = repository;
  const { title, changed_files, additions, deletions } = pull_request;

  const prTitle = escapeMarkdown(title);
  const ownerName = escapeMarkdown(owner.login);
  const repoName = escapeMarkdown(name);
  const senderName = escapeMarkdown(sender.login);

  if (action === 'review_requested') {
    const { requested_reviewer } = payload;
    const { login: reviewer } = requested_reviewer;
    const reviewerName = escapeMarkdown(reviewer);

    message = `
    📝  *Review Request*  \\\#${number} \\\- [${ownerName}/${repoName}]\(https://github.com/${ownerName}/${repoName}/pull/${number}\)
 
    *Title:* ${prTitle}
    *Opened By:* [${senderName}](https://github.com/${senderName})
    *Reviewer:* [${reviewerName}](https://github.com/${reviewerName})
    
    Pull Request updated with:
    \\\- ${changed_files} changes
    \\\- ${additions} additions
    \\\- ${deletions} deletions
  `;

    console.debug('Message: ', message);

    return message;
  }

  if (action === 'opened') {
    message = `
    🔄 *Pull Request* \\\#${number} \\\- [${ownerName}/${repoName}]\(https://github.com/${ownerName}/${repoName}/pull/${number}\)
 
    *Title:* ${prTitle}
    *Opened By:* [${senderName}](https://github.com/${senderName})
    
    Pull Request updated with:
    \\\- ${changed_files} changes
    \\\- ${additions} additions
    \\- ${deletions} deletions
  `;

    console.debug('Message: ', message);

    return message;
  }

  throw new Error(`Unsupported action: ${action}`);
};

const escapeMarkdown = (text: string): string => {
  return text.replace(/([_*\[\]()~`>#+-=|{}\.!])/g, '\\$1');
};

// Call the main function to run the action
main();
