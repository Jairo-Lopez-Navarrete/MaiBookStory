function BottomNav({
  onAddBook,
  currentPage,
  onPageChange,
}) {
  return (
    <nav className="bottom-nav journal-bottom-nav">
      <button
        className={
          currentPage === 'home'
            ? 'nav-item journal-nav-item active'
            : 'nav-item journal-nav-item'
        }
        onClick={() => onPageChange('home')}
      >
        <span className="nav-icon journal-nav-icon">
          ⌂
        </span>

        <span>Home</span>
      </button>

      <button
        className="nav-item add-nav-item journal-add-nav-item"
        onClick={onAddBook}
      >
        <span className="add-icon journal-add-icon">
          ＋
        </span>

        <span>Add</span>
      </button>

      <button
        className={
          currentPage === 'profile'
            ? 'nav-item journal-nav-item active'
            : 'nav-item journal-nav-item'
        }
        onClick={() => onPageChange('profile')}
      >
        <span className="nav-icon journal-nav-icon">
          👤
        </span>

        <span>Profile</span>
      </button>
    </nav>
  )
}

export default BottomNav