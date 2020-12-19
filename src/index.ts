const shareds = new Map();

export {
  shared,
  free,
  mock,
};

function mock<M>(Class: new () => M, mocked: M): M {
  shareds.set(Class, mocked);
  return mocked;
}

function shared<M>(Class: (new () => M) | (() => M)): M {
  let instance = shareds.get(Class);
  if (!instance) {
    instance = (typeof Class.prototype === "undefined")
          ? (Class as () => M)()
          : new (Class as new () => M)();
    shareds.set(Class, instance);
  }
  return instance;
}

function free() {
  try {
    shareds.forEach(instance => {
      instance && instance.destructor && instance.destructor();
    });
  } finally {
    shareds.clear();
  }
}
