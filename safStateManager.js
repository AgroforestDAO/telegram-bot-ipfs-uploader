// safStateManager.js

const safStates = new Map();

function setSafState(userId, safId) {
 safStates.set(userId, safId);
}

function getSafState(userId) {
 return safStates.get(userId);
}

module.exports = { setSafState, getSafState };
