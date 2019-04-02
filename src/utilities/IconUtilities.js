import classNames from 'classnames';

class IconUtilities {
  static getIconClassNames(icon) {
    if (icon) {
      if (icon.startsWith('fa-')) {
        return classNames('fa', icon);
      } else {
        return classNames('glyphicon', 'glyphicon-' + icon);
      }
    } else {
      return null;
    }
  }
}

export default IconUtilities;
