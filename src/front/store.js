import { getToken } from "./services/authServices.js";

export const initialStore = () => {
  return {
    message: null,
    shelterTypes: [],
    animalTypes: [],
    token: getToken(),
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
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

    case "add_task":
      const { id, color } = action.payload;

      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo,
        ),
      };

    case "LOGIN":
      return {
        ...store,
        token: action.payload,
      };

    case "LOGOUT":
      return {
        ...store,
        token: null,
      };

    default:
      throw Error("Unknown action.");
  }
}
