import React from 'react';
import Messages from '../../i18n/Messages';
import { LocalizationService, UiService } from '../../service';
import { Button } from '../Button';
import { IconText, IconType } from '../Icon';
import ModalDialog from '../ModalDialog/ModalDialog';

interface IProps {
  exportTypes: IExportType[],
  className?: string,
};

interface IExportType {
  text: string,
  icon: IconType,
  callback: () => void,
}

export const ExportTypePrint = (): IExportType => ({
  text: LocalizationService.getInstance().formatMessage(Messages.print) as string,
  icon: IconType.PRINT,
  callback: () => window.print(),
});

export const ExportTypeCopyToClipboard = (toCopy: string): IExportType => ({
  text: LocalizationService.getInstance().formatMessage(Messages.copyToClipboard) as string,
  icon: IconType.COPY,
  callback: () => UiService.getInstance().copyToClipboard(toCopy),
});

export const ExportButton: React.FunctionComponent<IProps> = ({
  exportTypes,
  className,
}) => {
  const showDialog = () => {
    const dialog = ModalDialog.alert(
      <div>
        {exportTypes.map((exportType, idx) => {
          return (
            <Button
              key={`exportType-${idx}`}
              onClick={() => {
                dialog.close();
                exportType.callback();
              }}>
              <IconText type={exportType.icon}>
                {exportType.text}
              </IconText>
            </Button>
          )
        })}
      </div>
    );
  }

  return (
    <Button
      className={className}
      onClick={() => showDialog()}>
      <IconText type={IconType.EXPORT}>
        {LocalizationService.getInstance().formatMessage(Messages.export)}
      </IconText>
    </Button>
  );
}