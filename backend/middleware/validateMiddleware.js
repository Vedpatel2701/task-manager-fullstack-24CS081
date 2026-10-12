function validateBody(requiredFields) {
  return (req, res, next) => {
    const missingField = requiredFields.find((field) => {
      const value = req.body[field];
      return typeof value !== 'string' || !value.trim();
    });

    if (missingField) {
      return res.status(400).json({ message: `${missingField} is required` });
    }

    next();
  };
}

module.exports = { validateBody };
