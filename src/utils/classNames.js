export default function classNames(...args) {
  const classes = [];

  args.forEach(item => {
    if (!item) {
      return;
    }

    if (item instanceof Array) {
      item.forEach(klass => classes.push(klass));
    } else if (item instanceof Object) {
      Object.entries(item).forEach(([klass, condition]) => {
        if (condition) {
          classes.push(klass);
        }
      });
    } else {
      classes.push(item);
    }
  });

  return classes.join(' ');
}
