const apiUrl = 'http://localhost:8080'

export const completeMidi = async (tokens: string, instrument: string) => {
  const response = await fetch(`${apiUrl}/completeMidi`, {
    method: 'POST',
    body: JSON.stringify({ tokens, instrument }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();

  console.log(data)

  return data;
}

export const getMidiResponse = async (id: string) => {
  const response = await fetch(`${apiUrl}/token/${id}`);
  const data = await response.json();
  return data;
}
