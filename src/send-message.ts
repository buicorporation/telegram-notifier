import axios from 'axios';

/**
 * Send a Telegram message on pull request event.
 *
 * @param chatId id of targeted chat gorup or channel.
 * @param message the message to be sent.
 * @param uri telegram api to send request to.
 * @param messageThreadId telegram message thread id.
 */
const sendMessage = (chatId: string, message: string, uri: string, messageThreadId?: string): Promise<any> => {
  if (!messageThreadId) {
    return axios.post(uri, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdownv2',
      disable_notification: false,
      disable_web_page_preview: true,
    });
  } else {
    return axios.post(uri, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdownv2',
      message_thread_id: messageThreadId,
      disable_notification: false,
      disable_web_page_preview: true,
    });
  }
};

export default sendMessage;
