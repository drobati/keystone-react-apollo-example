import React from 'react';

import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";

const client = new ApolloClient({
  uri: 'http://localhost:3001/admin/api',
  cache: new InMemoryCache()
});

const TODOS = gql`
  {
    allTodos {
      name
      id
    }
  }
`;

const REMOVE_TODO = gql`
  mutation RemoveTodo($id: ID!) {
    deleteTodo(id: $id) {
      name
      id
    }
  }
`;

const DeleteButton = ({id}) => {
  const [deleteTodo] = useMutation(REMOVE_TODO);

  const deleteTodoItem = () => {
    deleteTodo({ 
      variables: { id }, 
      update: cache => {
        const { allTodos } = cache.readQuery({ query: TODOS });
        const newTodos = allTodos.filter(({id: itemId}) => itemId !== id)
        cache.writeQuery({
          query: TODOS, 
          data: { allTodos: newTodos }
        });
      }
    })
  };
  return (
    <button className="remove-item" onClick={deleteTodoItem}>
      <svg viewBox="0 0 14 16" className="delete-icon">
        <title>Delete this item</title>
        <path
          fillRule="evenodd"
          d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"
        />
      </svg>
    </button>
  );
};

const GET_TODOS = gql`
  query GetTodos {
    allTodos {
      name
      id
    }
  }
`;

const TodoList = () => {
  const { loading, error, data } = useQuery(GET_TODOS);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <ul className="list">
      { data.allTodos.map(({ name, id }, index) => (
        <li className="list-item" key={index}>
          {name}
          <DeleteButton id={id}/>
        </li>
      )) }
    </ul>
  )
};

const ADD_TODO = gql`
  mutation AddTodo($name: String!) {
    createTodo(data: { name: $name }) {
      name
      id
    }
  }
`;

const AddTodo = () => {
  let input;
  const [createTodo] = useMutation(ADD_TODO,
    {
      update(cache, { data: { createTodo } }) {
        const { allTodos } = cache.readQuery({ query: TODOS });
        cache.writeQuery({
          query: TODOS,
          data: { allTodos: allTodos.concat([createTodo]) },
        });
      }
    }
  );

  const addTodoForm = e => {
    e.preventDefault();
    createTodo({ variables: { name: input.value } });
    input.value = '';
  }

  return (
    <form onSubmit={addTodoForm}>
      <input 
        ref={node => {
            input = node;
          }}
        required
        name="add-item"
        placeholder="Add new item"
        className="form-input add-item" />
    </form>
  )
};

const Todo = () =>(
  <>
    <h1 className="main-heading">TODO List</h1>
    <div className="form-wrapper">
      <div>
        <AddTodo />
      </div>
      <div className="results">
        <TodoList />
      </div>
    </div>
  </>
);

const App = () => (
  <ApolloProvider client={client}>
    <div className="app">
      <Todo />
    </div>
  </ApolloProvider>
);

export default App;
