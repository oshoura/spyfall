/**
 * Generates a random alphanumeric code of specified length
 * @param {number} length - Length of the code to generate
 * @returns {string} - Random alphanumeric code
 */
function generateCode(length = 6) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters (0, O, 1, I)
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

module.exports = { generateCode }; 