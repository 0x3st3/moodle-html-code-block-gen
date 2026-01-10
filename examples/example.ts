interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): User {
  return {
    id,
    name: "John Doe",
    email: "john@example.com"
  };
}

const user: User = getUser(1);
console.log(`User: ${user.name}`);
