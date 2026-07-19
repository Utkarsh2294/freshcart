export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({ error: 'Validation failed', details });
    }

    if (source === 'query') {
      for (const key of Object.keys(req.query)) {
        delete req.query[key];
      }
      Object.assign(req.query, value);
    } else {
      req[source] = value;
    }
    next();
  };
};
