import React from 'react';

const SearchBar = ({ placeholder, onSearch, value, onChange }) => {
  return (
    <div className="search-bar mb-3">
      <div className="input-group">
        <span className="input-group-text">
          <i className="fas fa-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
        />
        <button className="btn btn-primary" onClick={onSearch}>
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;