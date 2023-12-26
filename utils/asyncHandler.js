const asyncHandler = (func) => {
  return (req, res) => {
    func(req, res).catch((error) => {
      res.status(500).send({ message: error.message });
    });
  };
};

module.exports = asyncHandler;
