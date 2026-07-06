function SearchBar({ search, setSearch, category, setCategory }) {
  const categories = ['All', 'Music', 'Tech', 'Sports', 'Business', 'Art', 'Other'];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder="Search events by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 p-2 border rounded"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="p-2 border rounded"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
}

export default SearchBar;