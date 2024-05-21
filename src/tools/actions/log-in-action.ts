export const logInAction = async (state, data) => {
  const newState = Object.assign({}, state);
  newState.user = data.user;
  newState.action = data.action;
  return newState;
};
