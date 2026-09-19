const monthNames = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

function BookDetails({ book, onBack }) {
  if (!book) {
    return null
  }

  function getBookPeriod() {
    if (
      book.reading_month &&
      book.reading_year
    ) {
      return {
        month: Number(book.reading_month),
        year: Number(book.reading_year),
      }
    }

    if (book.created_at) {
      const date = new Date(book.created_at)

      return {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      }
    }

    return {
      month: null,
      year: null,
    }
  }

  function renderStars(value) {
    const rating = Number(value) || 0

    return (
      <div
        className="details-rating-stars"
        aria-label={`Rating: ${rating} van 5`}
      >
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <span
              key={number}
              className={
                number <= rating
                  ? 'details-star selected'
                  : 'details-star'
              }
            >
              {number <= rating
                ? '★'
                : '☆'}
            </span>
          ),
        )}
      </div>
    )
  }

  function renderPeppers(value) {
    const rating = Number(value) || 0

    return (
      <div
        className="details-rating-stars details-peppers"
        aria-label={`Spice rating: ${rating} van 5`}
      >
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <span
              key={number}
              className={
                number <= rating
                  ? 'details-pepper selected'
                  : 'details-pepper'
              }
            >
              🌶️
            </span>
          ),
        )}
      </div>
    )
  }

  const period = getBookPeriod()

  const readingMonth =
    period.month
      ? monthNames[period.month - 1]
      : null

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        <header className="book-details-header">
          <div className="book-details-header-stars">
            ✦ ✧
          </div>

          <button
            type="button"
            className="book-details-back"
            onClick={onBack}
            aria-label="Terug"
          >
            ←
          </button>

          <div className="book-details-heading">
            <span>my reading journal</span>

            <h2>book review</h2>

            <p>
              {book.title}
            </p>
          </div>

          <div className="book-details-header-stars-right">
            ✧ ✦
          </div>
        </header>

        {readingMonth && (
          <div className="book-details-period">
            <span>reading month</span>

            <strong>
              {readingMonth}
            </strong>

            <em>
              {period.year}
            </em>
          </div>
        )}

        <main className="book-details-content">
          <section className="book-details-main">
            <div className="book-details-cover-section">
              <div className="book-details-cover">
                <img
                  src={
                    book.cover ||
                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'
                  }
                  alt={`Cover van ${book.title}`}
                />
              </div>

              <div className="book-details-overall">
                <span>
                  overall rating
                </span>

                {renderStars(
                  book.rating,
                )}
              </div>
            </div>

            <div className="book-details-info">
              <div className="book-details-info-label">
                book information
              </div>

              <div className="book-details-info-row">
                <span>title</span>
                <strong>
                  {book.title || '—'}
                </strong>
              </div>

              <div className="book-details-info-row">
                <span>author</span>
                <strong>
                  {book.author || '—'}
                </strong>
              </div>

              <div className="book-details-info-row">
                <span>nr. of pages</span>
                <strong>
                  {book.pages || '—'}
                </strong>
              </div>

              <div className="book-details-info-row">
                <span>genre</span>
                <strong>
                  {book.genre || '—'}
                </strong>
              </div>

              <div className="book-details-info-row">
                <span>recommended by</span>
                <strong>
                  {book.recommended_by || '—'}
                </strong>
              </div>

              {readingMonth && (
                <div className="book-details-reading-badge">
                  <span>read in</span>

                  <strong>
                    {readingMonth}{' '}
                    {period.year}
                  </strong>
                </div>
              )}
            </div>

            <aside className="book-details-ratings">
              <div className="book-details-ratings-title">
                <span>
                  book ratings
                </span>

                <small>
                  {book.title}
                </small>
              </div>

              <div className="book-details-rating-row">
                <span>plot</span>
                {renderStars(
                  book.plot_rating,
                )}
              </div>

              <div className="book-details-rating-row">
                <span>writing</span>
                {renderStars(
                  book.writing_rating,
                )}
              </div>

              <div className="book-details-rating-row">
                <span>content</span>
                {renderStars(
                  book.content_rating,
                )}
              </div>

              <div className="book-details-rating-row">
                <span>readability</span>
                {renderStars(
                  book.readability_rating,
                )}
              </div>

              <div className="book-details-rating-row">
                <span>characters</span>
                {renderStars(
                  book.characters_rating,
                )}
              </div>

              <div className="book-details-rating-row">
                <span>world building</span>
                {renderStars(
                  book.world_building_rating,
                )}
              </div>

              <div className="book-details-rating-row">
                <span>romance</span>
                {renderStars(
                  book.romance_rating,
                )}
              </div>

              <div className="book-details-rating-row">
                <span>spice</span>
                {renderPeppers(
                  book.spice_rating,
                )}
              </div>
            </aside>
          </section>

          <section className="book-details-writing-columns">
            <article className="book-details-writing-card">
              <div className="book-details-writing-title">
                <span>01</span>
                <h3>summary</h3>
              </div>

              <div className="book-details-text">
                {book.summary ? (
                  <p>{book.summary}</p>
                ) : (
                  <span className="book-details-empty">
                    No added summary.
                  </span>
                )}
              </div>
            </article>

            <article className="book-details-writing-card">
              <div className="book-details-writing-title">
                <span>02</span>
                <h3>tropes</h3>
              </div>

              <div className="book-details-text">
                {book.tropes ? (
                  <p>{book.tropes}</p>
                ) : (
                  <span className="book-details-empty">
                    No added tropes.
                  </span>
                )}
              </div>
            </article>
          </section>

          <section className="book-details-writing-card book-details-review-card">
            <div className="book-details-writing-title">
              <span>03</span>
              <h3>review</h3>
            </div>

            <div className="book-details-text">
              {book.review ? (
                <p>{book.review}</p>
              ) : (
                <span className="book-details-empty">
                  No added review.
                </span>
              )}
            </div>
          </section>

          <section className="book-details-writing-card book-details-quotes-card">
            <div className="book-details-writing-title">
              <span>04</span>
              <h3>quotes</h3>
            </div>

            <div className="book-details-text">
              {book.quotes ? (
                <p>{book.quotes}</p>
              ) : (
                <span className="book-details-empty">
                  No favorite added quotes.
                </span>
              )}
            </div>
          </section>

          <div className="book-details-footer">
            <span>✦</span>
            <p>
              a little piece of her reading journal
            </p>
            <span>✦</span>
          </div>
        </main>
      </div>
    </div>
  )
}

export default BookDetails