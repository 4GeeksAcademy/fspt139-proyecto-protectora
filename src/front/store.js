import { getToken, getUser } from "./services/authServices.js";

export const initialStore = () => {
  return {
    errorMessage: null,
    successMessage: null,
    user: getUser(),
    token: getToken(),
    shelterTypes: [],
    animalTypes: [],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set-success":
      return {
        ...store,
        successMessage: action.payload,
      };

    case "set-error":
      return {
        ...store,
        errorMessage: action.payload,
      };

    case "set_shelter_types":
      return {
        ...store,
        shelterTypes: action.payload,
      };

    case "set_animal_types":
      return {
        ...store,
        animalTypes: action.payload,
      };


    case "LOGIN":
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
      };

    case "LOGOUT":
      return {
        ...store,
        token: null,
        user: null,
      };

    case "set-user":
      return {
        ...store,
        user: action.payload,
      };

    default:
      throw Error("Unknown action.");
  }
}
