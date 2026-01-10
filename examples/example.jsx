import React from 'react';

function Button({ label, onClick }) {
  return (
    <button className="btn btn-primary" onClick={onClick}>
      {label}
    </button>
  );
}

export default function App() {
  return (
    <div className="app">
      <h1>Welcome to React</h1>
      <Button label="Click Me" onClick={() => alert('Clicked!')} />
    </div>
  );
}
