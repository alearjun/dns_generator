import React, { useState } from 'react';
import styles from './spinner.module.css';

const Home = () => {
  const [keywords, setKeywords] = useState('');
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tlds, setTlds] = useState({ com: true, net: true, org: true, io: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const selectedTlds = Object.entries(tlds)
      .filter(([key, value]) => value)
      .map(([key]) => key)
      .join(',');

    try {
      const response = await fetch(`/api/generate-domains?keywords=${keywords}&tlds=${selectedTlds}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from API:', errorText);
        setLoading(false);
        return;
      }
      const data = await response.json();

      console.log("API response:", data);

      setDomains(data.domains);
    } catch (error) {
      console.error('Error in API call:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setTlds({ ...tlds, [e.target.name]: e.target.checked });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full md:w-3/4 lg:w-1/2">
        <h1 className="text-3xl font-bold mb-6 text-center">53Names Generator</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="keywords" className="font-semibold">Keywords:</label>
            <input
              type="text"
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
              className="border-2 border-gray-300 p-2 rounded-md w-2/3 focus:border-blue-300"
            />
          </div>
          <div className="flex flex-wrap">
            {['com', 'net', 'org', 'io'].map((tld) => (
              <label key={tld} className="flex items-center mr-4">
                <input
                  type="checkbox"
                  name={tld}
                  checked={tlds[tld]}
                  onChange={handleCheckboxChange}
                  className="mr-1"
                />
                .{tld}
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md w-full hover:bg-blue-700 relative h-12"
            disabled={loading}
          >
            {loading ? (
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={styles.spinner}></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                Generate Domain Names
              </div>
            )}
          </button>
        </form>
        {/* Display the table of available domains. */}
        <table className="w-full mt-8" id="domain-table">
          <thead>
            <tr>
              <th className="font-semibold text-left border-b-2 border-gray-300">Domain Name</th>
              <th className="font-semibold text-left border-b-2 border-gray-300">Availability</th>
            </tr>
          </thead>
          <tbody>
            {domains.filter((domain) => domain.Available).map((domain) => (
              <tr key={domain.Name} className="border-b-2 border-gray-200">
                <td className="py-2">{domain.Name}</td>
                <td><span role="img" aria-label="Checkmark">&#9989;</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
