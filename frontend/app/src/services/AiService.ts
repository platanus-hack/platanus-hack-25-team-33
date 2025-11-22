const apiUrl = 'http://localhost:8080'

export const completeMidi = async (tokens: string) => {
  const response = await fetch(`${apiUrl}/completeMidi`, {
    method: 'POST',
    body: JSON.stringify({ tokens }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();

  console.log(data)

  return data;
}
