import { useEffect, useState } from 'react'

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

function BookForm({
  book,
  selectedMonth,
  selectedYear,
  onAdd,
  onUpdate,
  onClose,
}) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [pages, setPages] = useState('')
  const [recommendedBy, setRecommendedBy] =
    useState('')
  const [genre, setGenre] = useState('')

  const [rating, setRating] = useState(0)
  const [plotRating, setPlotRating] =
    useState(0)
  const [writingRating, setWritingRating] =
    useState(0)
  const [contentRating, setContentRating] =
    useState(0)
  const [readabilityRating, setReadabilityRating] =
    useState(0)
  const [charactersRating, setCharactersRating] =
    useState(0)
  const [
    worldBuildingRating,
    setWorldBuildingRating,
  ] = useState(0)
  const [
    representationRating,
    setRepresentationRating,
  ] = useState(0)
  const [romanceRating, setRomanceRating] =
    useState(0)
  const [spiceRating, setSpiceRating] =
    useState(0)

  const [summary, setSummary] = useState('')
  const [tropes, setTropes] = useState('')
  const [review, setReview] = useState('')
  const [quotes, setQuotes] = useState('')

  const [cover, setCover] = useState('')
  const [coverPreview, setCoverPreview] =
    useState('')

  const isEditing = Boolean(book)

  useEffect(() => {
    if (book) {
      setTitle(book.title || '')
      setAuthor(book.author || '')
      setPages(book.pages || '')
      setRecommendedBy(
        book.recommended_by || '',
      )
      setGenre(book.genre || '')

      setRating(book.rating || 0)
      setPlotRating(book.plot_rating || 0)
      setWritingRating(
        book.writing_rating || 0,
      )
      setContentRating(
        book.content_rating || 0,
      )
      setReadabilityRating(
        book.readability_rating || 0,
      )
      setCharactersRating(
        book.characters_rating || 0,
      )
      setWorldBuildingRating(
        book.world_building_rating || 0,
      )
      setRepresentationRating(
        book.representation_rating || 0,
      )
      setRomanceRating(
        book.romance_rating || 0,
      )
      setSpiceRating(
        book.spice_rating || 0,
      )

      setSummary(book.summary || '')
      setTropes(book.tropes || '')
      setReview(book.review || '')
      setQuotes(book.quotes || '')

      setCover(book.cover || '')
      setCoverPreview(book.cover || '')
    } else {
      setTitle('')
      setAuthor('')
      setPages('')
      setRecommendedBy('')
      setGenre('')

      setRating(0)
      setPlotRating(0)
      setWritingRating(0)
      setContentRating(0)
      setReadabilityRating(0)
      setCharactersRating(0)
      setWorldBuildingRating(0)
      setRepresentationRating(0)
      setRomanceRating(0)
      setSpiceRating(0)

      setSummary('')
      setTropes('')
      setReview('')
      setQuotes('')

      setCover('')
      setCoverPreview('')
    }
  }, [book])

  function getExistingBookPeriod() {
    if (
      book?.reading_month &&
      book?.reading_year
    ) {
      return {
        month: Number(
          book.reading_month,
        ),
        year: Number(
          book.reading_year,
        ),
      }
    }

    if (book?.created_at) {
      const date = new Date(
        book.created_at,
      )

      return {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      }
    }

    return {
      month: selectedMonth,
      year: selectedYear,
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Kies een afbeelding.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setCover(reader.result)
      setCoverPreview(reader.result)
    }

    reader.readAsDataURL(file)

    event.target.value = ''
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim()) {
      alert('Vul een titel in.')
      return
    }

    if (!author.trim()) {
      alert('Vul een auteur in.')
      return
    }

    if (rating === 0) {
      alert(
        'Geef het boek een overall rating.',
      )
      return
    }

    const existingPeriod =
      getExistingBookPeriod()

    const bookData = {
      title: title.trim(),
      author: author.trim(),

      pages: pages
        ? Number(pages)
        : null,

      recommended_by:
        recommendedBy.trim() || null,

      genre: genre.trim() || null,

      rating,

      plot_rating:
        plotRating || null,

      writing_rating:
        writingRating || null,

      content_rating:
        contentRating || null,

      readability_rating:
        readabilityRating || null,

      characters_rating:
        charactersRating || null,

      world_building_rating:
        worldBuildingRating || null,

      representation_rating:
        representationRating || null,

      romance_rating:
        romanceRating || null,

      spice_rating:
        spiceRating || null,

      summary:
        summary.trim() || null,

      tropes:
        tropes.trim() || null,

      review:
        review.trim() || null,

      quotes:
        quotes.trim() || null,

      cover:
        cover ||
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',

      reading_month: isEditing
        ? existingPeriod.month
        : selectedMonth,

      reading_year: isEditing
        ? existingPeriod.year
        : selectedYear,
    }

    if (isEditing) {
      onUpdate({
        ...bookData,
        id: book.id,
      })
    } else {
      onAdd(bookData)
    }
  }

  function renderStars(value, setValue) {
    return (
      <div className="journal-rating-stars">
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <button
              key={number}
              type="button"
              className={
                number <= value
                  ? 'journal-star selected'
                  : 'journal-star'
              }
              onClick={() =>
                setValue(number)
              }
              aria-label={`${number} van 5`}
            >
              {number <= value
                ? '★'
                : '☆'}
            </button>
          ),
        )}
      </div>
    )
  }

  function renderPeppers(
    value,
    setValue,
  ) {
    return (
      <div className="journal-rating-stars journal-peppers">
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <button
              key={number}
              type="button"
              className={
                number <= value
                  ? 'journal-pepper selected'
                  : 'journal-pepper'
              }
              onClick={() =>
                setValue(number)
              }
              aria-label={`${number} van 5 spice`}
            >
              🌶️
            </button>
          ),
        )}
      </div>
    )
  }

  const displayMonth = isEditing
    ? getExistingBookPeriod().month
    : selectedMonth

  const displayYear = isEditing
    ? getExistingBookPeriod().year
    : selectedYear

  return (
    <div className="journal-form-overlay">
      <div className="journal-book-form">
        {/* HEADER */}

        <header className="journal-form-header">
          <div className="journal-form-header-stars">
            ✦ ✧
          </div>

          <button
            type="button"
            className="journal-form-back"
            onClick={onClose}
          >
            ←
          </button>

          <div className="journal-form-heading">
            <span>
              {isEditing
                ? 'my reading journal'
                : 'new book'}
            </span>

            <h2>
              {isEditing
                ? 'book review'
                : 'book review'}
            </h2>

            <p>
              {isEditing
                ? 'edit & keep track of your book'
                : 'add a new book to your library'}
            </p>
          </div>

          <button
            type="button"
            className="journal-form-close"
            onClick={onClose}
            aria-label="Sluiten"
          >
            ×
          </button>
        </header>

        {/* PERIODE */}

        <div className="journal-form-period">
          <span>reading month</span>

          <strong>
            {monthNames[displayMonth - 1]}
          </strong>

          <em>{displayYear}</em>
        </div>

        <form
          onSubmit={handleSubmit}
          className="journal-book-form-content"
        >
          {/* HOOFDGEDEELTE */}

          <section className="journal-review-main">
            {/* COVER */}

            <div className="journal-cover-section">
              <label
                className="journal-cover-frame"
                title="Cover kiezen"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt={`Cover van ${
                      title ||
                      'het boek'
                    }`}
                  />
                ) : (
                  <div className="journal-cover-placeholder">
                    📖
                    <span>
                      insert
                      <br />
                      book cover
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                />
              </label>

              <div className="journal-overall">
                <span>overall rating</span>

                {renderStars(
                  rating,
                  setRating,
                )}
              </div>
            </div>

            {/* BOEK INFO */}

            <div className="journal-book-details">
              <div className="journal-field">
                <label htmlFor="title">
                  title
                </label>

                <input
                  id="title"
                  type="text"
                  placeholder="Book title"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="journal-two-fields">
                <div className="journal-field">
                  <label htmlFor="author">
                    author
                  </label>

                  <input
                    id="author"
                    type="text"
                    placeholder="Author"
                    value={author}
                    onChange={(event) =>
                      setAuthor(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="journal-field">
                  <label htmlFor="pages">
                    nr. of pages
                  </label>

                  <input
                    id="pages"
                    type="number"
                    min="1"
                    placeholder="Pages"
                    value={pages}
                    onChange={(event) =>
                      setPages(
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="journal-two-fields">
                <div className="journal-field">
                  <label htmlFor="recommendedBy">
                    recommended by
                  </label>

                  <input
                    id="recommendedBy"
                    type="text"
                    placeholder="Who recommended it?"
                    value={
                      recommendedBy
                    }
                    onChange={(event) =>
                      setRecommendedBy(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="journal-field">
                  <label htmlFor="genre">
                    genre
                  </label>

                  <input
                    id="genre"
                    type="text"
                    placeholder="Genre"
                    value={genre}
                    onChange={(event) =>
                      setGenre(
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="journal-read-info">
                <span>
                  reading month
                </span>

                <strong>
                  {monthNames[
                    displayMonth - 1
                  ]}{' '}
                  {displayYear}
                </strong>
              </div>
            </div>

            {/* RATINGS */}

            <aside className="journal-ratings-panel">
              <div className="journal-panel-title">
                <span>book ratings</span>
                <small>
                  rate your reading
                </small>
              </div>

              <div className="journal-rating-row">
                <span>plot</span>
                {renderStars(
                  plotRating,
                  setPlotRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>writing</span>
                {renderStars(
                  writingRating,
                  setWritingRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>content</span>
                {renderStars(
                  contentRating,
                  setContentRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>
                  readability
                </span>
                {renderStars(
                  readabilityRating,
                  setReadabilityRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>
                  characters
                </span>
                {renderStars(
                  charactersRating,
                  setCharactersRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>
                  world building
                </span>
                {renderStars(
                  worldBuildingRating,
                  setWorldBuildingRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>
                  representation
                </span>
                {renderStars(
                  representationRating,
                  setRepresentationRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>romance</span>
                {renderStars(
                  romanceRating,
                  setRomanceRating,
                )}
              </div>

              <div className="journal-rating-row">
                <span>spice</span>
                {renderPeppers(
                  spiceRating,
                  setSpiceRating,
                )}
              </div>
            </aside>
          </section>

          {/* SUMMARY + TROPES */}

          <section className="journal-writing-columns">
            <div className="journal-writing-card">
              <div className="journal-writing-title">
                <span>01</span>
                <h3>summary</h3>
              </div>

              <textarea
                id="summary"
                rows="8"
                placeholder="Write your summary here..."
                value={summary}
                onChange={(event) =>
                  setSummary(
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="journal-writing-card">
              <div className="journal-writing-title">
                <span>02</span>
                <h3>tropes</h3>
              </div>

              <textarea
                id="tropes"
                rows="8"
                placeholder="Enemies to lovers, found family..."
                value={tropes}
                onChange={(event) =>
                  setTropes(
                    event.target.value,
                  )
                }
              />
            </div>
          </section>

          {/* REVIEW */}

          <section className="journal-writing-card journal-review-card">
            <div className="journal-writing-title">
              <span>03</span>
              <h3>review</h3>
            </div>

            <textarea
              id="review"
              rows="10"
              placeholder="Write your review here..."
              value={review}
              onChange={(event) =>
                setReview(
                  event.target.value,
                )
              }
            />
          </section>

          {/* QUOTES */}

          <section className="journal-writing-card journal-quotes-card">
            <div className="journal-writing-title">
              <span>04</span>
              <h3>quotes</h3>
            </div>

            <textarea
              id="quotes"
              rows="8"
              placeholder="Write your favourite quotes here..."
              value={quotes}
              onChange={(event) =>
                setQuotes(
                  event.target.value,
                )
              }
            />
          </section>

          {/* OPSLAAN */}

          <button
            type="submit"
            className="journal-save-button"
          >
            <span>✦</span>

            {isEditing
              ? 'save changes'
              : 'add book'}

            <span>✦</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookForm