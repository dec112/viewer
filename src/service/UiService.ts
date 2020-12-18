import copy from 'copy-to-clipboard';
import Snackbar from '../components/Snackbar/Snackbar';
import Messages from '../i18n/Messages';
import ConfigService from './ConfigService';
import { LocalizationService } from './LocalizationService';

export class UiService {
  private static INSTANCE: UiService;

  static getInstance = () => {
    if (!UiService.INSTANCE)
      UiService.INSTANCE = new UiService();

    return UiService.INSTANCE;
  }

  copyToClipboard = (text: string) => {
    const success = copy(text);
    const { formatMessage } = LocalizationService.getInstance();

    if (success) {
      const maxLength = parseInt(ConfigService.get('ui', 'copyToClipboard', 'preview', 'maxLength'));
      if (text.length > maxLength)
        text = text.substr(0, maxLength) + '...';

      Snackbar.success(formatMessage(Messages['copyToClipboard.success'], { message: text }) as string);
    }
    else
      Snackbar.error(formatMessage(Messages['copyToClipboard.error']) as string);
  }
}
