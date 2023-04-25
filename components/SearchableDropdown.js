import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: 'rgba(209, 213, 219, 1)',
    borderRadius: '0.375rem',
    padding: '0.25rem',
    borderWidth: '2px',
    width: '100%'
  }),
  
};

const SearchableDropdown = ({ tlds, onCheckboxChange }) => {
  const options = tlds.map((tld) => ({ value: tld, label: tld }));

  const handleChange = (selectedOptions) => {
    const newTlds = selectedOptions.map((option) => option.value);
    onCheckboxChange(newTlds);
  };

  return (
    <div>
      <Select
        options={options}
        isMulti
        onChange={handleChange}
        placeholder="Type to search"
        styles={customStyles}
      />
    </div>
  );
};

export default SearchableDropdown;
