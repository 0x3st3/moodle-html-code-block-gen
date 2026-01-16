"""
Example Python module demonstrating syntax highlighting.
"""

import os
from typing import List, Optional

# Constants
MAX_RETRIES = 3
API_URL = "https://api.example.com"


@dataclass
class User:
    """A user model with basic attributes."""
    
    name: str
    email: str
    age: int = 0
    
    def greet(self) -> str:
        return f"Hello, {self.name}!"


def fibonacci(n: int) -> List[int]:
    """Generate Fibonacci sequence up to n numbers."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    
    return sequence


async def fetch_data(url: str) -> Optional[dict]:
    """Async function to fetch data from URL."""
    try:
        # Simulated async operation
        result = {"status": "success", "data": [1, 2, 3]}
        return result
    except Exception as e:
        print(f"Error: {e}")
        return None


if __name__ == "__main__":
    # Main entry point
    user = User(name="Alice", email="alice@example.com")
    print(user.greet())
    
    numbers = fibonacci(10)
    print(f"Fibonacci: {numbers}")
