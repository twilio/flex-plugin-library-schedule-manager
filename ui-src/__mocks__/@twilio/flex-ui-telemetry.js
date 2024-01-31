module.exports = jest.fn().mockImplementation(() => ({
  track: jest.fn(),
  identify: jest.fn(),
  page: jest.fn(),
  group: jest.fn(),
}));