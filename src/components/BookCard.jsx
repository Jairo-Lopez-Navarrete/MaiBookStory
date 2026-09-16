function BookCard({ book, onEdit, onDelete }) {
  return (
    <article className="book-card">
      <div className="book-cover">
        <img src={book.cover} alt={`Cover van ${book.title}`} />
      </div>

      <div className="book-info">
        <div className="rating" aria-label={`Rating: ${book.rating} van 5`}>
          {'★'.repeat(book.rating)}
          {'☆'.repeat(5 - book.rating)}
        </div>

        <h3>{book.title}</h3>

        <p>{book.author}</p>

        <div className="book-actions">
          <button onClick={() => onEdit(book)}>Bewerken</button>

          <button
            className="delete-button"
            onClick={() => onDelete(book.id)}
          >
            Verwijderen
          </button>
        </div>
      </div>
    </article>
  )
}

export default BookCard
