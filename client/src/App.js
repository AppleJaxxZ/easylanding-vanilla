import { useEffect } from 'react';
import axios from 'axios';
function App() {
  const get = async () => {
    const { data } = await axios.get('/api/hello');
    console.log('data', data);
  };
  useEffect(() => {
    get();
  }, []);

  return <div className="App">hello world</div>;
}

export default App;
