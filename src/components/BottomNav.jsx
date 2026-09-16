function BottomNav({ onAddBook }) {
  return (
    <nav className="bottom-nav">
      <button className="nav-item active">
        <span className="nav-icon">⌂</span>
        <span>Home</span>
      </button>

      <button className="nav-item add-nav-item" onClick={onAddBook}>
        <span className="add-icon">＋</span>
        <span>Toevoegen</span>
      </button>

      <button className="nav-item">
        <span className="nav-icon">👤</span>
        <span>Profiel</span>
      </button>
    </nav>
  )
}

export default BottomNav
