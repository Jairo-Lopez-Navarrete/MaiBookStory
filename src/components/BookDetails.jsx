function BookDetails({ book, onBack }) {
  function renderStars(value) {
    const rating = Number(value) || 0

    return (
      <div className="details-rating">
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </div>
    )
  }

  function renderPeppers(value) {
    const rating = Number(value) || 0

    return (
      <div className="details-rating details-peppers">
        {[1, 2, 3, 4, 5].map((number) => (
          <span
            key={number}
            className={
              number <= rating
                ? 'pepper-active'
                : 'pepper-inactive'
            }
          >
            🌶️
          </span>
        ))}
      </div>
    )
  }

  return (
    <main className="book-details-page">
      <div className="book-details-header">
        <button
          type="button"
          className="book-details-back"
          onClick={onBack}
        >
          ← Terug
        </button>

        <h2>Boekdetails</h2>
      </div>

      <section className="book-details-top">
        <div className="book-details-cover">
          {book.cover ? (
            <img
              src={book.cover}
              alt={`Cover van ${book.title}`}
            />
          ) : (
            <span>📖</span>
          )}
        </div>

        <div className="book-details-basic">
          <h1>{book.title}</h1>

          <p className="book-details-author">
            {book.author}
          </p>

          <div className="book-details-overall">
            {renderStars(book.rating)}
          </div>

          {book.pages && (
            <p>
              <strong>Pages:</strong>{' '}
              {book.pages}
            </p>
          )}

          {book.recommended_by && (
            <p>
              <strong>Recommended by:</strong>{' '}
              {book.recommended_by}
            </p>
          )}

          {book.genre && (
            <p>
              <strong>Genre:</strong>{' '}
              {book.genre}
            </p>
          )}
        </div>
      </section>

      <section className="book-details-ratings">
        <h3>Book Ratings</h3>

        <div className="details-rating-row">
          <span>Plot</span>
          {renderStars(book.plot_rating)}
        </div>

        <div className="details-rating-row">
          <span>Writing</span>
          {renderStars(book.writing_rating)}
        </div>

        <div className="details-rating-row">
          <span>Content</span>
          {renderStars(book.content_rating)}
        </div>

        <div className="details-rating-row">
          <span>Readability</span>
          {renderStars(book.readability_rating)}
        </div>

        <div className="details-rating-row">
          <span>Characters</span>
          {renderStars(book.characters_rating)}
        </div>

        <div className="details-rating-row">
          <span>World building</span>
          {renderStars(book.world_building_rating)}
        </div>

        <div className="details-rating-row">
          <span>Representation</span>
          {renderStars(book.representation_rating)}
        </div>

        <div className="details-rating-row">
          <span>Romance</span>
          {renderStars(book.romance_rating)}
        </div>

        <div className="details-rating-row">
          <span>Spice</span>
          {renderPeppers(book.spice_rating)}
        </div>
      </section>

      {book.summary && (
        <section className="book-details-section">
          <h3>Summary</h3>
          <p>{book.summary}</p>
        </section>
      )}

      {book.tropes && (
        <section className="book-details-section">
          <h3>Tropes</h3>
          <p>{book.tropes}</p>
        </section>
      )}

      {book.review && (
        <section className="book-details-section">
          <h3>Review</h3>
          <p>{book.review}</p>
        </section>
      )}

      {book.quotes && (
        <section className="book-details-section">
          <h3>Quotes</h3>
          <p className="book-details-quotes">
            {book.quotes}
          </p>
        </section>
      )}
    </main>
  )
}

export default BookDetails